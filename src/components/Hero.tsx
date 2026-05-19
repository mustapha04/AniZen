import React from "react";
import { Play, Info, Star } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Anime } from "../services/animeApi";

interface HeroProps {
  anime: Anime;
}

export default function Hero({ anime }: HeroProps) {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-full object-cover object-top scale-110 blur-[2px] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/5 text-zinc-100 text-[10px] font-bold rounded-lg border border-white/10 uppercase tracking-widest shadow-xl">
              Trending Discovery
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">{anime.score} Score</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-display font-black text-gradient leading-[0.9] mb-8 tracking-tighter">
            {anime.title_english || anime.title}
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 line-clamp-3 max-w-xl leading-relaxed">
            {anime.synopsis}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={`/anime/${anime.mal_id}`}
              className="px-10 py-5 brand-gradient text-white font-bold rounded-2xl flex items-center gap-3 transition-all neon-glow shadow-2xl shadow-brand/20 group hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              Begin Journey
            </Link>
            <Link
              to={`/anime/${anime.mal_id}`}
              className="px-10 py-5 glass hover:bg-white/10 text-white font-bold rounded-2xl flex items-center gap-3 transition-all"
            >
              <Info className="w-5 h-5" />
              Archive
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative side element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
        <div className="text-[200px] font-black text-white/10 select-none rotate-90 translate-x-1/2">
          {anime.season?.toUpperCase() || "SEASON"}
        </div>
      </div>
    </div>
  );
}
