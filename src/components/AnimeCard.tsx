import React from "react";
import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { motion } from "motion/react";
import { Anime } from "../services/animeApi";

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-white/5 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 border border-white/5 hover:border-white/20"
    >
      <Link to={`/anime/${anime.mal_id}`}>
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div className="w-full">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center neon-glow mb-2">
                <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
              </div>
            </div>
          </div>
          {anime.score && (
            <div className="absolute top-2 right-2 glass px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-white">{anime.score}</span>
            </div>
          )}
        </div>
        <div className="p-4 bg-black/20">
          <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-brand transition-colors">
            {anime.title_english || anime.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <span>{anime.year || anime.status}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>{anime.episodes ? `${anime.episodes} Eps` : 'Ongoing'}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
