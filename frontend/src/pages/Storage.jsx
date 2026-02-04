import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Thermometer, Droplets, Wind, Snowflake, Wheat } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Storage() {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await axios.get(`${API}/storage`);
        setStorageData(response.data);
      } catch (error) {
        console.error("Failed to fetch storage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorage();
    const interval = setInterval(fetchStorage, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStorageUnit = (storage, type) => {
    const isCold = type === "cold";
    const Icon = isCold ? Snowflake : Wheat;
    const bgGradient = isCold 
      ? "from-blue-50 to-cyan-50" 
      : "from-amber-50 to-orange-50";
    const iconBg = isCold ? "bg-blue-100" : "bg-amber-100";
    const iconColor = isCold ? "text-blue-500" : "text-amber-500";
    const accentColor = isCold ? "text-blue-600" : "text-amber-600";

    const totalKg = storage.crops.reduce((sum, crop) => sum + crop.quantity, 0);

    return (
      <Card 
        className={`border-0 shadow-lg overflow-hidden`}
        data-testid={`${type}-storage-card`}
      >
        <div className={`bg-gradient-to-br ${bgGradient} p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <Badge variant="secondary" className={isCold ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>
                  {isCold ? "Cold Storage" : "Dry Storage"}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{storage.name}</h3>
              <p className="text-sm text-slate-500">{storage.temperature_range}</p>
            </div>
          </div>

          {/* Current Conditions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className={`w-4 h-4 ${accentColor}`} />
                <span className="text-xs text-slate-500">Temperature</span>
              </div>
              <p className={`text-2xl font-bold ${accentColor}`}>{storage.current_temp}°C</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500">Humidity</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{storage.current_humidity}%</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex gap-2 mb-6">
            {storage.humidity_control && (
              <Badge variant="outline" className="bg-white/80">
                <Droplets className="w-3 h-3 mr-1" /> Humidity Control
              </Badge>
            )}
            {isCold && (
              <Badge variant="outline" className="bg-white/80">
                <Wind className="w-3 h-3 mr-1" /> Air Circulation
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Stored Crops</h4>
            <span className="text-sm text-slate-500">{totalKg} kg total</span>
          </div>

          <div className="space-y-4">
            {storage.crops.map((crop, index) => (
              <div key={index} className="space-y-2" data-testid={`crop-${crop.name.toLowerCase().replace(' ', '-')}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{crop.icon}</span>
                    <span className="font-medium text-slate-700">{crop.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{crop.quantity} {crop.unit}</span>
                </div>
                <Progress 
                  value={(crop.quantity / totalKg) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="storage-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-['Manrope']">Storage Units</h2>
        <p className="text-slate-500">Monitor cold and dry storage conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {storageData?.cold_storage && renderStorageUnit(storageData.cold_storage, "cold")}
        {storageData?.dry_storage && renderStorageUnit(storageData.dry_storage, "dry")}
      </div>
    </div>
  );
}
