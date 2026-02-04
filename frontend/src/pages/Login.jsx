import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Leaf, Sun, Lock, Mail, Thermometer, Battery, Package, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      if (response.data.success) {
        localStorage.setItem("khetbox_token", response.data.token);
        onLogin(response.data.user);
        toast.success(`Welcome back, ${response.data.user.name}!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" data-testid="login-page">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Back to Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Product Visual & Info */}
          <div className="hidden lg:block space-y-8">
            
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <img 
                src="/Khetbox.png" 
                alt="Khetbox Storage Container" 
                className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
              />
            </div>

            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-slate-900 font-['Manrope']">Khetbox</span>
              </div>
            </div>

            {/* Product Visual Card */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl">
              <CardContent className="p-8">
                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">Climate Control</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">Solar Power</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                    <Sun className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">24/7 Monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 font-['Manrope']">Khetbox</span>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm" data-testid="login-card">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-3xl font-bold text-slate-900">Sign In</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Access your storage monitoring dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        data-testid="email-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        data-testid="password-input"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <span className="text-slate-600">Don't have an account? </span>
                  <Button 
                    variant="link" 
                    className="px-1 text-emerald-600 hover:text-emerald-700 font-semibold" 
                    onClick={() => navigate("/signup")}
                  >
                    Sign up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer Note */}
            <p className="text-center text-sm text-slate-500 mt-6">
              By signing in, you agree to monitor your Khetbox storage system
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-6 right-6 text-sm text-slate-500">
        © 2026 ABC SynergyTech LLP
      </div>
    </div>
  );
}
