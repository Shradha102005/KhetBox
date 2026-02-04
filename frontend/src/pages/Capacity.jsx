import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Package, TrendingUp, TrendingDown, Scale } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Capacity() {
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const response = await axios.get(`${API}/capacity`);
        setCapacityData(response.data);
      } catch (error) {
        console.error("Failed to fetch capacity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();
    const interval = setInterval(fetchCapacity, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !capacityData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = capacityData.breakdown.map(item => ({
    name: item.name,
    value: item.kg,
    color: item.color,
    icon: item.icon
  }));

  // Add available space
  pieData.push({
    name: "Available",
    value: capacityData.available_kg,
    color: "#E2E8F0",
    icon: "📦"
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.value} kg
          </p>
          <p className="text-xs text-slate-500">
            {((data.value / capacityData.total_capacity_kg) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {pieData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600">{entry.icon} {entry.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="capacity-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-['Manrope']">Storage Capacity</h2>
        <p className="text-slate-500">Overview of container storage utilization</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="capacity-summary">
        <Card className="border-slate-100" data-testid="total-capacity-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Capacity</p>
                <p className="text-2xl font-bold text-slate-900">{capacityData.total_capacity_kg.toLocaleString()} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100" data-testid="used-capacity-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Used Capacity</p>
                <p className="text-2xl font-bold text-amber-600">{capacityData.used_kg.toLocaleString()} kg</p>
                <p className="text-xs text-slate-400">{capacityData.used_percentage}% utilized</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100" data-testid="available-capacity-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Available Space</p>
                <p className="text-2xl font-bold text-blue-600">{capacityData.available_kg.toLocaleString()} kg</p>
                <p className="text-xs text-slate-400">{(100 - capacityData.used_percentage).toFixed(0)}% remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="border-slate-100" data-testid="capacity-pie-chart">
          <CardHeader>
            <CardTitle className="text-lg">Storage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {renderCustomLegend()}
          </CardContent>
        </Card>

        {/* Breakdown List */}
        <Card className="border-slate-100" data-testid="capacity-breakdown">
          <CardHeader>
            <CardTitle className="text-lg">Crop Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {capacityData.breakdown.map((item, index) => (
              <div key={index} className="space-y-2" data-testid={`breakdown-${item.name.toLowerCase()}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {((item.kg / capacityData.total_capacity_kg) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: item.color }}>
                    {item.kg} kg
                  </span>
                </div>
                <Progress 
                  value={(item.kg / capacityData.total_capacity_kg) * 100} 
                  className="h-2"
                  style={{ '--progress-color': item.color }}
                />
              </div>
            ))}

            {/* Available Space */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-slate-900">Available Space</p>
                    <p className="text-xs text-slate-500">
                      {(100 - capacityData.used_percentage).toFixed(1)}% remaining
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-slate-400">
                  {capacityData.available_kg} kg
                </span>
              </div>
              <Progress 
                value={100 - capacityData.used_percentage} 
                className="h-2 mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Warning */}
      {capacityData.used_percentage > 80 && (
        <Card className="border-amber-200 bg-amber-50" data-testid="capacity-warning">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Capacity Alert</p>
              <p className="text-sm text-amber-600">Storage is over 80% full. Consider harvesting or expanding storage capacity.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
