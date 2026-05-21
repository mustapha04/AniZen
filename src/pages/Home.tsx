import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import AnimeCard from "../components/AnimeCard";
import SEO from "../components/SEO";
import { getTopAnime, getRecentAnime, Anime } from "../services/animeApi";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, TrendingUp, Sparkles, Calendar, ArrowUpRight } from "lucide-react";

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
      {/* Home SEO Dynamic Targets */}
      <SEO 
        title="AniZen – Watch Anime Trailers, Ratings & Discover New Anime"
        description="Welcome to AniZen. Discover the top trending anime series, ongoing seasonal simulcasts, and critically acclaimed masterpieces. Watch trailers and generate AI reviews."
        keywords="AniZen, watch trailers, ratings, air schedules, review database, MyAnimeList data syncing, AI anime summaries, watch anime, trending action"
      />

      {trendingAnime && <Hero anime={trendingAnime} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-24">
        
        {/* Dynamic Genre Spotlight Cards for SEO and Easy Navigation */}
        <section>
          <div className="flex flex-col mb-10">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Aesthetic Discovery</span>
            <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">Spotlight Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Action", slug: "action", color: "from-red-500/10 to-red-600/5 hover:border-red-500/30 text-red-400" },
              { name: "Adventure", slug: "adventure", color: "from-green-500/10 to-green-600/5 hover:border-green-500/30 text-green-400" },
              { name: "Sci-Fi", slug: "sci-fi", color: "from-blue-500/10 to-blue-600/5 hover:border-blue-500/30 text-blue-400" },
              { name: "Fantasy", slug: "fantasy", color: "from-purple-500/10 to-purple-600/5 hover:border-purple-500/30 text-purple-400" },
              { name: "Comedy", slug: "comedy", color: "from-amber-500/10 to-amber-600/5 hover:border-amber-500/30 text-amber-400" },
              { name: "Drama", slug: "drama", color: "from-pink-500/10 to-pink-600/5 hover:border-pink-500/30 text-pink-400" },
            ].map((g, idx) => (
              <Link
                key={g.slug}
                to={`/genre/${g.slug}`}
                className={`p-6 rounded-2xl bg-zinc-900 border border-white/5 hover:scale-102 flex flex-col justify-between h-32 transition-all group hover:bg-gradient-to-br ${g.color}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Discover</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-lg font-black uppercase text-white tracking-wider group-hover:translate-x-1 transition-transform">{g.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Prime Selections</span>
              <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">Critically Acclaimed</h2>
            </div>
            <Link to="/top-rated" className="text-zinc-500 hover:text-brand text-xs font-bold uppercase tracking-widest border-b border-zinc-800 hover:border-brand transition-colors pb-1 flex items-center gap-1">
              Top Rated <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topAnime?.slice(0, 12).map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Simulcasts / Airing Series Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Active Simulcasts</span>
              <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">Trending Broadcasts</h2>
            </div>
            <Link to="/trending" className="text-zinc-500 hover:text-brand text-xs font-bold uppercase tracking-widest border-b border-zinc-800 hover:border-brand transition-colors pb-1 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recentAnime?.slice(0, 12).map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Membership CTA Section */}
        <section className="bg-white/5 rounded-[40px] p-8 md:p-16 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-96 h-96 brand-gradient" />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block mb-4">Membership</span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tighter leading-none uppercase">Elevate Your Log.</h2>
            <p className="text-zinc-500 max-w-xl mb-10 text-lg leading-relaxed">
              Unlock the full potential of AniZen. Stream high-fidelity promotional clips, save infinite collections, 
              write community review logs, and curate your custom avatar standing in the multiverse.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-102">
                Initialize Free Account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
