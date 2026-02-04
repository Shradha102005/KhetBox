from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random
import asyncio
import json
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (default to local for easier local development)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
db = client[db_name]

app = FastAPI(title="Khetbox Dashboard API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sensor state (simulated IoT data)
class SensorState:
    def __init__(self):
        self.temperature = 4.4
        self.humidity = 61.0
        self.battery = 61.0
        self.storage_used = 61.0
        self.solar_active = True
        self.door_open = False
        self.door_open_time = None
        self.last_update = datetime.now(timezone.utc)
    
    def update(self):
        # Smooth realistic changes
        self.temperature += random.uniform(-0.3, 0.3)
        self.temperature = max(2.0, min(8.5, self.temperature))
        
        self.humidity += random.uniform(-2, 2)
        self.humidity = max(40, min(85, self.humidity))
        
        self.battery += random.uniform(-0.5, 0.3) if not self.solar_active else random.uniform(0.1, 0.5)
        self.battery = max(20, min(95, self.battery))
        
        self.storage_used += random.uniform(-0.1, 0.2)
        self.storage_used = max(50, min(75, self.storage_used))
        
        # Solar status changes occasionally
        if random.random() < 0.05:
            self.solar_active = not self.solar_active
        
        # Door occasionally opens
        if random.random() < 0.02:
            self.door_open = True
            self.door_open_time = datetime.now(timezone.utc)
        elif self.door_open and random.random() < 0.3:
            self.door_open = False
            self.door_open_time = None
        
        self.last_update = datetime.now(timezone.utc)
    
    def to_dict(self):
        return {
            "temperature": round(self.temperature, 1),
            "humidity": round(self.humidity, 0),
            "battery": round(self.battery, 0),
            "storage_used": round(self.storage_used, 0),
            "solar_active": self.solar_active,
            "door_open": self.door_open,
            "door_open_duration": (datetime.now(timezone.utc) - self.door_open_time).seconds if self.door_open and self.door_open_time else 0,
            "last_update": self.last_update.isoformat()
        }

sensor_state = SensorState()

# Models
class User(BaseModel):
    email: str
    password: str
    role: str = "farmer"
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class SensorData(BaseModel):
    temperature: float
    humidity: float
    battery: float
    storage_used: float
    solar_active: bool
    door_open: bool
    door_open_duration: int
    last_update: str

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    severity: str
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    acknowledged: bool = False

class StorageInfo(BaseModel):
    name: str
    type: str
    temperature_range: str
    humidity_control: bool
    current_temp: float
    current_humidity: float
    crops: List[dict]

class CCTVStream(BaseModel):
    id: str
    name: str
    location: str
    url: str
    status: str
    last_active: str

class DailyReport(BaseModel):
    date: str
    avg_temperature: float
    min_temperature: float
    max_temperature: float
    avg_humidity: float
    avg_battery: float
    alerts_count: int
    uptime_percentage: float

# Mock users
# Mock users for demo/fallback (passwords stored as hashes)
# For local/demo use we store mock passwords in plaintext to avoid
# initializing passlib/bcrypt at import time (which can fail on some environments).
# The login path will handle either plaintext or hashed passwords.
MOCK_USERS = {
    "farmer@khetbox.com": {"password": "farmer123", "role": "farmer", "name": "Ramesh Kumar", "hashed": False},
    "admin@khetbox.com": {"password": "admin123", "role": "admin", "name": "Admin User", "hashed": False}
}

# WebSocket connections
connected_clients: List[WebSocket] = []

# Generate alerts based on sensor data
def generate_alerts(data: dict) -> List[dict]:
    alerts = []
    
    if data["temperature"] > 8:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "critical",
            "message": f"Temperature Critical: {data['temperature']}°C exceeds safe limit (8°C)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    elif data["temperature"] > 6:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "warning",
            "message": f"Temperature Warning: {data['temperature']}°C approaching limit",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    
    if data["battery"] < 25:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "critical",
            "message": f"Battery Critical: {data['battery']}% - Charge immediately!",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    elif data["battery"] < 40:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "warning",
            "message": f"Battery Low: {data['battery']}% remaining",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    
    if data["humidity"] > 80:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "warning",
            "message": f"High Humidity: {data['humidity']}% - Check ventilation",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    
    if data["door_open"] and data["door_open_duration"] > 300:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "warning",
            "message": f"Door Open: Container door has been open for {data['door_open_duration'] // 60} minutes",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False
        })
    
    if not alerts:
        alerts.append({
            "id": str(uuid.uuid4()),
            "severity": "normal",
            "message": "All systems operating normally",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": True
        })
    
    return alerts

