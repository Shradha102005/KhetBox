import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { FileText, Download, Calendar, Thermometer, Droplets, Battery, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API}/reports/daily`);
        setReportData(response.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-export" });
      
      const response = await axios.get(`${API}/reports/export-pdf`, {
        responseType: 'blob'
      });
      
      // Create blob URL and download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `khetbox-daily-report-${reportData.date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully!", { id: "pdf-export" });
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.", { id: "pdf-export" });
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="text-sm font-medium text-slate-900 mb-2">{label}</p>
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

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summaryItems = [
    {
      label: "Avg Temperature",
      value: `${reportData.summary.avg_temperature}°C`,
      icon: Thermometer,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      label: "Avg Humidity",
      value: `${reportData.summary.avg_humidity}%`,
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      label: "Avg Battery",
      value: `${reportData.summary.avg_battery}%`,
      icon: Battery,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      label: "Total Alerts",
      value: reportData.summary.alerts_count,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reports-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Manrope']">Daily Reports</h2>
          <p className="text-slate-500">24-hour statistics and performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {reportData.date}
          </Badge>
          <Button 
            onClick={handleExportPDF}
            className="bg-emerald-500 hover:bg-emerald-600"
            data-testid="export-pdf-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="report-summary">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="border-slate-100" data-testid={`summary-${item.label.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Temperature Range Card */}
      <Card className="border-slate-100" data-testid="temp-range-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Temperature Range (24h)</p>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-blue-500">Min</span>
                  <p className="text-2xl font-bold text-blue-600">{reportData.summary.min_temperature}°C</p>
                </div>
                <div className="w-24 h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 rounded-full"></div>
                <div>
                  <span className="text-sm text-red-500">Max</span>
                  <p className="text-2xl font-bold text-red-600">{reportData.summary.max_temperature}°C</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">System Uptime</p>
              <p className="text-3xl font-bold text-emerald-500">{reportData.summary.uptime_percentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="report-charts">
        {/* Temperature Chart */}
        <Card className="border-slate-100" data-testid="temp-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Temperature History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.hourly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#EF4444' }}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Humidity Chart */}
        <Card className="border-slate-100" data-testid="humidity-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Humidity History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.hourly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis domain={[30, 90]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="humidity" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    name="Humidity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battery Chart */}
      <Card className="border-slate-100" data-testid="battery-chart">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Battery Level History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.hourly_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="battery" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#10B981' }}
                  name="Battery"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Report Info */}
      <Card className="border-emerald-200 bg-emerald-50" data-testid="reports-info">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-800">Automated Daily Reports</p>
            <p className="text-sm text-emerald-600">Reports are generated automatically at midnight. Historical data is retained for 90 days.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
