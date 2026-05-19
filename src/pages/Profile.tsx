import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  Edit2, 
  Heart, 
  List as ListIcon, 
  Star,
  LogOut
} from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const [stats, setStats] = useState({
    favorites: 0,
    lists: 0,
    ratings: 0
  });

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      const [favs, lists, ratings] = await Promise.all([
        getDocs(query(collection(db, "favorites"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "lists"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "ratings"), where("userId", "==", user.uid)))
      ]);
      setStats({
        favorites: favs.size,
        lists: lists.size,
        ratings: ratings.size
      });
    }
    fetchStats();
  }, [user]);

  if (!user || !profile) return null;

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-card-dark rounded-[32px] border border-white/5 overflow-hidden mb-12 shadow-2xl">
        <div className="h-48 bg-gradient-to-r from-brand/20 via-brand/40 to-blue-500/20 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        <div className="px-12 pb-12 -mt-16 relative flex flex-col md:flex-row items-end gap-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-[40px] border-8 border-bg-dark overflow-hidden bg-bg-dark"
          >
            <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-full h-full object-cover" alt="" />
          </motion.div>
          
          <div className="flex-grow mb-4 text-center md:text-left">
            <h1 className="text-4xl font-display font-black text-white mb-2">{profile.username}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              {profile.role === 'admin' && (
                <span className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-[10px]">
                  <Shield className="w-4 h-4" /> Administrator
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
            <button onClick={logout} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
        <ProfileStat icon={Heart} label="Favorites" value={stats.favorites} color="text-brand" />
        <ProfileStat icon={ListIcon} label="Custom Lists" value={stats.lists} color="text-blue-400" />
        <ProfileStat icon={Star} label="Total Ratings" value={stats.ratings} color="text-yellow-400" />
      </div>

      {/* Profile Tabs/Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/2 rounded-3xl border border-white/5 p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">About Me</h3>
             <p className="text-gray-400 leading-relaxed">
               No bio provided yet. Update your profile to tell the community about your favorite anime eras!
             </p>
           </div>
           
           <div className="bg-white/2 rounded-3xl border border-white/5 p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">Recent Activity</h3>
             <div className="space-y-4">
               {/* This would be a real activity stream in a production app */}
               <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">Added Shingeki no Kyojin to favorites</p>
                      <p className="text-[10px] text-gray-500">2 hours ago</p>
                    </div>
                 </div>
               </div>
               <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-200">Rated Jujutsu Kaisen 10/10</p>
                      <p className="text-[10px] text-gray-500">Yesterday</p>
                    </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-card-dark rounded-3xl p-8 border border-white/5">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><Settings className="w-5 h-5" /> Account Settings</h3>
            <div className="space-y-2">
               <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">Privacy Settings</button>
               <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">Notification Preferences</button>
               <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-medium">Connected Apps</button>
               {profile.role === 'admin' && (
                 <Link to="/admin-dashboard" className="block w-full text-left px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-sm font-bold">Admin Panel</Link>
               )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-card-dark p-8 rounded-[32px] border border-white/5 text-center group hover:border-white/10 transition-all">
       <Icon className={cn("w-8 h-8 mx-auto mb-4 group-hover:scale-110 transition-transform", color)} />
       <p className="text-3xl font-black text-white mb-1">{value}</p>
       <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{label}</p>
    </div>
  );
}