# Generate 24h historical data
def generate_historical_data():
    data = []
    now = datetime.now(timezone.utc)
    base_temp = 4.4
    base_humidity = 61
    
    for i in range(24):
        hour = now - timedelta(hours=23-i)
        temp_variation = random.uniform(-1.5, 1.5)
        humidity_variation = random.uniform(-8, 8)
        
        data.append({
            "hour": hour.strftime("%H:00"),
            "timestamp": hour.isoformat(),
            "temperature": round(base_temp + temp_variation, 1),
            "humidity": round(base_humidity + humidity_variation, 0),
            "battery": round(61 + random.uniform(-10, 10), 0)
        })
    
    return data

# Routes
@api_router.get("/")
async def root():
    return {"message": "Khetbox Dashboard API", "version": "1.0.0"}

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    # Validate password length before attempting to verify (bcrypt has 72-byte limit)
    try:
        pw_bytes_len = len(request.password.encode('utf-8'))
    except Exception:
        pw_bytes_len = len(request.password)
    
    if pw_bytes_len > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 bytes)")
    
    # Prefer database-backed users
    try:
        db_user = await db.users.find_one({"email": request.email})
        if db_user:
            try:
                stored_hash = db_user.get("password", "")
                if stored_hash and bcrypt.checkpw(request.password.encode('utf-8'), stored_hash.encode('utf-8') if isinstance(stored_hash, str) else stored_hash):
                    return {
                        "success": True,
                        "user": {
                            "email": db_user.get("email"),
                            "role": db_user.get("role", "farmer"),
                            "name": db_user.get("name", db_user.get("email"))
                        },
                        "token": f"mock-token-{uuid.uuid4()}"
                    }
            except Exception as ve:
                logger.warning(f"Password verification failed: {ve}")
                raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"DB login check failed: {e}")

    # Fallback: check in-memory mock users (supports plaintext or hashed)
    user = MOCK_USERS.get(request.email)
    if user:
        stored = user.get("password", "")
        is_hashed = user.get("hashed", False) or (isinstance(stored, str) and stored.startswith("$"))
        try:
            if is_hashed:
                if bcrypt.checkpw(request.password.encode('utf-8'), stored.encode('utf-8') if isinstance(stored, str) else stored):
                    return {
                        "success": True,
                        "user": {"email": request.email, "role": user.get("role", "farmer"), "name": user.get("name", request.email)},
                        "token": f"mock-token-{uuid.uuid4()}"
                    }
            else:
                # plaintext comparison for local/dev mocks
                if request.password == stored:
                    return {
                        "success": True,
                        "user": {"email": request.email, "role": user.get("role", "farmer"), "name": user.get("name", request.email)},
                        "token": f"mock-token-{uuid.uuid4()}"
                    }
        except Exception:
            # If verify fails for any reason, don't crash the app; fallback to rejecting credentials
            logger.exception("Password verification failed for mock user")

    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/auth/signup")
