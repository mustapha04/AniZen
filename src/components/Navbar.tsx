import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, User, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import brandLogo from "../assets/images/anizen_white_icon_logo_1779362416802.png";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl overflow-hidden border border-white/10 hover:border-brand/40 shadow-md shadow-brand/10 transition-all duration-300">
                <img 
                  src={brandLogo} 
                  alt="AniZen Logo" 
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-gradient">AniZen</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/search" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Browse</Link>
              {user && (
                <>
                  <Link to="/favorites" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Favorites</Link>
                  <Link to="/lists" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Collections</Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/search" className="p-2 text-gray-300 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                {(profile?.role === "admin" || profile?.role === "moderator") && (
                  <Link to="/admin-dashboard" className="p-2 text-gray-300 hover:text-brand transition-colors" title="Control Panel">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                  <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-brand transition-all">
                    <img src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-brand hover:bg-brand-light text-white text-sm font-semibold rounded-full transition-all neon-glow">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-300">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-morphism border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Home</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Browse</Link>
              {user && (
                <>
                  <Link to="/favorites" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Favorites</Link>
                  <Link to="/lists" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Collections</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Profile</Link>
                  {(profile?.role === "admin" || profile?.role === "moderator") && (
                    <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-300">Control Panel</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left text-base font-medium text-red-400">Logout</button>
                </>
              )}
              {!user && (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-base font-medium text-brand">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
