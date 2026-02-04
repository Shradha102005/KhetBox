"""
Initialize MongoDB collections for KhetBox.
Creates: sensors, alerts, reports, storage, cctv_streams
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid

load_dotenv(Path(__file__).parent / 'backend' / '.env')

async def init_db():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    
    print(f"\n=== Initializing {db_name} collections ===\n")
    
    # 1. Sensors collection (live sensor data)
    print("Creating sensors collection...")
    sensors_coll = db['sensors']
    try:
        await sensors_coll.drop()
    except:
        pass
    
    sensor_doc = {
        "device_id": "khetbox-001",
        "temperature": 4.4,
        "humidity": 61.0,
        "battery": 61.0,
        "storage_used": 61.0,
        "solar_active": True,
        "door_open": False,
        "door_open_time": None,
        "last_update": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    }
    result = await sensors_coll.insert_one(sensor_doc)
    print(f"  ✓ Created with ID: {result.inserted_id}")
    
    # 2. Alerts collection
    print("Creating alerts collection...")
    alerts_coll = db['alerts']
    try:
        await alerts_coll.drop()
    except:
        pass
    
    alert_doc = {
        "id": str(uuid.uuid4()),
        "severity": "normal",
        "message": "All systems operating normally",
        "timestamp": datetime.now(timezone.utc),
        "acknowledged": True,
        "device_id": "khetbox-001"
    }
    result = await alerts_coll.insert_one(alert_doc)
    print(f"  ✓ Created with ID: {result.inserted_id}")
    
    # 3. Reports collection (daily reports)
    print("Creating reports collection...")
    reports_coll = db['reports']
    try:
        await reports_coll.drop()
    except:
        pass
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report_doc = {
        "date": today,
        "device_id": "khetbox-001",
        "avg_temperature": 4.4,
        "min_temperature": 3.5,
        "max_temperature": 5.3,
        "avg_humidity": 61.0,
        "avg_battery": 61.0,
        "alerts_count": 1,
        "uptime_percentage": 99.7,
        "hourly_data": [],
        "created_at": datetime.now(timezone.utc)
    }
    result = await reports_coll.insert_one(report_doc)
    print(f"  ✓ Created with ID: {result.inserted_id}")
    
    # 4. Storage collection (storage units/containers)
    print("Creating storage collection...")
    storage_coll = db['storage']
    try:
        await storage_coll.drop()
    except:
        pass
    
    now = datetime.now(timezone.utc).isoformat()
    storage_docs = [
        {
            "name": "Cold Storage Unit A",
            "type": "cold",
            "temperature_range": "2-8°C",
            "humidity_control": True,
            "current_temp": 4.4,
            "current_humidity": 61.0,
            "device_id": "khetbox-001",
            "crops": [
                {"name": "Tomatoes", "quantity": 450, "unit": "kg", "icon": "🍅"},
                {"name": "Chillies", "quantity": 280, "unit": "kg", "icon": "🌶️"},
                {"name": "Leafy Greens", "quantity": 180, "unit": "kg", "icon": "🥬"}
            ],
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Dry Storage Unit B",
            "type": "dry",
            "temperature_range": "15-25°C",
            "humidity_control": True,
            "current_temp": 22.5,
            "current_humidity": 45.0,
            "device_id": "khetbox-001",
            "crops": [
                {"name": "Rice", "quantity": 650, "unit": "kg", "icon": "🍚"},
                {"name": "Wheat", "quantity": 420, "unit": "kg", "icon": "🌾"},
                {"name": "Pulses", "quantity": 220, "unit": "kg", "icon": "🫘"}
            ],
            "created_at": datetime.now(timezone.utc)
        }
    ]
    result = await storage_coll.insert_many(storage_docs)
    print(f"  ✓ Created {len(result.inserted_ids)} storage units")
    
    # 5. CCTV Streams collection
    print("Creating cctv_streams collection...")
    cctv_coll = db['cctv_streams']
    try:
        await cctv_coll.drop()
    except:
        pass
    
    cctv_docs = [
        {
            "id": "cam-inside-01",
            "name": "Inside Camera",
            "location": "Storage Container Interior",
            "url": "https://placeholder-stream-inside.khetbox.local/live",
            "status": "active",
            "device_id": "khetbox-001",
            "last_active": now,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "cam-outside-01",
            "name": "Outside Camera",
            "location": "Container Exterior & Entrance",
            "url": "https://placeholder-stream-outside.khetbox.local/live",
            "status": "active",
            "device_id": "khetbox-001",
            "last_active": now,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    result = await cctv_coll.insert_many(cctv_docs)
    print(f"  ✓ Created {len(result.inserted_ids)} CCTV streams")
    
    # Create indexes for faster queries
    print("\nCreating indexes...")
    await sensors_coll.create_index("device_id")
    await alerts_coll.create_index("device_id")
    await reports_coll.create_index([("date", -1), ("device_id", 1)])
    await storage_coll.create_index("device_id")
    await cctv_coll.create_index("device_id")
    print("  ✓ Indexes created")
    
    # Summary
    print("\n=== Collection Summary ===")
    colls = await db.list_collection_names()
    for coll_name in colls:
        if coll_name != 'users':
            count = await db[coll_name].count_documents({})
            print(f"  {coll_name}: {count} documents")
    
    client.close()
    print("\n✓ Database initialization complete!")

if __name__ == '__main__':
    asyncio.run(init_db())
