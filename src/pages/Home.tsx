import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import AnimeCard from "../components/AnimeCard";
import { getTopAnime, getRecentAnime, Anime } from "../services/animeApi";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, TrendingUp, Sparkles, Calendar } from "lucide-react";

export default function Home() {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [recentAnime, setRecentAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [top, recent] = await Promise.all([getTopAnime(), getRecentAnime()]);
        setTopAnime(top);
        setRecentAnime(recent);
      } catch (error) {
        console.error("Failed to fetch anime data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-dark text-white">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  const trendingAnime = topAnime[0];

  return (
    <div className="pb-20 bg-main-dark bg-grid-pattern min-h-screen">
      {trendingAnime && <Hero anime={trendingAnime} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-24">
        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Discovery</span>
              <h2 className="text-4xl font-display font-black text-white tracking-tight">Prime Selections</h2>
            </div>
            <Link to="/search" className="text-zinc-500 hover:text-brand text-xs font-bold uppercase tracking-widest border-b border-zinc-800 pb-1">Browse All</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topAnime?.slice(0, 12).map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Seasonal</span>
              <h2 className="text-4xl font-display font-black text-white tracking-tight">Active Simulcasts</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recentAnime?.slice(0, 12).map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Section (Static choice or mix) */}
        <section className="bg-white/5 rounded-[40px] p-8 md:p-16 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-96 h-96 brand-gradient" />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block mb-4">Membership</span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tighter leading-none">Elevate Your Presence.</h2>
            <p className="text-zinc-500 max-w-xl mb-10 text-lg">
              Unlock the full potential of AniZen. AI-enhanced analytics, early access to screenings, 
              and a custom profile that stands out in the multiverse.
            </p>
            <button className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 neon-glow">
              Initialize Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