async def signup(user: User):
    # Prevent duplicate users in mock store
    if user.email in MOCK_USERS:
        raise HTTPException(status_code=400, detail="User already exists")

    # Check DB for existing user. If DB is unreachable, fall back to in-memory mock store.
    db_available = True
    try:
        existing = await db.users.find_one({"email": user.email})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
    except Exception as e:
        db_available = False
        logger.warning(f"DB check for existing user failed, falling back to mock users: {e}")

    # Hash password and insert into DB
    try:
        # Validate password length (bcrypt has 72-byte limit)
        try:
            pw_bytes_len = len(user.password.encode('utf-8'))
        except Exception:
            pw_bytes_len = len(user.password)
        
        if pw_bytes_len > 72:
            raise HTTPException(status_code=400, detail="Password too long (max 72 bytes). Please use a shorter password.")
        
        logger.info(f"Hashing password for user: {user.email}")
        hashed_pwd = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        logger.info(f"Password hashed successfully")

        if db_available:
            try:
                await db.users.insert_one({
                    "email": user.email,
                    "password": hashed_pwd,
                    "role": user.role,
                    "name": user.name or user.email
                })
                logger.info(f"Created user in DB: {user.email}")
            except Exception as e:
                # If insert fails, log but continue to add to mock store so signup can succeed locally
                logger.warning(f"DB insert failed, storing user only in mock users: {e}")
                db_available = False

        # Always add to in-memory mock users for quick local testing (and when DB is down)
        MOCK_USERS[user.email] = {"password": hashed_pwd, "role": user.role, "name": user.name or user.email, "hashed": True}

        return {"success": True, "message": "User created"}
    except HTTPException:
        raise
    except ValueError as ve:
        logger.error(f"Password hashing failed: {ve}")
        raise HTTPException(status_code=400, detail="Invalid password format")
    except Exception as e:
        logger.exception(f"Failed to create user: {e}")
        raise HTTPException(status_code=500, detail="Signup failed: internal error")

@api_router.get("/status")
async def get_status():
    # Update in-memory sensor state
    sensor_state.update()
    
    # Update MongoDB with latest sensor data
    try:
        sensor_doc = sensor_state.to_dict()
        await db.sensors.update_one(
            {"device_id": "khetbox-001"},
            {"$set": {**sensor_doc, "last_update": datetime.now(timezone.utc)}},
            upsert=True
        )
    except Exception as e:
        logger.warning(f"Failed to update sensors collection: {e}")
    
    return sensor_state.to_dict()

@api_router.get("/storage")
async def get_storage():
    try:
        # Get storage units from MongoDB
        storage_list = await db.storage.find({"device_id": "khetbox-001"}).to_list(length=10)
        
        if not storage_list:
            logger.warning("No storage units found in DB")
            return {"storage_units": []}
        
        # Convert ObjectId to string for JSON serialization
        for unit in storage_list:
            if '_id' in unit:
                del unit['_id']
            if 'created_at' in unit and isinstance(unit['created_at'], datetime):
                unit['created_at'] = unit['created_at'].isoformat()
        
        return {"storage_units": storage_list}
    except Exception as e:
        logger.error(f"Error fetching storage from DB: {e}")
        # Fallback to sensor data if DB fails
        sensor_data = sensor_state.to_dict()
        return {
            "storage_units": [
                {
                    "name": "Cold Storage Unit A",
                    "type": "cold",
                    "temperature_range": "2-8°C",
                    "current_temp": sensor_data["temperature"],
                    "current_humidity": sensor_data["humidity"]
                }
            ]
        }

@api_router.get("/alerts")
async def get_alerts():
    try:
        # Get alerts from MongoDB
        alerts_list = await db.alerts.find({"device_id": "khetbox-001"}).sort("timestamp", -1).to_list(length=100)
        
        # Convert ObjectId and datetime for JSON
        for alert in alerts_list:
            if '_id' in alert:
                del alert['_id']
            if 'timestamp' in alert and isinstance(alert['timestamp'], datetime):
                alert['timestamp'] = alert['timestamp'].isoformat()
        
        critical_count = sum(1 for a in alerts_list if a.get("severity") == "critical")
        warning_count = sum(1 for a in alerts_list if a.get("severity") == "warning")
        
        return {
            "alerts": alerts_list,
            "total_count": len(alerts_list),
            "critical_count": critical_count,
            "warning_count": warning_count
        }
    except Exception as e:
        logger.error(f"Error fetching alerts from DB: {e}")
        # Fallback to generated alerts
        sensor_data = sensor_state.to_dict()
        alerts = generate_alerts(sensor_data)
        return {
            "alerts": alerts,
            "total_count": len(alerts),
            "critical_count": sum(1 for a in alerts if a["severity"] == "critical"),
            "warning_count": sum(1 for a in alerts if a["severity"] == "warning")
        }

