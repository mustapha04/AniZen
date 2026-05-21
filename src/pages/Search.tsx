import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { searchAnime, getGenres, Anime, SearchOptions } from "../services/animeApi";
import AnimeCard from "../components/AnimeCard";
import SEO from "../components/SEO";
import { 
  Search as SearchIcon, 
  Filter, 
  Loader2, 
  X, 
  ChevronDown, 
  SlidersHorizontal, 
  Sparkles, 
  Tag, 
  Share2, 
  Copy, 
  Twitter, 
  Send,
  HelpCircle
} from "lucide-react";
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

const POPULAR_KEYWORDS = [
  "One Piece",
  "Naruto",
  "Jujutsu Kaisen",
  "Solo Leveling",
  "Demon Slayer",
  "Chainsaw Man",
  "Bleach",
  "Attack on Titan"
];

export default function Search() {
  const { genreName } = useParams<{ genreName?: string }>();
  const location = useLocation();
  const pathname = location.pathname;

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

  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse mode from route
  const mode = useMemo(() => {
    if (pathname.includes("/trending")) return "trending";
    if (pathname.includes("/top-rated")) return "top-rated";
    if (genreName) return "genre";
    return "search";
  }, [pathname, genreName]);

  // Fetch Genres Lists
  useEffect(() => {
    async function fetchGenres() {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (e) {
        console.error("Failed to load genres:", e);
      }
    }
    fetchGenres();
  }, []);

  // Handle preset filters based on URL route (SEO target landings)
  useEffect(() => {
    if (genres.length === 0) return;

    if (mode === "trending") {
      setQuery("");
      setSeason("");
      setYear("");
      setStatus("airing");
      setRating("");
      setMinScore("");
      setSelectedGenres([]);
      setShowFilters(false);
    } else if (mode === "top-rated") {
      setQuery("");
      setSeason("");
      setYear("");
      setStatus("");
      setRating("");
      setMinScore("8.0");
      setSelectedGenres([]);
      setShowFilters(false);
    } else if (mode === "genre" && genreName) {
      // Find matching genre in fetched lists
      const formattedGenre = genreName.toLowerCase().replace(/-/g, " ");
      const foundGenre = genres.find(
        g => g.name.toLowerCase() === formattedGenre || g.name.toLowerCase().includes(formattedGenre)
      );
      if (foundGenre) {
        setSelectedGenres([foundGenre.mal_id]);
      }
      setQuery("");
      setSeason("");
      setYear("");
      setStatus("");
      setRating("");
      setMinScore("");
      setShowFilters(false);
    }
  }, [mode, genreName, genres]);

  // Fetch Results Callback
  const fetchResults = useCallback(async () => {
    // If it's a standard search and there are no active limits, clear results
    if (
      mode === "search" &&
      !query && 
      selectedGenres.length === 0 && 
      !season && 
      !year && 
      !status && 
      !rating && 
      !minScore
    ) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const options: SearchOptions = {
        q: query || undefined,
        genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
        season: season || undefined,
        year: year || undefined,
        status: status || undefined,
        rating: rating || undefined,
        min_score: minScore || undefined,
        order_by: mode === "top-rated" ? "score" : "popularity",
        sort: "desc"
      };
      
      const data = await searchAnime(options);
      setResults(data || []);
    } catch (e) {
      console.error("Search fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [query, selectedGenres, season, year, status, rating, minScore, mode]);

  // De-bounce fetch to avoid API rate limit triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, mode === "search" ? 500 : 50);
    return () => clearTimeout(timer);
  }, [fetchResults, mode]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [genreId] // Singly-select in quick switches to assist search indices
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

  // SEO Info Generation
  const seoDetails = useMemo(() => {
    const defaultMeta = {
      title: "AniZen – Search & Filter Anime Across the Multiverse",
      description: "Explore thousands of titles across the anime universe. Use advanced parameters like genres, season, year, rating, and score to discover your next epic saga.",
      keywords: "search anime, anime catalog, discovery tool, genre filter, seasons tracker, anizen database",
      breadcrumbLabel: "Discovery"
    };

    if (mode === "trending") {
      return {
        title: "Top Trending Anime - Global Popular Series Tracker | AniZen",
        description: "Browse the absolute most popular, trending, and highly anticipated ongoing anime series streaming now internationally on AniZen.",
        keywords: "trending anime, popular series, seasonal anime, dynamic rankings, top active shows",
        breadcrumbLabel: "Trending"
      };
    }

    if (mode === "top-rated") {
      return {
        title: "Top Rated Anime of All Time - Highest Ranked Masterpieces | AniZen",
        description: "Discover the highest-voted anime films and anime television series of all time indexed by ratings, scores, and review metrics.",
        keywords: "highest rated anime, top rated masterpieces, best anime of all time, community scores",
        breadcrumbLabel: "Top Rated"
      };
    }

    if (mode === "genre" && genreName) {
      const cleanGenre = genreName.charAt(0).toUpperCase() + genreName.slice(1).replace(/-/g, " ");
      return {
        title: `Best ${cleanGenre} Anime - Ultimate ${cleanGenre} Series Database | AniZen`,
        description: `Immerse yourself in our premier curation of the absolute best ${cleanGenre} anime series. Check official trailers, read community summaries, and track your metrics.`,
        keywords: `${cleanGenre} anime, best ${cleanGenre} action, dynamic anime, anime genre ${genreName}`,
        breadcrumbLabel: cleanGenre
      };
    }

    return defaultMeta;
  }, [mode, genreName]);

  // JSON-LD dynamic breadcrumb schema
  const breadcrumbSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": seoDetails.breadcrumbLabel,
          "item": window.location.href
        }
      ]
    };
  }, [seoDetails]);

  // Auto-complete simple list
  const autocompleteSuggestions = useMemo(() => {
    if (!query || results.length === 0) return [];
    return results
      .slice(0, 5)
      .map(a => ({ id: a.mal_id, title: a.title_english || a.title }));
  }, [query, results]);

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Structured FAQ Data for SEO content signaling
  const faqData = useMemo(() => {
    return [
      {
        question: "How do I filter anime on AniZen?",
        answer: "You can click on the 'Filters' button to expand advanced parameter controls. Easily sort and narrow down selections by release year, season (e.g. spring or winter), age warnings (PG, R, R-17), genres, or minimum community review score."
      },
      {
        question: "Does AniZen stream anime catalog items in full?",
        answer: "AniZen is a premier tracking, media catalog discovery, and review community hub. Every anime details page includes official high-definition trailers and safe, verified streaming redirect buttons to affiliate platforms like Crunchyroll and Netflix where you can watch full episodes."
      },
      {
        question: "How frequently are trending rankings updated?",
        answer: "Our seasonal databases, trending indexes, and airing charts are automatically kept synchronized with global metadata feeds to reflect popularity updates and active simulcast releases immediately."
      }
    ];
  }, []);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dynamic SEO Injector */}
      <SEO 
        title={seoDetails.title}
        description={seoDetails.description}
        keywords={seoDetails.keywords}
        schema={breadcrumbSchema}
      />

      {/* Internal Page Breadcrumbs for Indexation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-4 uppercase tracking-widest">
        <Link to="/" className="hover:text-brand transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-300 font-extrabold">{seoDetails.breadcrumbLabel}</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-white tracking-tight mb-2 uppercase">
              {mode === "trending" ? "Trending Showcase" : mode === "top-rated" ? "Critically Acclaimed" : seoDetails.breadcrumbLabel}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
              {mode === "trending" 
                ? "The most hyped, talked about, and high-energy broadcasts streaming currently." 
                : mode === "top-rated" 
                ? "The pinnacle of the animation medium. Award-winning and masterpiece-classified runs." 
                : `Custom filter catalog for ${seoDetails.breadcrumbLabel} on AniZen – your aesthetic media terminal.`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
            {/* Main Search Input */}
            <div className="relative flex-grow sm:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title..."
                className="w-full bg-card-dark border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-brand transition-all shadow-xl placeholder:text-gray-600 font-semibold"
              />
              
              {/* Autocomplete Search Dropdown */}
              <AnimatePresence>
                {autocompleteSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-2"
                  >
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-black px-3 py-1 mb-1">Matching Titles</span>
                    {autocompleteSuggestions.map((item) => (
                      <Link 
                        key={item.id}
                        to={`/anime/${item.id}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-200 hover:text-white transition-all text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl transition-all font-bold text-sm flex-grow sm:flex-none", 
                  showFilters ? "bg-brand text-white shadow-brand/20 shadow-lg" : "glass text-gray-300 hover:bg-white/5"
                )}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {hasActiveFilters && mode === "search" && <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse ml-1" />}
              </button>

              {/* Social Sharing */}
              <button 
                onClick={copyPageLink}
                title="Copy current search URL"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all relative"
              >
                {copiedLink ? (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">Copied Check!</span>
                ) : null}
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Popular Trending Keywords for Internal Linking & SEO signals */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white/2 p-3.5 rounded-2xl border border-white/5">
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500 mr-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand" /> Trending terms:
          </span>
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => {
                setQuery(kw);
                setShowFilters(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white transition-all cursor-pointer hover:border-brand/30"
            >
              #{kw}
            </button>
          ))}
        </div>

        {/* Search Parameter Panel */}
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="" className="bg-bg-dark">All Seasons</option>
                      {SEASONS.map(s => <option key={s} value={s} className="bg-bg-dark capitalize font-semibold">{s}</option>)}
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all placeholder:text-gray-600 font-bold"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="" className="bg-bg-dark">Any Status</option>
                      {STATUSES.map(s => <option key={s} value={s} className="bg-bg-dark capitalize font-semibold">{s}</option>)}
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
                          "px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
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
                          "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer",
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

        {/* Response Loader / Skeleton state for CLS optimization */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">Consulting the dynamic archives...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((anime, idx) => (
              <motion.div
                key={`${anime.mal_id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.04 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {!loading && hasActiveFilters && results.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/10 animate-bounce">
              <X className="w-8 h-8 text-red-500/30" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No dynamic results found</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">We couldn't locate any items matching your active search specs. Broaden fields and try again.</p>
            <button 
              onClick={clearAllFilters}
              className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              Clear all parameters
            </button>
          </div>
        )}

        {/* Landing Page Discovery prompt */}
        {mode === "search" && !hasActiveFilters && !loading && (
          <div className="py-24 text-center bg-white/2 rounded-3xl border border-white/5">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand/10"
            >
              <SearchIcon className="w-8 h-8 text-brand" />
            </motion.div>
            <h2 className="text-2xl font-display font-black text-white mb-3">Initialize Aesthetic Navigation</h2>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm">
              Input keyword queries or expand filters above to browse our global index of trailers, AI reviews, character lists, and rating logs.
            </p>
          </div>
        )}

        {/* Content SEO: Collapsible FAQ Section for Organic Ranking Rich Snippets */}
        <section className="mt-20 border-t border-white/5 pt-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-10">
              <HelpCircle className="w-10 h-10 text-brand mx-auto mb-3" />
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Discovery FAQ</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Frequently Asked Questions & Search Guides</p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, idx) => {
                const isOpen = faqOpenIdx === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-white/5 rounded-2xl bg-white/2 hover:bg-white/5 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-gray-200 hover:text-white text-sm"
                    >
                      <span className="leading-snug">{faq.question}</span>
                      <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="px-6 pb-6 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
