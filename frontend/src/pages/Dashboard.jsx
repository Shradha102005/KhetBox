import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Battery, Package, Sun, SunDim, DoorOpen, DoorClosed, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WS_URL = BACKEND_URL?.replace('https://', 'wss://').replace('http://', 'ws://');

export default function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: 4.4,
    humidity: 61,
    battery: 61,
    storage_used: 61,
    solar_active: true,
    door_open: false,
    last_update: new Date().toISOString()
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [connected, setConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [statusRes, reportsRes] = await Promise.all([
        axios.get(`${API}/status`),
        axios.get(`${API}/reports/daily`)
      ]);
      setSensorData(statusRes.data);
      setHistoricalData(reportsRes.data.hourly_data || []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // WebSocket connection for real-time updates
    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/ws/sensors`);
      
      ws.onopen = () => {
        setConnected(true);
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setSensorData(data);
      };

      ws.onclose = () => {
        setConnected(false);
        console.log("WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }

    // Fallback polling if WebSocket fails
    const pollInterval = setInterval(async () => {
      if (!connected) {
        try {
          const response = await axios.get(`${API}/status`);
          setSensorData(response.data);
        } catch (error) {
          console.error("Polling failed:", error);
        }
      }
    }, 8000);

    return () => {
      if (ws) ws.close();
      clearInterval(pollInterval);
    };
  }, [fetchInitialData, connected]);

  const getTemperatureStatus = (temp) => {
    if (temp > 8) return { color: "text-red-500", bg: "bg-red-50", status: "Critical" };
    if (temp > 6) return { color: "text-amber-500", bg: "bg-amber-50", status: "Warning" };
    return { color: "text-emerald-500", bg: "bg-emerald-50", status: "Normal" };
  };

  const getBatteryStatus = (battery) => {
    if (battery < 25) return { color: "text-red-500", bg: "bg-red-50" };
    if (battery < 40) return { color: "text-amber-500", bg: "bg-amber-50" };
    return { color: "text-emerald-500", bg: "bg-emerald-50" };
  };

  const tempStatus = getTemperatureStatus(sensorData.temperature);
  const batteryStatus = getBatteryStatus(sensorData.battery);

  const metricCards = [
    {
      title: "Temperature",
      value: `${sensorData.temperature}°C`,
      icon: Thermometer,
      color: tempStatus.color,
      bg: tempStatus.bg,
      subtitle: "Cold Storage (2-8°C)",
      testId: "temp-card"
    },
    {
      title: "Humidity",
      value: `${sensorData.humidity}%`,
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
      subtitle: "Optimal Range (40-70%)",
      testId: "humidity-card"
    },
    {
      title: "Battery",
      value: `${sensorData.battery}%`,
      icon: Battery,
      color: batteryStatus.color,
      bg: batteryStatus.bg,
      subtitle: sensorData.solar_active ? "Solar Charging" : "On Battery",
      testId: "battery-card"
    },
    {
      title: "Storage Used",
      value: `${sensorData.storage_used}%`,
      icon: Package,
      color: "text-amber-500",
      bg: "bg-amber-50",
      subtitle: "of 2000kg Capacity",
      testId: "storage-card"
    }
  ];

  const statusCards = [
    {
      title: "Temperature Trend",
      value: "78L",
      icon: TrendingUp,
      color: "text-red-500",
      bg: "bg-red-50",
      testId: "trend-card"
    },
    {
      title: "Solar Status",
      value: sensorData.solar_active ? "Active" : "Inactive",
      icon: sensorData.solar_active ? Sun : SunDim,
      color: sensorData.solar_active ? "text-emerald-500" : "text-slate-400",
      bg: sensorData.solar_active ? "bg-emerald-50" : "bg-slate-50",
      testId: "solar-card"
    },
    {
      title: "Humidity Control",
      value: "Secured",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50",
      testId: "humidity-control-card"
    },
    {
      title: "Door Status",
      value: sensorData.door_open ? "Open" : "Closed",
      icon: sensorData.door_open ? DoorOpen : DoorClosed,
      color: sensorData.door_open ? "text-amber-500" : "text-emerald-500",
      bg: sensorData.door_open ? "bg-amber-50" : "bg-emerald-50",
      testId: "door-card"
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Temperature' ? '°C' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      {/* Main Metrics - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="metrics-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className="card-hover border-slate-100"
              data-testid={card.testId}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="status-grid">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title} 
              className="border-slate-100"
              data-testid={card.testId}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{card.title}</p>
                  <p className={`text-sm font-semibold ${card.color}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="charts-section">
        {/* Temperature Trend */}
        <Card className="border-slate-100" data-testid="temperature-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">24h Temperature Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fill="url(#tempGradient)"
                    name="Temperature"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Humidity Trend */}
        <Card className="border-slate-100" data-testid="humidity-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">24h Humidity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis domain={[30, 90]} tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#humidityGradient)"
                    name="Humidity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-slate-400" data-testid="last-update">
        Last updated: {new Date(sensorData.last_update).toLocaleString()}
        {connected && <span className="ml-2 text-emerald-500">• Live</span>}
      </div>
    </div>
  );
}