@api_router.get("/reports/daily")
async def get_daily_reports():
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Get report from MongoDB
        report = await db.reports.find_one({"date": today, "device_id": "khetbox-001"})
        
        if report:
            # Clean up for JSON serialization
            if '_id' in report:
                del report['_id']
            if 'created_at' in report and isinstance(report['created_at'], datetime):
                report['created_at'] = report['created_at'].isoformat()
            
            return report
        else:
            # Generate and save new report if doesn't exist
            historical = generate_historical_data()
            temps = [d["temperature"] for d in historical]
            humidities = [d["humidity"] for d in historical]
            batteries = [d["battery"] for d in historical]
            
            new_report = {
                "date": today,
                "device_id": "khetbox-001",
                "summary": {
                    "avg_temperature": round(sum(temps) / len(temps), 1),
                    "min_temperature": round(min(temps), 1),
                    "max_temperature": round(max(temps), 1),
                    "avg_humidity": round(sum(humidities) / len(humidities), 0),
                    "avg_battery": round(sum(batteries) / len(batteries), 0),
                    "alerts_count": random.randint(2, 8),
                    "uptime_percentage": 99.7
                },
                "hourly_data": historical,
                "charts": {
                    "temperature_trend": historical,
                    "humidity_trend": historical
                },
                "created_at": datetime.now(timezone.utc)
            }
            
            await db.reports.insert_one(new_report)
            del new_report['_id']
            return new_report
    except Exception as e:
        logger.error(f"Error fetching reports from DB: {e}")
        # Fallback to generated report
        historical = generate_historical_data()
        temps = [d["temperature"] for d in historical]
        humidities = [d["humidity"] for d in historical]
        batteries = [d["battery"] for d in historical]
        
        return {
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "summary": {
                "avg_temperature": round(sum(temps) / len(temps), 1),
                "min_temperature": round(min(temps), 1),
                "max_temperature": round(max(temps), 1),
                "avg_humidity": round(sum(humidities) / len(humidities), 0),
                "avg_battery": round(sum(batteries) / len(batteries), 0),
                "alerts_count": random.randint(2, 8),
                "uptime_percentage": 99.7
            },
            "hourly_data": historical,
            "charts": {
                "temperature_trend": historical,
                "humidity_trend": historical
            }
        }

@api_router.get("/cctv/streams")
async def get_cctv_streams():
    try:
        # Get CCTV streams from MongoDB
        streams = await db.cctv_streams.find({"device_id": "khetbox-001"}).to_list(length=10)
        
        # Clean up for JSON serialization
        for stream in streams:
            if '_id' in stream:
                del stream['_id']
            if 'last_active' in stream and isinstance(stream['last_active'], datetime):
                stream['last_active'] = stream['last_active'].isoformat()
            if 'created_at' in stream:
                del stream['created_at']
        
        return {"streams": streams}
    except Exception as e:
        logger.error(f"Error fetching CCTV streams from DB: {e}")
        # Fallback to hardcoded streams
        now = datetime.now(timezone.utc).isoformat()
        return {
            "streams": [
                {
                    "id": "cam-inside-01",
                    "name": "Inside Camera",
                    "location": "Storage Container Interior",
                    "url": "https://placeholder-stream-inside.khetbox.local/live",
                    "status": "active",
                    "last_active": now
                },
                {
                    "id": "cam-outside-01",
                    "name": "Outside Camera",
                    "location": "Container Exterior & Entrance",
                    "url": "https://placeholder-stream-outside.khetbox.local/live",
                    "status": "active",
                    "last_active": now
                }
            ]
        }

