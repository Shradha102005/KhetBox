import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, RefreshCw, Maximize2, Volume2, VolumeX } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CCTV() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await axios.get(`${API}/cctv/streams`);
        setStreams(response.data.streams || []);
      } catch (error) {
        console.error("Failed to fetch CCTV streams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();

    // Update timestamp every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatTimestamp = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
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
    <div className="space-y-6 animate-fade-in" data-testid="cctv-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Manrope']">CCTV Monitoring</h2>
          <p className="text-slate-500">Live video feeds from storage container</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setMuted(!muted)}
            data-testid="mute-toggle-btn"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" data-testid="refresh-btn">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="cctv-grid">
        {streams.map((stream) => (
          <Card key={stream.id} className="border-slate-100 overflow-hidden" data-testid={`stream-${stream.id}`}>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{stream.name}</CardTitle>
                    <p className="text-sm text-slate-500">{stream.location}</p>
                  </div>
                </div>
                <Badge 
                  className={stream.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-slate-100 text-slate-600'
                  }
                >
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${stream.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {stream.status === 'active' ? 'LIVE' : 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Video Feed Placeholder */}
              <div className="cctv-feed bg-slate-900 aspect-video relative">
                {/* Simulated video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Video Stream</p>
                    <p className="text-slate-500 text-xs mt-1">{stream.location}</p>
                  </div>
                </div>

                {/* Noise overlay for realistic effect */}
                <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>

                {/* LIVE Badge */}
                {stream.status === 'active' && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}

                {/* Timestamp */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded font-mono">
                  {formatTimestamp(currentTime)}
                </div>

                {/* Camera ID */}
                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded font-mono">
                  {stream.id.toUpperCase()}
                </div>

                {/* Fullscreen Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white"
                  data-testid={`fullscreen-${stream.id}`}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card className="border-emerald-200 bg-emerald-50" data-testid="cctv-info">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-800">24/7 Security Monitoring</p>
            <p className="text-sm text-emerald-600">All video feeds are recorded and stored for 30 days. Motion detection alerts are enabled.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
