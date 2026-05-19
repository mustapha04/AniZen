import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Chrome, Mail, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request' || e.message?.includes('assertion failed')) {
        setError('Login blocked by browser security. Click "Open in New Window" below to log in safely.');
      } else {
        setError('Authentication failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isIframe = window.self !== window.top;

  return (
    <div className="h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card-dark rounded-3xl p-10 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6 neon-glow">
            <span className="font-display font-black text-white text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Join the ultimate community of anime enthusiasts.</p>
          
          {isIframe && (
            <div className="mt-6 p-3 bg-brand/10 border border-brand/20 rounded-xl">
              <p className="text-[10px] text-brand font-bold uppercase tracking-widest mb-2">Iframe Detected</p>
              <p className="text-xs text-gray-300 mb-3">Google Login requires a direct window to prevent security blocks.</p>
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-light transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Open in New Tab to Login
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-red-400 font-bold">{error}</p>
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline"
                >
                  Open in New Window <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5 text-[#4285F4]" />}
            {loading ? "Connecting..." : "Continue with Google"}
          </button>
          
          <button className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all">
            <Mail className="w-5 h-5" />
            Continue with Email
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed">
            By signing in, you agree to our <span className="text-brand">Terms of Service</span> and <span className="text-brand">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