@api_router.get("/reports/export-pdf")
async def export_report_pdf():
    """Export daily report as PDF"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Get report from MongoDB
        report = await db.reports.find_one({"date": today, "device_id": "khetbox-001"})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Create PDF in memory
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#059669'),
            spaceAfter=12
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#059669'),
            spaceAfter=10
        )
        
        # Title
        elements.append(Paragraph("KhetBox Daily Report", title_style))
        elements.append(Paragraph(f"Date: {report['date']}", styles['Normal']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Summary section
        elements.append(Paragraph("Daily Summary", heading_style))
        summary = report.get('summary', {})
        summary_data = [
            ['Metric', 'Value'],
            ['Average Temperature', f"{summary.get('avg_temperature', 0)}°C"],
            ['Min Temperature', f"{summary.get('min_temperature', 0)}°C"],
            ['Max Temperature', f"{summary.get('max_temperature', 0)}°C"],
            ['Average Humidity', f"{summary.get('avg_humidity', 0)}%"],
            ['Average Battery', f"{summary.get('avg_battery', 0)}%"],
            ['Total Alerts', str(summary.get('alerts_count', 0))],
            ['Uptime', f"{summary.get('uptime_percentage', 0)}%"],
        ]
        
        summary_table = Table(summary_data, colWidths=[3 * inch, 2 * inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')]),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Hourly data section
        elements.append(Paragraph("Hourly Data", heading_style))
        hourly = report.get('hourly_data', [])
        
        if hourly:
            hourly_data = [['Hour', 'Temperature (°C)', 'Humidity (%)', 'Battery (%)']]
            for h in hourly[:24]:  # Limit to 24 hours
                hourly_data.append([
                    h.get('hour', ''),
                    str(h.get('temperature', 0)),
                    str(h.get('humidity', 0)),
                    str(h.get('battery', 0))
                ])
            
            hourly_table = Table(hourly_data, colWidths=[1.2 * inch, 1.5 * inch, 1.5 * inch, 1.3 * inch])
            hourly_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')]),
            ]))
            
            elements.append(hourly_table)
        
        # Footer
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(
            f"Report Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
            styles['Italic']
        ))
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        
        filename = f"khetbox-daily-report-{report['date']}.pdf"
        
        return StreamingResponse(
            iter([pdf_buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        logger.exception(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@api_router.get("/capacity")
async def get_capacity():
    sensor_data = sensor_state.to_dict()
    total_capacity = 2000
    used_percentage = sensor_data["storage_used"]
    used_kg = round(total_capacity * used_percentage / 100)
    
    return {
        "total_capacity_kg": total_capacity,
        "used_kg": used_kg,
        "available_kg": total_capacity - used_kg,
        "used_percentage": used_percentage,
        "breakdown": [
            {"name": "Tomatoes", "kg": 450, "color": "#EF4444", "icon": "🍅"},
            {"name": "Rice", "kg": 650, "color": "#F59E0B", "icon": "🍚"},
            {"name": "Chillies", "kg": 280, "color": "#10B981", "icon": "🌶️"},
            {"name": "Wheat", "kg": 420, "color": "#3B82F6", "icon": "🌾"},
            {"name": "Other", "kg": used_kg - 1800, "color": "#6366F1", "icon": "📦"}
        ]
    }

# WebSocket for real-time updates
@app.websocket("/ws/sensors")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(connected_clients)}")
    
    try:
        while True:
            sensor_state.update()
            data = sensor_state.to_dict()
            data["alerts"] = generate_alerts(data)
            await websocket.send_json(data)
            await asyncio.sleep(8)  # Update every 8 seconds
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(connected_clients)}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in connected_clients:
            connected_clients.remove(websocket)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_check():
    try:
        # Try a lightweight command to ensure the DB is reachable
        await client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {mongo_url}, DB: {db_name}")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB at {mongo_url}: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
