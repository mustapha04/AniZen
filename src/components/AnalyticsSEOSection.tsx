import React, { useEffect, useState } from "react";
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
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  Globe, 
  Search, 
  Layers, 
  LayoutDashboard, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp, 
  MousePointer, 
  Eye, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  Power, 
  Link2, 
  AlertCircle, 
  PieChart, 
  Map, 
  Laptop, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Download,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface AnalyticsConfig {
  googleAnalytics: { connected: boolean; measurementId: string; envConnected: boolean };
  searchConsole: { connected: boolean; clientEmail: string; envConnected: boolean };
  bingWebmaster: { connected: boolean; apiKey: string; envConnected: boolean };
}

export default function AnalyticsSEOSection() {
  const [activeTab, setActiveTab] = useState<'unified' | 'ga4' | 'gsc' | 'bing'>('unified');
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analyticsTheme, setAnalyticsTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Connection Configurations State
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);

  // Live Metrics Data State
  const [data, setData] = useState<any>(null);

  // Forms Fields
  const [gaIdInput, setGaIdInput] = useState("");
  const [gscEmailInput, setGscEmailInput] = useState("");
  const [gscSecretInput, setGscSecretInput] = useState("");
  const [bingKeyInput, setBingKeyInput] = useState("");

  // Submitting States
  const [submittingGA, setSubmittingGA] = useState(false);
  const [submittingGSC, setSubmittingGSC] = useState(false);
  const [submittingBing, setSubmittingBing] = useState(false);

  // Fetch Connection Settings & Analytics Data
  async function fetchAllData(isSilent = false) {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-admin-role": "admin"
      };

      // Fetch connection statuses
      const configRes = await fetch("/api/admin/analytics/config", { headers });
      if (!configRes.ok) {
        throw new Error("Could not authorize or fetch analytics settings credentials.");
      }
      const configJson = await configRes.json();
      setConfig(configJson);

      // Populate input placeholders if connected
      if (configJson.googleAnalytics.connected) {
        setGaIdInput(configJson.googleAnalytics.measurementId || "");
      }
      if (configJson.searchConsole.connected) {
        setGscEmailInput(configJson.searchConsole.clientEmail || "");
      }

      // Fetch dynamic analytics numbers
      let url = `/api/admin/analytics/data?timeframe=${timeframe}`;
      if (timeframe === "custom" && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const dataRes = await fetch(url, { headers });
      if (!dataRes.ok) {
        throw new Error("Failed to load search and visitor performance metrics.");
      }
      const dataJson = await dataRes.json();
      setData(dataJson);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching system analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, [timeframe]);

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchAllData();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData(true);
  };

  // Google Analytics Toggle
  const handleConnectGA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGA(true);
    try {
      const isConnected = !config?.googleAnalytics.connected;
      const response = await fetch("/api/admin/analytics/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin"
        },
        body: JSON.stringify({
          service: "googleAnalytics",
          connected: isConnected,
          data: isConnected ? { measurementId: gaIdInput } : {}
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to update Google Analytics config");
      
      await fetchAllData(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingGA(false);
    }
  };

  // Google Search Console Toggle
  const handleConnectGSC = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGSC(true);
    try {
      const isConnected = !config?.searchConsole.connected;
      const response = await fetch("/api/admin/analytics/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin"
        },
        body: JSON.stringify({
          service: "searchConsole",
          connected: isConnected,
          data: isConnected ? { clientEmail: gscEmailInput, clientSecret: gscSecretInput } : {}
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to update Search Console status");
      
      setGscSecretInput("");
      await fetchAllData(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingGSC(false);
    }
  };

  // Bing Webmaster Toggle
  const handleConnectBing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBing(true);
    try {
      const isConnected = !config?.bingWebmaster.connected;
      const response = await fetch("/api/admin/analytics/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin"
        },
        body: JSON.stringify({
          service: "bingWebmaster",
          connected: isConnected,
          data: isConnected ? { apiKey: bingKeyInput } : {}
        })
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to update Bing Webmaster config");
      
      setBingKeyInput("");
      await fetchAllData(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingBing(false);
    }
  };

  // Loading Screen Skeleton
  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-zinc-950/20 rounded-3xl animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-white/5 rounded-lg" />
            <div className="h-4 w-72 bg-white/5 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
          <div className="h-28 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const isLight = analyticsTheme === "light";

  return (
    <div className={cn(
      "p-6 sm:p-8 rounded-[36px] border transition-all duration-300 relative overflow-hidden",
      isLight 
        ? "bg-stone-50 border-stone-200 text-stone-800 shadow-xl" 
        : "bg-card-dark border-white/5 text-zinc-300"
    )}>
      
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header and Controls Row */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 pb-8 border-b border-dashed mb-8 border-zinc-700/20">
        <div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
              isLight ? "bg-stone-200 text-stone-600" : "bg-white/5 text-zinc-400"
            )}>
              Admin SEO Intelligence
            </span>
            <div className={cn("w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping")} />
          </div>
          
          <h2 className={cn(
            "text-3xl font-display font-black tracking-tight uppercase mt-2.5",
            isLight ? "text-stone-900" : "text-white"
          )}>
            Analytics & SEO Operations
          </h2>
          <p className={cn("text-xs mt-1", isLight ? "text-stone-500" : "text-zinc-500")}>
            Core telemetry, indexing signals, crawl schedules, and multi-search console status.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Active Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "p-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-bold",
              isLight 
                ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-100" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
            title="Reload metrics data"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin text-brand")} />
            {refreshing ? "Refreshing..." : "Sync Logs"}
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setAnalyticsTheme(prev => prev === "dark" ? "light" : "dark")}
            className={cn(
              "p-3 rounded-xl border transition-all flex items-center justify-center text-xs font-bold gap-2",
              isLight 
                ? "bg-white border-stone-200 text-stone-600 hover:bg-stone-100" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-brand" />
                <span>Midnight Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Daylight Theme</span>
              </>
            )}
          </button>

          {/* Timeframe Select */}
          <div className={cn(
            "p-1 rounded-xl border flex gap-1",
            isLight ? "bg-stone-100 border-stone-200" : "bg-zinc-900/80 border-white/10"
          )}>
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "custom", label: "Custom Range" }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                  timeframe === tf.id
                    ? isLight 
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" 
                      : "bg-white/10 text-white"
                    : isLight 
                      ? "text-stone-500 hover:text-stone-800"
                      : "text-zinc-500 hover:text-zinc-200"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Picker Area */}
      {timeframe === "custom" && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleCustomDateSubmit}
          className={cn(
            "p-5 rounded-2xl border mb-6 flex flex-wrap items-end gap-5",
            isLight ? "bg-stone-100 border-stone-200" : "bg-white/2 border-white/5"
          )}
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">Start date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={cn(
                "px-3 py-2 rounded-xl border font-mono text-xs focus:ring-1 focus:ring-brand focus:outline-none",
                isLight ? "bg-white border-stone-300 text-stone-800" : "bg-zinc-950 border-white/10 text-white"
              )}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">End date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={cn(
                "px-3 py-2 rounded-xl border font-mono text-xs focus:ring-1 focus:ring-brand focus:outline-none",
                isLight ? "bg-white border-stone-300 text-stone-800" : "bg-zinc-950 border-white/10 text-white"
              )}
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-2 bg-brand text-white font-extrabold text-xs rounded-xl hover:bg-brand-light cursor-pointer transition-all uppercase tracking-wider h-[38px]"
          >
            Apply Frame
          </button>
        </motion.form>
      )}

      {/* Inner Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b pb-4 border-zinc-700/10">
        {[
          { id: "unified", label: "Unified Intelligence Board", icon: LayoutDashboard, color: "text-brand" },
          { id: "ga4", label: "Google Analytics (GA4)", icon: Globe, color: "text-amber-500" },
          { id: "gsc", label: "Google Search Console", icon: Search, color: "text-indigo-400" },
          { id: "bing", label: "Bing Webmaster Tools", icon: Layers, color: "text-emerald-400" }
        ].map(tb => {
          const Icon = tb.icon;
          const isSelected = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all border",
                isSelected
                  ? isLight 
                    ? "bg-white border-stone-300 text-stone-900 shadow-md"
                    : "bg-white/5 border-white/15 text-white shadow-xl shadow-black/30"
                  : isLight 
                    ? "bg-stone-50 border-stone-200/60 text-stone-500 hover:text-stone-800"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("w-4 h-4", isSelected ? tb.color : "text-zinc-500")} />
              <span>{tb.label}</span>
              {/* Connected Dots */}
              {tb.id !== "unified" && config && (config as any)[tb.id === "ga4" ? "googleAnalytics" : tb.id === "gsc" ? "searchConsole" : "bingWebmaster"].connected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Render Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {activeTab === "unified" && renderUnifiedDashboard()}
          {activeTab === "ga4" && renderGoogleAnalytics()}
          {activeTab === "gsc" && renderSearchConsole()}
          {activeTab === "bing" && renderBingWebmaster()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // ==========================================
  // Section 1: Google Analytics (GA4) Tab Setup
  // ==========================================
  function renderGoogleAnalytics() {
    const ga = data?.googleAnalytics;
    const isConn = config?.googleAnalytics.connected;

    return (
      <div className="space-y-8">
        {/* Connection Box */}
        <div className={cn(
          "p-6 rounded-3xl border",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/50 border-white/5"
        )}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn("font-bold text-lg", isLight ? "text-stone-900" : "text-white")}>
                  GA4 Connection Settings
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Connect your Google Analytics 4 tracking tags to log custom view signals.
                </p>
                {isConn && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-500 font-bold">
                      Connected ({config?.googleAnalytics.envConnected ? "Environment Configuration" : `Measurement ID: ${config?.googleAnalytics.measurementId}`})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Config Form Action */}
            <form onSubmit={handleConnectGA} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {!isConn && (
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={gaIdInput}
                  onChange={e => setGaIdInput(e.target.value)}
                  disabled={config?.googleAnalytics.envConnected}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none w-full sm:w-64",
                    isLight ? "bg-stone-50 border border-stone-300 text-stone-800" : "bg-zinc-950 border border-white/10 text-white"
                  )}
                  required
                />
              )}
              <button
                type="submit"
                disabled={submittingGA || config?.googleAnalytics.envConnected}
                className={cn(
                  "px-6 py-2.5 font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center",
                  isConn
                    ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                    : "bg-amber-500 text-white hover:bg-amber-600 neon-glow"
                )}
              >
                <Power className="w-4 h-4" />
                {submittingGA ? "Linking..." : isConn ? "Disconnect" : "Connect GA4"}
              </button>
            </form>
          </div>
        </div>

        {/* Big Visitor Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={cn(
            "lg:col-span-2 p-6 sm:p-8 rounded-3xl border flex flex-col justify-between min-h-[400px]",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div>
              <h3 className={cn("text-base font-bold", isLight ? "text-stone-900" : "text-white")}>Visitor Telemetry Over Time</h3>
              <p className="text-xs text-zinc-500">Hourly logs for Today, else daily summaries.</p>
            </div>
            
            <div className="h-[280px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.timeline || []}>
                  <defs>
                    <linearGradient id="gaVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gaViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e5e7eb" : "rgba(255,255,255,0.05)"} vertical={false} />
                  <XAxis dataKey="name" stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? "#ffffff" : "#0d0d0f", 
                      border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.08)", 
                      borderRadius: "16px", 
                      color: isLight ? "#111" : "#fff" 
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" name="Unique Visitors" dataKey="visitors" stroke="#6366f1" fillOpacity={1} fill="url(#gaVisitors)" strokeWidth={3} />
                  <Area type="monotone" name="Page Views" dataKey="pageviews" stroke="#10b981" fillOpacity={1} fill="url(#gaViews)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Channels Breakdown */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div>
              <h3 className={cn("text-base font-bold", isLight ? "text-stone-900" : "text-white")}>Core Traffic Ingress</h3>
              <p className="text-xs text-zinc-500">Distribution of referrers and mediums.</p>
            </div>

            <div className="space-y-4 my-6">
              {ga?.trafficSources.map((ch: any) => (
                <div key={ch.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono">
                    <span className={isLight ? "text-stone-700" : "text-zinc-300"}>{ch.name}</span>
                    <span className="text-brand">{ch.value}%</span>
                  </div>
                  <div className={cn("w-full h-2.5 rounded-full overflow-hidden", isLight ? "bg-stone-200" : "bg-white/5")}>
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-brand" 
                      style={{ width: `${ch.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={cn(
              "p-4 rounded-2xl flex items-center gap-3.5",
              isLight ? "bg-stone-100" : "bg-white/5"
            )}>
              <div className="p-2.5 bg-brand/10 rounded-xl text-brand">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Realtime Users</span>
                <span className={cn("text-xl font-black font-mono", isLight ? "text-stone-900" : "text-white")}>
                  {ga?.metrics.realTimeActive} Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Rows: Device Breakdown & Geographical Shares */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Countries */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Geographical Distribution</h3>
                <p className="text-xs text-zinc-500">Top user locations accessing AniZen.</p>
              </div>
              <Map className="w-5 h-5 text-zinc-500" />
            </div>

            <div className="divide-y divide-zinc-700/10">
              {ga?.countryAnalytics.map((c: any) => (
                <div key={c.name} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner",
                      isLight ? "bg-stone-100 text-stone-600 border border-stone-200" : "bg-white/5 text-zinc-400 border border-white/5"
                    )}>
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">{c.name}</span>
                  </div>
                  <span className={cn("font-mono text-xs font-black", isLight ? "text-stone-900" : "text-white")}>
                    {c.value.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dev and Device Layout */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Platforms & Devices</h3>
                  <p className="text-xs text-zinc-500">Device classification of client viewports.</p>
                </div>
                <Laptop className="w-5 h-5 text-zinc-500" />
              </div>

              {/* Flex Grid Visual representation */}
              <div className="flex gap-2 w-full h-[60px] rounded-2xl overflow-hidden my-8">
                {ga?.deviceBreakdown.map((dev: any) => (
                  <div 
                    key={dev.name} 
                    className="h-full flex flex-col justify-center items-center text-white/90 font-mono text-[10px] uppercase font-black"
                    style={{ 
                      width: `${dev.value}%`, 
                      backgroundColor: dev.name === "Mobile" ? "#6366f1" : dev.name === "Desktop" ? "#10b981" : "#f59e0b" 
                    }}
                    title={`${dev.name}: ${dev.value}%`}
                  >
                    <span>{dev.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Mobile</span>
                58% viewport share
              </div>
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Desktop</span>
                35% viewport share
              </div>
              <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
                <span className="block text-[8px] uppercase text-zinc-500 font-bold mb-1">Tablet</span>
                7% viewport share
              </div>
            </div>
          </div>
        </div>

        {/* Top Active Paths */}
        <div className={cn(
          "rounded-3xl border overflow-hidden",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
        )}>
          <div className="p-6 border-b border-zinc-700/10">
            <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Entry & Landing Pages Performance</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Calculated based on chronological unique routing signals.</p>
          </div>

          <table className="w-full text-left font-sans text-xs">
            <thead className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isLight ? "bg-stone-100 text-stone-600" : "bg-white/2 text-zinc-400"
            )}>
              <tr>
                <th className="px-6 py-4">Sitemap URL Route</th>
                <th className="px-6 py-4 text-center">Page Views Volume</th>
                <th className="px-6 py-4 text-center">Active Real-Time Live Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/10">
              {ga?.topPages.map((pg: any) => (
                <tr key={pg.page} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-brand hover:underline cursor-pointer">{pg.page}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold">{pg.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">
                      {pg.activeUsers} active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // Section 2: Google Search Console (GSC) Tab Settings
  // ==========================================
  function renderSearchConsole() {
    const sc = data?.googleSearchConsole;
    const isConn = config?.searchConsole.connected;

    return (
      <div className="space-y-8">
        {/* Connection Setup */}
        <div className={cn(
          "p-6 rounded-3xl border",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/50 border-white/5"
        )}>
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn("font-bold text-lg", isLight ? "text-stone-900" : "text-white")}>
                  Google Search Console Connection
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Connect via authorized Google API Service Account Key to fetch click logs and indexing status.
                </p>
                {isConn && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs text-indigo-400 font-bold">
                      Connected ({config?.searchConsole.envConnected ? "Environment Service Secret" : `Client Email: ${config?.searchConsole.clientEmail}`})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Config GSC Form */}
            <form onSubmit={handleConnectGSC} className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              {!isConn && (
                <>
                  <input
                    type="email"
                    placeholder="service-account@test.iam.gserviceaccount.com"
                    value={gscEmailInput}
                    onChange={e => setGscEmailInput(e.target.value)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full sm:w-64",
                      isLight ? "bg-stone-50 border border-stone-300 text-stone-800" : "bg-zinc-950 border border-white/10 text-white"
                    )}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Private Client Key"
                    value={gscSecretInput}
                    onChange={e => setGscSecretInput(e.target.value)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full sm:w-44",
                      isLight ? "bg-stone-50 border border-stone-300 text-stone-800" : "bg-zinc-950 border border-white/10 text-white"
                    )}
                    required
                  />
                </>
              )}
              <button
                type="submit"
                disabled={submittingGSC || config?.searchConsole.envConnected}
                className={cn(
                  "px-6 py-2.5 font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center",
                  isConn
                    ? "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 neon-glow"
                )}
              >
                <Power className="w-4 h-4" />
                {submittingGSC ? "Linking..." : isConn ? "Disconnect" : "Connect GSC API"}
              </button>
            </form>
          </div>
        </div>

        {/* Indexation Warnings / Severe Alerts Row */}
        {sc?.alerts && sc.alerts.length > 0 && (
          <div className="space-y-4">
            {sc.alerts.map((al: any) => (
              <div 
                key={al.code} 
                className={cn(
                  "p-4 rounded-2xl border flex items-start gap-3.5",
                  al.type === "warning" 
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-500" 
                    : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                )}
              >
                {al.type === "warning" ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <Info className="w-5 h-5 flex-shrink-0" />}
                <div className="text-xs">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-0.5">
                    <span>Search Index Notice</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-white/10 rounded">{al.code}</span>
                  </div>
                  <p className={isLight ? "text-stone-700" : "text-zinc-400"}>{al.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clicks and Impressions Double Graph */}
        <div className={cn(
          "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between min-h-[400px]",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
        )}>
          <div>
            <h3 className={cn("text-base font-bold", isLight ? "text-stone-900" : "text-white")}>Google Organic Search Click telemetry</h3>
            <p className="text-xs text-zinc-500">Comparing impressions against direct user redirect clicks.</p>
          </div>

          <div className="h-[280px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e5e7eb" : "rgba(255,255,255,0.05)"} vertical={false} />
                <XAxis dataKey="name" stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? "#ffffff" : "#0d0d0f", 
                    border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.08)", 
                    borderRadius: "16px", 
                    color: isLight ? "#111" : "#fff" 
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="rect" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" name="Organic Impressions" dataKey="impressions" stroke="#818cf8" strokeWidth={3} dot={{ r: 2 }} />
                <Line type="monotone" name="Organic Redirect Clicks" dataKey="clicks" stroke="#ec4899" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower layout split: Queries List & Search Index Cover */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Queries list */}
          <div className={cn(
            "lg:col-span-2 rounded-3xl border overflow-hidden",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="p-6 border-b border-zinc-700/10">
              <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Top Google Search Queries</h3>
              <p className="text-xs text-zinc-500">Impressions and positions driven by natural keyword indexes.</p>
            </div>

            <table className="w-full text-left font-sans text-xs">
              <thead className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isLight ? "bg-stone-100 text-stone-600" : "bg-white/2 text-zinc-400"
              )}>
                <tr>
                  <th className="px-6 py-3">Search Query String</th>
                  <th className="px-6 py-3 text-center">Clicks</th>
                  <th className="px-6 py-3 text-center">Impressions</th>
                  <th className="px-6 py-3 text-center">CTR %</th>
                  <th className="px-6 py-3 text-center">Avg Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/10">
                {sc?.topQueries.map((q: any) => (
                  <tr key={q.query} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3.5 font-bold">{q.query}</td>
                    <td className="px-6 py-3.5 text-center font-mono">{q.clicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-zinc-500">{q.impressions.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-brand font-bold">{q.ctr}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-black text-emerald-500">#{q.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Indexing status summary */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div>
              <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Sitemap Indexing Coverage</h3>
              <p className="text-xs text-zinc-500">Discovered pages verified on Google schema.</p>
            </div>

            <div className="space-y-4 my-6">
              <div className={cn("p-4 rounded-2xl flex items-center justify-between", isLight ? "bg-stone-100" : "bg-white/3")}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-zinc-400">Indexed master-routes</span>
                </div>
                <span className={cn("font-mono text-sm font-black", isLight ? "text-stone-900" : "text-white")}>
                  {sc?.indexingSummary.indexed} pages
                </span>
              </div>

              <div className={cn("p-4 rounded-2xl flex items-center justify-between", isLight ? "bg-stone-100" : "bg-white/3")}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-zinc-400">Discovered – Not Indexed</span>
                </div>
                <span className={cn("font-mono text-sm font-black" , isLight ? "text-stone-900" : "text-white")}>
                  {sc?.indexingSummary.discoveredNotIndexed} routes
                </span>
              </div>

              <div className={cn("p-4 rounded-2xl flex items-center justify-between", isLight ? "bg-stone-100" : "bg-white/3")}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-bold text-zinc-400">Crawled – Not Indexed</span>
                </div>
                <span className={cn("font-mono text-sm font-black", isLight ? "text-stone-900" : "text-white")}>
                  {sc?.indexingSummary.crawledNotIndexed} pages
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-brand/15 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                Index status is healthy
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Section 3: Bing Webmaster Tools Tab Panel Settings
  // ==========================================
  function renderBingWebmaster() {
    const bing = data?.bingWebmaster;
    const isConn = config?.bingWebmaster.connected;

    return (
      <div className="space-y-8">
        {/* Connection Setup */}
        <div className={cn(
          "p-6 rounded-3xl border",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/50 border-white/5"
        )}>
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn("font-bold text-lg", isLight ? "text-stone-900" : "text-white")}>
                  Bing Webmaster Tools Connection
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Connect using Bing API token key to crawl and check sitemaps records.
                </p>
                {isConn && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-bold">
                      Connected ({config?.bingWebmaster.envConnected ? "Environment secret token" : `Muted Key: ${config?.bingWebmaster.apiKey}`})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Config Bing Form */}
            <form onSubmit={handleConnectBing} className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {!isConn && (
                <input
                  type="password"
                  placeholder="Bing Webmaster API Token Key"
                  value={bingKeyInput}
                  onChange={e => setBingKeyInput(e.target.value)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none w-full sm:w-64",
                    isLight ? "bg-stone-50 border border-stone-300 text-stone-800" : "bg-zinc-950 border border-white/10 text-white"
                  )}
                  required
                />
              )}
              <button
                type="submit"
                disabled={submittingBing || config?.bingWebmaster.envConnected}
                className={cn(
                  "px-6 py-2.5 font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center",
                  isConn
                    ? "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
                    : "bg-emerald-600 text-white hover:bg-emerald-500 neon-glow"
                )}
              >
                <Power className="w-4 h-4" />
                {submittingBing ? "Linking..." : isConn ? "Disconnect" : "Connect Bing"}
              </button>
            </form>
          </div>
        </div>

        {/* Bing Crawling volume trends graph */}
        <div className={cn(
          "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between min-h-[400px]",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
        )}>
          <div>
            <h3 className={cn("text-base font-bold", isLight ? "text-stone-900" : "text-white")}>Bing Indexing Volume</h3>
            <p className="text-xs text-zinc-500">Impressions driven by Bing search queries index over the timeframe.</p>
          </div>

          <div className="h-[280px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e5e7eb" : "rgba(255,255,255,0.05)"} vertical={false} />
                <XAxis dataKey="name" stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? "#ffffff" : "#0d0d0f", 
                    border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.08)", 
                    borderRadius: "16px", 
                    color: isLight ? "#111" : "#fff" 
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="rect" iconSize={12} wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="Bing Impressions" dataKey="bingImpressions" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Bing Direct Clicks" dataKey="bingClicks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Split view: Keywords and SEO issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key terms */}
          <div className={cn(
            "rounded-3xl border overflow-hidden",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="p-6 border-b border-zinc-700/10">
              <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Bing Index Keywords</h3>
              <p className="text-xs text-zinc-500">Clicks and query impression rankings on Bing search engine.</p>
            </div>

            <table className="w-full text-left font-sans text-xs">
              <thead className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isLight ? "bg-stone-100 text-stone-600" : "bg-white/2 text-zinc-400"
              )}>
                <tr>
                  <th className="px-6 py-3.5">Keyword String</th>
                  <th className="px-6 py-3.5 text-center">Clicks</th>
                  <th className="px-6 py-3.5 text-center">Impressions</th>
                  <th className="px-6 py-3.5 text-center">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/10">
                {bing?.keywords.map((k: any) => (
                  <tr key={k.keyword} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-bold">{k.keyword}</td>
                    <td className="px-6 py-4 text-center font-mono">{k.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-mono text-zinc-500">{k.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-mono font-black text-brand">#{k.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEO reports crawling Issues */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Bing SEO Code Audits</h3>
                <p className="text-xs text-zinc-500">HTML issues indexed on canonical crawling sweeps.</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-4">
              {bing?.seoIssues.map((is: any) => (
                <div 
                  key={is.issue} 
                  className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    is.severity === "medium" 
                      ? "bg-amber-500/5 border-amber-500/10 text-amber-500" 
                      : "bg-blue-500/5 border-blue-500/10 text-blue-400"
                  )}
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest">{is.severity} Severity severity</span>
                    <p className={isLight ? "text-stone-700" : "text-zinc-300"}>{is.issue}</p>
                  </div>
                  <span className={cn("font-mono font-extrabold text-xs px-2.5 py-1.5 rounded-xl", isLight ? "bg-stone-200" : "bg-white/5")}>
                    {is.count} errors
                  </span>
                </div>
              ))}
            </div>

            <div className={cn(
              "p-4 rounded-2xl border text-center mt-6 flex justify-around items-center",
              isLight ? "bg-stone-100 border-stone-200/50" : "bg-white/3 border-white/5"
            )}>
              <div className="text-center">
                <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Sitemap config</span>
                <span className="text-xs font-black text-emerald-400">{bing?.metrics.sitemapStatus}</span>
              </div>
              <div className="w-[1px] h-8 bg-zinc-700/20" />
              <div className="text-center">
                <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Sitemaps crawled</span>
                <span className={cn("text-xs font-black", isLight ? "text-stone-900" : "text-white")}>1 parsed sitemap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Section 4: Unified Analytics Dashboard View
  // ==========================================
  function renderUnifiedDashboard() {
    const ga = data?.googleAnalytics;
    const sc = data?.googleSearchConsole;
    const bing = data?.bingWebmaster;

    return (
      <div className="space-y-8">
        {/* Core Consolidated Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UnifiedCard 
            title="Consolidated Visitors (GA4)" 
            value={ga?.metrics.totalVisitors.toLocaleString()} 
            icon={Globe} 
            color="text-indigo-400" 
            bgColor="bg-indigo-500/10" 
            trend="+12.4% vs last period"
          />
          <UnifiedCard 
            title="Google Organic Clicks" 
            value={sc?.metrics.clicks.toLocaleString()} 
            icon={Search} 
            color="text-pink-400" 
            bgColor="bg-pink-500/10" 
            trend="+8.9% CTR increase"
          />
          <UnifiedCard 
            title="Bing Organic Clicks" 
            value={bing?.metrics.clicks.toLocaleString()} 
            icon={Layers} 
            color="text-emerald-400" 
            bgColor="bg-emerald-500/10" 
            trend="+4.2% SEO growth"
          />
          <UnifiedCard 
            title="Average Search Ctr" 
            value={`${sc?.metrics.ctr}%`} 
            icon={TrendingUp} 
            color="text-amber-400" 
            bgColor="bg-amber-500/10" 
            trend={`Rank Avg Pos: #${sc?.metrics.position}`}
          />
        </div>

        {/* Unified Search Comparison Dual Area charts */}
        <div className={cn(
          "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between min-h-[440px]",
          isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
        )}>
          <div>
            <h3 className={cn("text-lg font-bold", isLight ? "text-stone-900" : "text-white")}>Consolidated Search Traffic</h3>
            <p className="text-xs text-zinc-500">Cross-comparing unique Google web clicks and Bing Webmaster crawls chronologically.</p>
          </div>

          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline || []}>
                <defs>
                  <linearGradient id="googleClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="bingClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e5e7eb" : "rgba(255,255,255,0.05)"} vertical={false} />
                <XAxis dataKey="name" stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isLight ? "#78716c" : "#52525b"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isLight ? "#ffffff" : "#0d0d0f", 
                    border: isLight ? "1px solid #e5e7eb" : "1px solid rgba(255,255,255,0.08)", 
                    borderRadius: "16px", 
                    color: isLight ? "#111" : "#fff" 
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" name="Google Click Traffic" dataKey="clicks" stroke="#ec4899" fillOpacity={1} fill="url(#googleClicks)" strokeWidth={3} />
                <Area type="monotone" name="Bing Click Traffic" dataKey="bingClicks" stroke="#10b981" fillOpacity={1} fill="url(#bingClicks)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Consolidated Layout Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick GA Core summaries */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Telemetry Overview</h3>
                <p className="text-xs text-zinc-500">Core GA engagement values.</p>
              </div>
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Bounce rate frequency</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {ga?.metrics.bounceRate}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Avg session stay</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {ga?.metrics.avgSessionDuration}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Page views quantity</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {ga?.metrics.pageviews.toLocaleString()} views
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 text-xs">
                <span className="text-zinc-500">Registered sessions</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {ga?.metrics.sessions.toLocaleString()} sessions
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab("ga4")}
              className={cn(
                "w-full py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl mt-6 flex items-center justify-center gap-1 cursor-pointer",
                isLight ? "bg-stone-100 hover:bg-stone-200 text-stone-700" : "bg-white/5 hover:bg-white/10 text-white"
              )}
            >
              <span>Audit GA4 metrics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Core Search Signals */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Organic Search Coverage</h3>
                <p className="text-xs text-zinc-500">Crawl indexes diagnostic logs.</p>
              </div>
              <Search className="w-5 h-5 text-pink-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Total index impressions</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {sc?.metrics.impressions.toLocaleString()} clicks
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Indexed pages sitemap</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {sc?.indexingSummary.indexed} URLs
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Crawl coverage warnings</span>
                <span className="font-mono text-amber-500 font-bold font-extrabold">
                  {sc?.alerts.filter((a: any) => a.type === "warning").length} Warnings
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 text-xs">
                <span className="text-zinc-500">Crawling alerts resolved</span>
                <span className="font-mono text-indigo-400 font-bold font-extrabold">
                  {sc?.alerts.filter((a: any) => a.type === "info").length} Logs verified
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab("gsc")}
              className={cn(
                "w-full py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl mt-6 flex items-center justify-center gap-1 cursor-pointer",
                isLight ? "bg-stone-100 hover:bg-stone-200 text-stone-700" : "bg-white/5 hover:bg-white/10 text-white"
              )}
            >
              <span>Manage Search Console</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Bing Overview */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl border flex flex-col justify-between",
            isLight ? "bg-white border-stone-200" : "bg-zinc-900/40 border-white/5"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={cn("font-bold text-base", isLight ? "text-stone-900" : "text-white")}>Bing Index Signal</h3>
                <p className="text-xs text-zinc-500">Crawl logs and Bing SEO errors.</p>
              </div>
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Crawled pages scan</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {bing?.metrics.crawledPages} pages
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Bing index listings</span>
                <span className={cn("font-mono font-bold font-black", isLight ? "text-stone-900" : "text-white")}>
                  {bing?.metrics.indexedPages} indexed
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-700/10 text-xs">
                <span className="text-zinc-500">Bing SEO Code warning</span>
                <span className="font-mono text-amber-500 font-bold font-extrabold">
                  {bing?.metrics.seoIssuesCount} occurrences
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 text-xs">
                <span className="text-zinc-500">Sitemap schedule parsed</span>
                <span className="font-mono text-emerald-400 font-bold font-extrabold">
                  {bing?.metrics.sitemapStatus}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab("bing")}
              className={cn(
                "w-full py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-xl mt-6 flex items-center justify-center gap-1 cursor-pointer",
                isLight ? "bg-stone-100 hover:bg-stone-200 text-stone-700" : "bg-white/5 hover:bg-white/10 text-white"
              )}
            >
              <span>Inspect Bing Webmaster</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper Card for Unified summary
  function UnifiedCard({ title, value, icon: Icon, color, bgColor, trend }: any) {
    return (
      <div className={cn(
        "p-6 rounded-2xl border transition-all flex flex-col justify-between h-36 font-sans",
        isLight ? "bg-white border-stone-200 shadow-sm" : "bg-zinc-900/40 border-white/5"
      )}>
        <div className="flex justify-between items-center">
          <span className={cn("text-[9px] uppercase font-black tracking-widest block", isLight ? "text-stone-500" : "text-zinc-500")}>
            {title}
          </span>
          <div className={cn("p-2 rounded-lg", bgColor, color)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 text-2xl font-black font-sans leading-none tracking-tight">
          <span className={isLight ? "text-stone-900" : "text-white"}>{value || "---"}</span>
        </div>

        <div className="mt-2 text-[10px] font-bold tracking-tight text-brand flex items-center gap-1 font-sans">
          <span>{trend}</span>
        </div>
      </div>
    );
  }
}
