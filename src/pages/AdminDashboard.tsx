import React, { useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc, 
  updateDoc,
  addDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import AnalyticsSEOSection from "../components/AnalyticsSEOSection";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ExternalLink, 
  Trash2, 
  ShieldCheck,
  ShieldAlert,
  Loader2,
  MoreVertical,
  Heart,
  Star
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    comments: 0,
    favorites: 0,
    ratings: 0
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);
  const [affiliateClicks, setAffiliateClicks] = useState<any[]>([]);
  const [activeTab, setActiveTab ] = useState<'users' | 'comments' | 'affiliates' | 'analytics'>('comments');
  const [loading, setLoading] = useState(true);

  // Timeframes and Metric types for real Engagement Analytics + Growth Metrics
  const [analyticsData, setAnalyticsData] = useState<{
    daily: any[];
    weekly: any[];
  }>({ daily: [], weekly: [] });
  const [engagementTimeframe, setEngagementTimeframe] = useState<'day' | 'week'>('day');
  const [growthTimeframe, setGrowthTimeframe] = useState<'day' | 'week'>('day');
  const [growthMetricType, setGrowthMetricType] = useState<'new' | 'cumulative'>('new');

  useEffect(() => {
    if (profile?.role === 'admin') {
      setActiveTab('analytics');
    } else {
      setActiveTab('comments');
    }
  }, [profile]);

  // New affiliate state
  const [newLink, setNewLink] = useState({ animeId: "", platform: "", url: "" });
  const [linkTarget, setLinkTarget] = useState<'specific' | 'all'>('specific');

  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    if (typeof val.toDate === "function") {
      return val.toDate();
    }
    if (val.seconds !== undefined) {
      return new Date(val.seconds * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [usersSnap, commentsSnap, favoritesSnap, ratingsSnap, affiliateSnap, affiliateClicksSnap] = await Promise.all([
          getDocs(collection(db, "profiles")),
          getDocs(collection(db, "comments")),
          getDocs(collection(db, "favorites")),
          getDocs(collection(db, "ratings")),
          getDocs(collection(db, "affiliate_links")),
          getDocs(collection(db, "affiliate_clicks"))
        ]);

        const totalUsers = usersSnap.size;
        const totalComments = commentsSnap.size;
        const totalFavorites = favoritesSnap.size;
        const totalRatings = ratingsSnap.size;

        setStats({
          users: totalUsers,
          comments: totalComments,
          favorites: totalFavorites,
          ratings: totalRatings
        });

        const users = usersSnap.docs.map(d => d.data());
        const comments: any[] = commentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const affiliates = affiliateSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const clicks = affiliateClicksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setUsersList(users);
        setAffiliateLinks(affiliates);
        setAffiliateClicks(clicks);

        // Sort comments by date descending for Content Moderation section
        const sortedComments = [...comments];
        sortedComments.sort((a, b) => {
          const dateA = parseDate(a.createdAt) || new Date(0);
          const dateB = parseDate(b.createdAt) || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setCommentsList(sortedComments);

        // Calculate REAL Daily Analytics (last 7 days)
        const dailyRange = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dailyRange.push({
            name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            startMs: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime(),
            endMs: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime(),
            comments: 0,
            favorites: 0,
            ratings: 0,
            users: 0,
            engagement: 0,
            cumulativeUsers: 0
          });
        }

        // Sort all profiles chronologically to compute dynamic cumulative user growths
        const cronProfiles = [...users];
        cronProfiles.sort((a, b) => {
          const dateA = parseDate(a.createdAt) || new Date(0);
          const dateB = parseDate(b.createdAt) || new Date(0);
          return dateA.getTime() - dateB.getTime();
        });

        const firstDailyStartMs = dailyRange[0].startMs;
        let cumulativeUsersCount = cronProfiles.filter(p => {
          const d = parseDate(p.createdAt);
          return d && d.getTime() < firstDailyStartMs;
        }).length;

        dailyRange.forEach(bucket => {
          const newUsersOnDay = cronProfiles.filter(p => {
            const d = parseDate(p.createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.users = newUsersOnDay;
          cumulativeUsersCount += newUsersOnDay;
          bucket.cumulativeUsers = cumulativeUsersCount;

          bucket.comments = comments.filter(c => {
            const d = parseDate(c.createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.favorites = favoritesSnap.docs.filter(f => {
            const d = parseDate(f.data().createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.ratings = ratingsSnap.docs.filter(r => {
            const d = parseDate(r.data().createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.engagement = bucket.comments + bucket.favorites + bucket.ratings;
        });

        // Calculate REAL Weekly Analytics (last 4 weeks)
        const weeklyRange = [];
        for (let i = 3; i >= 0; i--) {
          const end = new Date();
          end.setDate(end.getDate() - (i * 7));
          const start = new Date();
          start.setDate(start.getDate() - (i * 7 + 6));

          const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0).getTime();
          const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();

          weeklyRange.push({
            name: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
            startMs,
            endMs,
            comments: 0,
            favorites: 0,
            ratings: 0,
            users: 0,
            engagement: 0,
            cumulativeUsers: 0
          });
        }

        let cumulativeWeeklyUsers = cronProfiles.filter(p => {
          const d = parseDate(p.createdAt);
          return d && d.getTime() < weeklyRange[0].startMs;
        }).length;

        weeklyRange.forEach(bucket => {
          const newUsersOnWeek = cronProfiles.filter(p => {
            const d = parseDate(p.createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.users = newUsersOnWeek;
          cumulativeWeeklyUsers += newUsersOnWeek;
          bucket.cumulativeUsers = cumulativeWeeklyUsers;

          bucket.comments = comments.filter(c => {
            const d = parseDate(c.createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.favorites = favoritesSnap.docs.filter(f => {
            const d = parseDate(f.data().createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.ratings = ratingsSnap.docs.filter(r => {
            const d = parseDate(r.data().createdAt);
            return d && d.getTime() >= bucket.startMs && d.getTime() <= bucket.endMs;
          }).length;

          bucket.engagement = bucket.comments + bucket.favorites + bucket.ratings;
        });

        setAnalyticsData({
          daily: dailyRange,
          weekly: weeklyRange
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const addAffiliateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAll = linkTarget === 'all';
    if ((!isAll && !newLink.animeId) || !newLink.platform || !newLink.url) return;
    try {
      let formattedUrl = newLink.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl;
      }
      const docData: any = {
        platform: newLink.platform,
        affiliateUrl: formattedUrl,
        isAll: isAll,
        clicks: 0,
        createdAt: new Date().toISOString()
      };
      if (!isAll) {
        docData.animeId = Number(newLink.animeId);
      }
      const docRef = await addDoc(collection(db, "affiliate_links"), docData);
      setAffiliateLinks(prev => [{ id: docRef.id, ...docData }, ...prev]);
      setNewLink({ animeId: "", platform: "", url: "" });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAffiliateLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, "affiliate_links", id));
      setAffiliateLinks(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "comments", id));
      setCommentsList(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const changeUserRole = async (uid: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      await updateDoc(doc(db, "profiles", uid), { role: newRole });
      setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-dark">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tight">
            {profile?.role === 'admin' ? 'Platform HQ Command Center' : 'Moderator Operations Desk'}
          </h1>
          <p className="text-gray-500 text-sm">
            {profile?.role === 'admin' 
              ? 'Consolidated operational dashboard, monetization routes, telemetry signals, and content logs.' 
              : 'Direct moderating space for comments and community discussion streams.'}
          </p>
        </div>
        <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 text-xs uppercase tracking-wider">
          <ExternalLink className="w-4 h-4" />
          Export Schema
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Modern Sidebar System */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-6">
            
            {/* Platform Management Group */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest block px-1">
                Platform Operations
              </span>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                    activeTab === 'comments' 
                      ? "bg-brand text-white shadow-lg shadow-brand/20 font-extrabold" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Content Moderation</span>
                </button>

                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                      activeTab === 'users' 
                        ? "bg-brand text-white shadow-lg shadow-brand/20 font-extrabold" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Users className="w-4 h-4" />
                    <span>User Directory</span>
                  </button>
                )}

                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => setActiveTab('affiliates')}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                      activeTab === 'affiliates' 
                        ? "bg-brand text-white shadow-lg shadow-brand/20 font-extrabold" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Star className="w-4 h-4" />
                    <span>Affiliate Links</span>
                  </button>
                )}
              </div>
            </div>

            {/* NEW Analytics and SEO Group */}
            {profile?.role === 'admin' && (
              <div className="space-y-3 border-t border-white/5 pt-5">
                <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest block px-1">
                  Analytics & SEO
                </span>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                      activeTab === 'analytics' 
                        ? "bg-brand text-white shadow-lg shadow-brand/20 font-extrabold" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics Panels</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Display Container */}
        <div className="lg:col-span-3 space-y-8 animate-scale-in">
           
          {activeTab === 'analytics' ? (
            <AnalyticsSEOSection />
          ) : (
            <>
              {/* Stat Cards Grid (Only relevant platform tabs to keep it clean) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Users" value={stats.users} color="text-indigo-400" bgColor="bg-indigo-500/10" />
                <StatCard icon={MessageSquare} label="Comments" value={stats.comments} color="text-emerald-400" bgColor="bg-emerald-500/10" />
                <StatCard icon={Heart} label="Favorites" value={stats.favorites} color="text-amber-400" bgColor="bg-amber-500/10" />
                <StatCard icon={Star} label="Ratings" value={stats.ratings} color="text-rose-400" bgColor="bg-rose-500/10" />
              </div>

              {/* Render contextual platform graphics based on action tab selection */}
              {activeTab === 'comments' && (
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] min-h-[460px] flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-none mb-1">Engagement Analytics</h3>
                      <p className="text-[11px] text-gray-500">Comments, favorites, and ratings activity.</p>
                    </div>
                    <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl font-sans">
                      <button 
                        onClick={() => setEngagementTimeframe('day')}
                        className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", engagementTimeframe === 'day' ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white")}
                      >
                        Day
                      </button>
                      <button 
                        onClick={() => setEngagementTimeframe('week')}
                        className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", engagementTimeframe === 'week' ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white")}
                      >
                        Week
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementTimeframe === 'day' ? analyticsData.daily : analyticsData.weekly}>
                        <defs>
                          <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRatings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0a0a0b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", fontSize: "12px" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#888' }} />
                        <Area type="monotone" name="Comments" dataKey="comments" stroke="#10b981" fillOpacity={1} fill="url(#colorComments)" strokeWidth={3} />
                        <Area type="monotone" name="Favorites" dataKey="favorites" stroke="#f59e0b" fillOpacity={1} fill="url(#colorFavorites)" strokeWidth={3} />
                        <Area type="monotone" name="Ratings" dataKey="ratings" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRatings)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] min-h-[460px] flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-none mb-1">Growth Metrics</h3>
                      <p className="text-[11px] text-gray-500">Registered users trend over time.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 font-sans">
                      <div className="flex gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl">
                        <button 
                          onClick={() => setGrowthMetricType('new')}
                          className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all", growthMetricType === 'new' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
                        >
                          New Users
                        </button>
                        <button 
                          onClick={() => setGrowthMetricType('cumulative')}
                          className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all", growthMetricType === 'cumulative' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
                        >
                          Total Base
                        </button>
                      </div>

                      <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl">
                        <button 
                          onClick={() => setGrowthTimeframe('day')}
                          className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", growthTimeframe === 'day' ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white")}
                        >
                          Day
                        </button>
                        <button 
                          onClick={() => setGrowthTimeframe('week')}
                          className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", growthTimeframe === 'week' ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white")}
                        >
                          Week
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthTimeframe === 'day' ? analyticsData.daily : analyticsData.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0a0a0b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", fontSize: "12px" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="rect" iconSize={12} wrapperStyle={{ fontSize: '11px', color: '#888' }} />
                        <Bar 
                          name={growthMetricType === 'new' ? "New Users Registered" : "Total User Base (Cumulative)"} 
                          dataKey={growthMetricType === 'new' ? 'users' : 'cumulativeUsers'} 
                          fill={growthMetricType === 'new' ? '#6366f1' : '#a855f7'} 
                          radius={[6, 6, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data Lists Table */}
              <div className="space-y-8">
                {activeTab === 'users' && (
                  <div className="bg-card-dark border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2 text-white"><Users className="w-5 h-5 text-gray-500" /> User Management</h3>
                      <span className="text-xs text-gray-500">{usersList.length} total profiles</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/2 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {usersList.map((u) => (
                            <tr key={u.uid} className="hover:bg-white/2 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 animate-fade-in">
                                  <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                  <div>
                                    <p className="text-sm font-bold text-white">{u.username}</p>
                                    <p className="text-[10px] text-gray-500">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={u.role || "user"}
                                  onChange={(e) => changeUserRole(u.uid, e.target.value as any)}
                                  className={cn(
                                    "text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer border transition-all",
                                    u.role === "admin" && "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10",
                                    u.role === "moderator" && "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10",
                                    u.role === "user" && "text-gray-400 border-white/5 bg-white/5 hover:bg-white/10"
                                  )}
                                >
                                  <option value="user" className="bg-bg-dark text-gray-300">User</option>
                                  <option value="moderator" className="bg-bg-dark text-blue-400">Moderator</option>
                                  <option value="admin" className="bg-bg-dark text-purple-400">Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-gray-400 font-medium text-xs">
                                {u.role === "admin" ? "Full Access" : u.role === "moderator" ? "Moderation Only" : "Standard User"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="bg-card-dark border border-white/5 rounded-3xl overflow-hidden flex flex-col animate-fade-in">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-bold flex items-center gap-2 text-white"><MessageSquare className="w-5 h-5 text-gray-500" /> Content Moderation</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {commentsList.map(comment => (
                        <div key={comment.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-300">{comment.username}</span>
                            <button 
                              onClick={() => deleteComment(comment.id)}
                              className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed mb-2">{comment.content}</p>
                          <div className="flex items-center justify-between">
                             <span className="text-[8px] text-gray-600">Anime ID: {comment.animeId}</span>
                             <span className="text-[8px] text-gray-600 font-mono">Comment log</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'affiliates' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 bg-card-dark p-8 rounded-3xl border border-white/5 h-fit">
                        <h3 className="text-xl font-bold mb-6 text-white text-gradient">Add Affiliate Link</h3>
                        <form onSubmit={addAffiliateLink} className="space-y-4">
                           <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Link Target</label>
                             <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-1 rounded-xl mb-4">
                               <button
                                 type="button"
                                 onClick={() => setLinkTarget('specific')}
                                 className={cn(
                                   "py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer",
                                   linkTarget === 'specific'
                                     ? "bg-white/10 text-white shadow"
                                     : "text-gray-500 hover:text-white"
                                 )}
                               >
                                 Specific Anime
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setLinkTarget('all')}
                                 className={cn(
                                   "py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer",
                                   linkTarget === 'all'
                                     ? "bg-white/10 text-white shadow"
                                     : "text-gray-500 hover:text-white"
                                 )}
                               >
                                 All Animes
                               </button>
                             </div>
                           </div>

                           {linkTarget === 'specific' ? (
                             <div>
                               <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Anime ID (MAL)</label>
                               <input 
                                 type="number"
                                 value={newLink.animeId}
                                 onChange={e => setNewLink({...newLink, animeId: e.target.value})}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                                 placeholder="e.g. 5114"
                               />
                             </div>
                           ) : (
                             <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-4 text-center">
                               <span className="text-xs text-gray-400 font-medium col-span-2">This link will automatically display on all anime details pages! ✨</span>
                             </div>
                           )}

                           <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Platform</label>
                             <input 
                               value={newLink.platform}
                               onChange={e => setNewLink({...newLink, platform: e.target.value})}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                               placeholder="e.g. Crunchyroll"
                             />
                           </div>
                           <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">URL</label>
                             <input 
                               value={newLink.url}
                               onChange={e => setNewLink({...newLink, url: e.target.value})}
                               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" 
                               placeholder="https://crunchyroll.com/..."
                             />
                           </div>
                           <button className="w-full py-3 bg-brand text-white font-bold rounded-xl mt-4 hover:bg-brand-light transition-all neon-glow cursor-pointer">
                             Add Link
                           </button>
                        </form>
                     </div>
                     
                     <div className="lg:col-span-2 bg-card-dark rounded-3xl border border-white/5 overflow-hidden">
                       <div className="p-6 border-b border-white/5 flex items-center justify-between">
                          <h3 className="font-bold text-white text-lg">Active Affiliate Links</h3>
                          <span className="text-xs text-gray-500">{affiliateLinks.length} total</span>
                       </div>
                       <table className="w-full text-left">
                          <thead className="bg-white/2 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                            <tr>
                              <th className="px-6 py-4">Anime ID</th>
                              <th className="px-6 py-4">Platform</th>
                              <th className="px-6 py-4">Clicks</th>
                              <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {affiliateLinks.map(link => (
                              <tr key={link.id} className="hover:bg-white/1 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-zinc-300">
                                  {link.isAll ? (
                                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-lg text-[9px] uppercase font-black tracking-widest">All Animes</span>
                                  ) : (
                                    <span>MAL ID: {link.animeId}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-zinc-400">{link.platform}</span>
                                </td>
                                <td className="px-6 py-4 text-emerald-400 font-bold">
                                  {affiliateClicks.filter((c: any) => {
                                    if (c.linkId && link.id) {
                                      return c.linkId === link.id;
                                    }
                                    return Number(c.animeId) === Number(link.animeId) && c.platform === link.platform;
                                  }).length}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => deleteAffiliateLink(link.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                     </div>
                    </div>

                    <div className="bg-card-dark rounded-3xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white text-lg">Affiliate Click Activity Log</h3>
                          <p className="text-xs text-gray-500">Real-time log of affiliate link redirects clicked by users.</p>
                        </div>
                        <span className="text-xs text-brand font-bold bg-brand/10 px-3 py-1 rounded-full">
                          {affiliateClicks.length} total clicks
                        </span>
                      </div>
                      {affiliateClicks.length > 0 ? (
                        <div className="overflow-x-auto text-sm">
                          <table className="w-full text-left">
                            <thead className="bg-white/2 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-white/5">
                              <tr>
                                <th className="px-6 py-4">Click Time</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Anime ID</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4">Platform Icon</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {[...affiliateClicks]
                                .sort((a, b) => {
                                  const dateA = parseDate(a.clickedAt) || new Date(0);
                                  const dateB = parseDate(b.clickedAt) || new Date(0);
                                  return dateB.getTime() - dateA.getTime();
                                })
                                .slice(0, 50)
                                .map((click) => {
                                  const clickDate = parseDate(click.clickedAt);
                                  return (
                                    <tr key={click.id} className="hover:bg-white/1 transition-colors">
                                      <td className="px-6 py-4 text-gray-400 text-xs">
                                        {clickDate ? clickDate.toLocaleString() : "Just now"}
                                      </td>
                                      <td className="px-6 py-4 font-mono text-xs text-gray-300 font-medium">
                                        {click.userId === "anonymous" ? (
                                          <span className="text-gray-500 italic">Guest User</span>
                                        ) : (
                                          <span className="text-brand" title={click.userId}>
                                            User: {click.userId?.slice(0, 8)}...
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-200">
                                        {click.animeId}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold text-gray-200">
                                          {click.platform}
                                        </span>
                                      </td>
                                      <td className="px-6 py-3">
                                        <div className="w-7 h-7 rounded-lg bg-brand/15 text-white/90 flex items-center justify-center font-black text-xs uppercase shadow-inner border border-white/5">
                                          {click.platform ? click.platform[0] : "?"}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-12 text-center text-gray-500">
                          <p className="text-sm">No affiliate clicks logged yet.</p>
                          <p className="text-xs text-gray-600 mt-1">Clicks are recorded when users watch on external platforms.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4 transition-all hover:bg-white/10 group">
       <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", bgColor, color)}>
         <Icon className="w-6 h-6" />
       </div>
       <div>
         <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest leading-none mb-2">{label}</p>
         <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
       </div>
    </div>
  );
}
