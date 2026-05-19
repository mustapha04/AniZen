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
  Area
} from "recharts";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    comments: 0,
    favorites: 0,
    ratings: 0
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'affiliates'>('users');
  const [loading, setLoading] = useState(true);

  // New affiliate state
  const [newLink, setNewLink] = useState({ animeId: "", platform: "", url: "" });

  const activityData = [
    { name: "Mon", users: 400, comments: 240 },
    { name: "Tue", users: 300, comments: 139 },
    { name: "Wed", users: 200, comments: 980 },
    { name: "Thu", users: 278, comments: 390 },
    { name: "Fri", users: 189, comments: 480 },
    { name: "Sat", users: 239, comments: 380 },
    { name: "Sun", users: 349, comments: 430 }
  ];

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [usersSnap, commentsSnap, favoritesSnap, ratingsSnap, affiliateSnap] = await Promise.all([
          getDocs(collection(db, "profiles")),
          getDocs(query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(20))),
          getDocs(collection(db, "favorites")),
          getDocs(collection(db, "ratings")),
          getDocs(collection(db, "affiliate_links"))
        ]);

        setStats({
          users: usersSnap.size,
          comments: commentsSnap.size,
          favorites: favoritesSnap.size,
          ratings: ratingsSnap.size
        });

        setUsersList(usersSnap.docs.map(d => d.data()));
        setCommentsList(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setAffiliateLinks(affiliateSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    if (!newLink.animeId || !newLink.platform || !newLink.url) return;
    try {
      const docData = {
        animeId: Number(newLink.animeId),
        platform: newLink.platform,
        affiliateUrl: newLink.url,
        clicks: 0,
        createdAt: new Date().toISOString()
      };
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

  const toggleAdmin = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
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
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tight">Command Center</h1>
          <p className="text-gray-500">Overview of platform health and community activity.</p>
        </div>
        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Users} label="Total Users" value={stats.users} color="text-indigo-400" bgColor="bg-indigo-500/10" />
        <StatCard icon={MessageSquare} label="Comments" value={stats.comments} color="text-emerald-400" bgColor="bg-emerald-500/10" />
        <StatCard icon={Heart} label="Favorites" value={stats.favorites} color="text-amber-400" bgColor="bg-amber-500/10" />
        <StatCard icon={Star} label="Ratings" value={stats.ratings} color="text-rose-400" bgColor="bg-rose-500/10" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={cn("px-4 py-2 text-sm font-bold transition-all", activeTab === 'users' ? "text-brand border-b-2 border-brand" : "text-gray-500 hover:text-white")}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={cn("px-4 py-2 text-sm font-bold transition-all", activeTab === 'comments' ? "text-brand border-b-2 border-brand" : "text-gray-500 hover:text-white")}
        >
          Moderation
        </button>
        <button 
          onClick={() => setActiveTab('affiliates')}
          className={cn("px-4 py-2 text-sm font-bold transition-all", activeTab === 'affiliates' ? "text-brand border-b-2 border-brand" : "text-gray-500 hover:text-white")}
        >
          Affiliates
        </button>
      </div>

      {activeTab === 'affiliates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-card-dark p-8 rounded-3xl border border-white/5 h-fit">
              <h3 className="text-xl font-bold mb-6">Add Affiliate Link</h3>
              <form onSubmit={addAffiliateLink} className="space-y-4">
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
                 <button className="w-full py-3 bg-brand text-white font-bold rounded-xl mt-4 hover:bg-brand-light transition-all neon-glow">
                   Add Link
                 </button>
              </form>
           </div>
           
           <div className="lg:col-span-2 bg-card-dark rounded-3xl border border-white/5 overflow-hidden">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Active Affiliate Links</h3>
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
                <tbody className="divide-y divide-white/5">
                  {affiliateLinks.map(link => (
                    <tr key={link.id} className="hover:bg-white/1 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{link.animeId}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">{link.platform}</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">{link.clicks || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteAffiliateLink(link.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] h-[400px]">
          <h3 className="text-lg font-bold mb-8 flex items-center justify-between">
            Engagement Analytics
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase">Day</button>
              <button className="px-3 py-1 rounded-full bg-indigo-500 text-[10px] font-bold uppercase">Week</button>
            </div>
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0a0a0b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", fontSize: "12px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] h-[400px]">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
             Growth Metrics
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                 contentStyle={{ backgroundColor: "#0a0a0b", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}
              />
              <Bar dataKey="users" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lists Section */}
      {activeTab !== 'affiliates' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className={cn("bg-card-dark border border-white/5 rounded-3xl overflow-hidden", activeTab === 'users' ? "xl:col-span-3" : "xl:col-span-2")}>
            <div className="p-6 border-bottom border-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5 text-gray-500" /> User Management</h3>
              <span className="text-xs text-gray-500">{usersList.length} total profiles</span>
            </div>
            {activeTab === 'users' && (
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
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u) => (
                      <tr key={u.uid} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                            <div>
                              <p className="text-sm font-bold text-white">{u.username}</p>
                              <p className="text-[10px] text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                            u.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleAdmin(u.uid, u.role)}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-brand transition-all"
                            title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          >
                            {u.role === "admin" ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {activeTab === 'comments' && (
            <div className="bg-card-dark border border-white/5 rounded-3xl overflow-hidden flex flex-col xl:col-span-3">
              <div className="p-6 border-bottom border-white/5">
                <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gray-500" /> Content Moderation</h3>
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
                       <span className="text-[8px] text-gray-600">Just now</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
