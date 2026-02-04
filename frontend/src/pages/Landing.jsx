import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Thermometer, 
  Droplets, 
  Battery, 
  Sun, 
  Video, 
  Bell, 
  Activity,
  Package,
  Users,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Thermometer className="h-8 w-8 text-emerald-600" />,
      title: "Temperature & Humidity Monitoring",
      description: "Real-time climate control monitoring to maintain optimal storage conditions"
    },
    {
      icon: <Package className="h-8 w-8 text-emerald-600" />,
      title: "Storage Capacity Tracking",
      description: "Track available space and manage inventory efficiently"
    },
    {
      icon: <Battery className="h-8 w-8 text-emerald-600" />,
      title: "Solar & Battery Status",
      description: "Monitor power levels and solar charging for uninterrupted operation"
    },
    {
      icon: <Video className="h-8 w-8 text-emerald-600" />,
      title: "CCTV Monitoring",
      description: "Live camera feeds for security and container oversight"
    },
    {
      icon: <Bell className="h-8 w-8 text-emerald-600" />,
      title: "Alerts & Notifications",
      description: "Instant alerts for temperature, battery, and system issues"
    },
    {
      icon: <Activity className="h-8 w-8 text-emerald-600" />,
      title: "Container Health Overview",
      description: "Comprehensive system health monitoring and diagnostics"
    }
  ];

  const targetAudience = [
    { icon: <Users className="h-5 w-5" />, text: "Farmers" },
    { icon: <Building2 className="h-5 w-5" />, text: "FPOs / SHGs" },
    { icon: <Sparkles className="h-5 w-5" />, text: "Agripreneurs" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 shadow-sm border-b sticky top-0 z-50 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/abc_logo.png" alt="ABC SynergyTech" className="h-14 w-auto" />
            <div className="border-l border-gray-300 h-8 mx-2"></div>
            <span className="text-2xl font-bold text-gray-900">Khetbox</span>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            Login
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 animate-pulse">
                Prototype Monitoring System
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                Khetbox – Smart Monitoring<br />for Farm Storage
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-delay">
                A solar-powered hybrid cold & dry storage system designed for farmers
              </p>
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 animate-fade-in-delay-2"
              >
                View Demo Dashboard
              </Button>
              
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
                <img src="/abc_logo.png" alt="ABC SynergyTech" className="h-10 w-auto" />
                <span className="text-sm text-gray-600">ABC SynergyTech LLP</span>
              </div>
            </div>

            {/* Right - Product Image */}
            <div className="flex items-center justify-center order-1 lg:order-2">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <img 
                  src="/Khetbox.png" 
                  alt="Khetbox Storage Container" 
                  className="relative w-full max-w-2xl h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What is Khetbox */}
        <section className="py-12 md:py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 border border-emerald-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Info className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">What is Khetbox?</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Khetbox is a solar-powered, portable storage container that combines cold and dry storage 
              to reduce post-harvest losses for farmers. This dashboard monitors the container in real time, 
              providing farmers and stakeholders with complete visibility into storage conditions, 
              power status, and system health.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What This Dashboard Shows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-emerald-200 bg-white/90 backdrop-blur-sm hover:border-emerald-400 transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-12 md:py-16">
          <div className="bg-gradient-to-r from-emerald-100/80 to-teal-100/80 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Who Is This For?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {targetAudience.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/90 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-shadow border border-emerald-100"
                >
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-gray-900">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Disclaimer */}
        <section className="py-12 md:py-16 pb-24">
          <Alert className="max-w-4xl mx-auto border-amber-300 bg-amber-50/90 backdrop-blur-sm shadow-lg">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base text-amber-900 ml-2">
              <strong className="font-semibold">Demo Disclaimer:</strong> This is a prototype dashboard 
              built for demonstration and review purposes. Hardware integration is part of the next 
              development phase. All data shown is simulated for demonstration purposes.
            </AlertDescription>
          </Alert>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 ABC SynergyTech LLP. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Khetbox – Reducing post-harvest losses through smart technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
