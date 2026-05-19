import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Lock, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function AdminLogin() {
  const { user, profile, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user && profile?.role === "admin") return <Navigate to="/admin-dashboard" />;

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Role check happens in AuthContext
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request' || e.message?.includes('assertion failed')) {
        setError('Login blocked! Click the "Open App" button below to log in in a new tab.');
      } else {
        setError('Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isIframe = window.self !== window.top;

  return (
    <div className="h-screen flex items-center justify-center bg-bg-dark bg-grid-pattern">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0e0e11] rounded-3xl p-12 border border-brand/20 shadow-[0_0_50px_rgba(255,0,85,0.1)]"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand/10 border border-brand/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-2 uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-gray-500 text-sm">Restricted access area. Verified administrators only.</p>
          
          {isIframe && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 leading-none">External Link Required</p>
              <p className="text-xs text-gray-500 mb-4">Browsers block secure logins inside iframes. Use direct access to authenticate.</p>
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                <ExternalLink className="w-4 h-4" /> Switch to Direct View
              </a>
            </div>
          )}
        </div>

        {user && profile?.role !== "admin" ? (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center mb-6">
            <p className="text-red-400 text-sm font-bold">Access Denied</p>
            <p className="text-red-400/70 text-xs">Your account does not have administrator privileges.</p>
            <p className="text-[10px] text-gray-600 mt-2">Try refreshing the page if you were just granted access.</p>
          </div>
        ) : null}

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-amber-400 font-bold">{error}</p>
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
          className="w-full flex items-center justify-center gap-4 py-4 bg-brand hover:bg-brand-light text-white font-bold rounded-2xl transition-all shadow-xl neon-glow border border-brand/50 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          {loading ? "Authorizing..." : "Authenticate Admin"}
        </button>
        
        <div className="mt-8 text-center">
          <button onClick={() => navigate("/")} className="text-xs text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest font-bold">
            Back to Public Site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
