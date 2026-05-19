import React, { useState, useEffect, useCallback } from "react";
import { searchAnime, getGenres, Anime, SearchOptions } from "../services/animeApi";
import AnimeCard from "../components/AnimeCard";
import { Search as SearchIcon, Filter, Loader2, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const SEASONS = ["winter", "spring", "summer", "fall"];
const STATUSES = ["airing", "complete", "upcoming"];
const RATINGS = [
  { label: "G - All Ages", value: "g" },
  { label: "PG - Children", value: "pg" },
  { label: "PG-13 - Teens 13+", value: "pg13" },
  { label: "R - 17+ (violence & profanity)", value: "r17" },
  { label: "R+ - Mild Nudity", value: "r" },
  { label: "Rx - Hentai", value: "rx" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [minScore, setMinScore] = useState("");

  useEffect(() => {
    async function fetchGenres() {
      const data = await getGenres();
      setGenres(data);
    }
    fetchGenres();
  }, []);

  const fetchResults = useCallback(async () => {
    if (!query && selectedGenres.length === 0 && !season && !year && !status && !rating && !minScore) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const options: SearchOptions = {
        q: query || undefined,
        genres: selectedGenres.join(","),
        season: season || undefined,
        year: year || undefined,
        status: status || undefined,
        rating: rating || undefined,
        min_score: minScore || undefined,
        order_by: "popularity",
        sort: "desc"
      };
      
      const data = await searchAnime(options);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, selectedGenres, season, year, status, rating, minScore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchResults]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedGenres([]);
    setSeason("");
    setYear("");
    setStatus("");
    setRating("");
    setMinScore("");
  };

  const hasActiveFilters = query || selectedGenres.length > 0 || season || year || status || rating || minScore;

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-white tracking-tight mb-2">Discovery</h1>
            <p className="text-gray-500 text-sm">Explore thousands of titles across the anime multiverse.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-grow sm:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title..."
                className="w-full bg-card-dark border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand transition-all shadow-xl placeholder:text-gray-600"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl transition-all font-bold text-sm", 
                showFilters ? "bg-brand text-white shadow-brand/20 shadow-lg" : "glass text-gray-300 hover:bg-white/5"
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {hasActiveFilters && !query && <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse ml-1" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="glass p-8 rounded-[32px] border border-white/5 shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    Advanced Search Parameters
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-400/10 transition-colors">
                      <X className="w-3.5 h-3.5" /> Reset All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Season */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Season</label>
                    <select 
                      value={season} 
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-bg-dark">All Seasons</option>
                      {SEASONS.map(s => <option key={s} value={s} className="bg-bg-dark capitalize">{s}</option>)}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Year</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2024"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all placeholder:text-gray-600"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-bg-dark">Any Status</option>
                      {STATUSES.map(s => <option key={s} value={s} className="bg-bg-dark capitalize">{s}</option>)}
                    </select>
                  </div>

                  {/* Min Score */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Min Score ({minScore || '0'})</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="0.5"
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value === "0" ? "" : e.target.value)}
                      className="w-full accent-brand bg-white/5 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Genres</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">{selectedGenres.length} selected</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {genres.map(genre => (
                      <button
                        key={genre.mal_id}
                        onClick={() => toggleGenre(genre.mal_id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                          selectedGenres.includes(genre.mal_id) 
                            ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Age Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {RATINGS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setRating(rating === r.value ? "" : r.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                          rating === r.value 
                            ? "bg-white text-black border-white" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">Consulting the archives...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.05 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && hasActiveFilters && results.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/10">
              <X className="w-10 h-10 text-red-500/30" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">We couldn't find any anime matching your specific filters. Try broadening your search.</p>
            <button 
              onClick={clearAllFilters}
              className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              Clear all filters
            </button>
          </div>
        )}

        {!hasActiveFilters && !loading && (
          <div className="py-32 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand/10"
            >
              <SearchIcon className="w-10 h-10 text-brand" />
            </motion.div>
            <h2 className="text-2xl font-display font-black text-white mb-3">Begin Your Adventure</h2>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Use the search bar or filters above to discover your next obsession. 
              Search by title, genre, release year, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

