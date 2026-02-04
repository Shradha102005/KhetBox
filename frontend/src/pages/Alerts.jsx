import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, normal: 0 });

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      const alertsData = response.data.alerts || [];
      setAlerts(alertsData);
      setStats({
        total: alertsData.length,
        critical: alertsData.filter(a => a.severity === 'critical').length,
        warning: alertsData.filter(a => a.severity === 'warning').length,
        normal: alertsData.filter(a => a.severity === 'normal').length
      });
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
          iconColor: 'text-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50',
          border: 'border-amber-500',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          icon: CheckCircle,
          bg: 'bg-emerald-50',
          border: 'border-emerald-500',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-700',
          iconColor: 'text-emerald-500'
        };
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="alerts-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Manrope']">Alerts</h2>
          <p className="text-slate-500">Real-time notifications and system status</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="filter-btn">
                <Filter className="w-4 h-4 mr-2" />
                {filter === 'all' ? 'All Alerts' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>All Alerts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('critical')}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('warning')}>Warning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('normal')}>Normal</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={fetchAlerts} data-testid="refresh-alerts-btn">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="alert-stats">
        <Card className="border-slate-100" data-testid="total-alerts-stat">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Alerts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100" data-testid="critical-alerts-stat">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-xs text-slate-500">Critical</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100" data-testid="warning-alerts-stat">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.warning}</p>
              <p className="text-xs text-slate-500">Warnings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100" data-testid="normal-alerts-stat">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.normal}</p>
              <p className="text-xs text-slate-500">Normal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card className="border-slate-100" data-testid="alerts-list">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-500">No alerts to display</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;
              return (
                <div 
                  key={alert.id} 
                  className={`alert-item ${config.bg} border-l-4 ${config.border} rounded-r-lg p-4 transition-all hover:shadow-sm`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={config.badge}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-400">{formatTime(alert.timestamp)}</span>
                      </div>
                      <p className={`${config.text} font-medium`}>{alert.message}</p>
                    </div>
                    {alert.acknowledged && (
                      <Badge variant="outline" className="text-slate-400 border-slate-200">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50" data-testid="alerts-info">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-800">Smart Alert System</p>
            <p className="text-sm text-blue-600">Alerts are automatically generated based on sensor readings. Critical alerts require immediate attention.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
