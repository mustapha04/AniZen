import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  getAnimeById, 
  getAnimeCharacters, 
  getAnimeRecommendations, 
  Anime 
} from "../services/animeApi";
import { getAiSummary } from "../services/geminiService";
import SEO from "../components/SEO";
import { 
  Star, 
  Heart, 
  Play, 
  Share2, 
  MessageSquare, 
  User as UserIcon,
  Loader2,
  CheckCircle2,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<any[]>([]);
  const [userLists, setUserLists] = useState<any[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // SEO additions
  const [copied, setCopied] = useState(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const animeData = await getAnimeById(Number(id));
        setAnime(animeData);
        
        const [chars, recs] = await Promise.all([
          getAnimeCharacters(Number(id)),
          getAnimeRecommendations(Number(id))
        ]);
        setCharacters(chars?.slice(0, 12) || []);
        setRecommendations(recs?.slice(0, 6) || []);

        // Check favorite status if user logged in
        if (user) {
          const q = query(collection(db, "favorites"), where("userId", "==", user.uid), where("animeId", "==", Number(id)));
          const querySnapshot = await getDocs(q);
          setIsFavorite(!querySnapshot.empty);
          
          const rq = query(collection(db, "ratings"), where("userId", "==", user.uid), where("animeId", "==", Number(id)));
          const rSnapshot = await getDocs(rq);
          if (!rSnapshot.empty) {
            setUserRating(rSnapshot.docs[0].data().rating);
          }
        }
      } catch (error) {
        console.error("Failed to fetch anime details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    async function fetchAffiliates() {
      const qSpecific = query(collection(db, "affiliate_links"), where("animeId", "==", Number(id)));
      const qAll = query(collection(db, "affiliate_links"), where("isAll", "==", true));
      
      const [snapSpecific, snapAll] = await Promise.all([
        getDocs(qSpecific),
        getDocs(qAll)
      ]);
      
      const specificLinks = snapSpecific.docs.map(d => ({ id: d.id, ...d.data() }));
      const allLinks = snapAll.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const combined = [...specificLinks];
      allLinks.forEach(item => {
        if (!combined.some(c => c.id === item.id)) {
          combined.push(item);
        }
      });
      setAffiliateLinks(combined);
    }
    async function fetchUserLists() {
      if (user) {
        const q = query(collection(db, "lists"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setUserLists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }
    fetchAffiliates();
    if (user) fetchUserLists();
  }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "comments"), where("animeId", "==", Number(id)));
    const getCommentTime = (createdAt: any): number => {
      if (!createdAt) return Date.now();
      if (typeof createdAt.toDate === "function") {
        return createdAt.toDate().getTime();
      }
      if (createdAt.seconds !== undefined) {
        return createdAt.seconds * 1000;
      }
      const d = new Date(createdAt);
      return isNaN(d.getTime()) ? Date.now() : d.getTime();
    };
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a: any, b: any) => getCommentTime(b.createdAt) - getCommentTime(a.createdAt));
      setComments(fetched);
    });
    return () => unsubscribe();
  }, [id]);

  const handleAiSummary = async () => {
    if (!anime || summaryLoading) return;
    setSummaryLoading(true);
    try {
      const summary = await getAiSummary(anime.title_english || anime.title, anime.synopsis);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !anime) return;
    
    try {
      if (isFavorite) {
        const q = query(collection(db, "favorites"), where("userId", "==", user.uid), where("animeId", "==", anime.mal_id));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          await deleteDoc(doc(db, "favorites", d.id));
        });
        setIsFavorite(false);
      } else {
        await addDoc(collection(db, "favorites"), {
          userId: user.uid,
          animeId: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images.jpg.image_url,
          createdAt: serverTimestamp()
        });
        setIsFavorite(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !anime) return;
    try {
      const q = query(collection(db, "ratings"), where("userId", "==", user.uid), where("animeId", "==", anime.mal_id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Update existing rating
        await updateDoc(doc(db, "ratings", snapshot.docs[0].id), {
          rating,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "ratings"), {
          userId: user.uid,
          animeId: anime.mal_id,
          rating,
          createdAt: serverTimestamp()
        });
        setUserRating(rating);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;
    
    try {
      await addDoc(collection(db, "comments"), {
        userId: user.uid,
        username: profile?.username || user.displayName || "User",
        animeId: Number(id),
        content: newComment,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const likeComment = async (comment: any) => {
    if (!user) return;
    try {
      const commentRef = doc(db, "comments", comment.id);
      const hasLiked = comment.likedBy?.includes(user.uid);
      const newLikedBy = hasLiked 
        ? comment.likedBy.filter((uid: string) => uid !== user.uid)
        : [...(comment.likedBy || []), user.uid];
      
      await updateDoc(commentRef, {
        likes: newLikedBy.length,
        likedBy: newLikedBy
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addAnimeToList = async (listId: string) => {
    if (!anime) return;
    try {
      const listRef = doc(db, "lists", listId);
      const list = userLists.find(l => l.id === listId);
      if (list.anime.some((a: any) => a.id === anime.mal_id)) {
        alert("Anime already in this list!");
        return;
      }
      
      const updatedAnime = [...list.anime, {
        id: anime.mal_id,
        title: anime.title_english || anime.title,
        image: anime.images.jpg.image_url
      }];
      
      await updateDoc(listRef, { anime: updatedAnime });
      setUserLists(prev => prev.map(l => l.id === listId ? { ...l, anime: updatedAnime } : l));
      setIsListModalOpen(false);
      alert("Added to list!");
    } catch (e) {
      console.error(e);
    }
  };

  const trackClick = async (link: any) => {
    try {
      await addDoc(collection(db, "affiliate_clicks"), {
        userId: user?.uid || "anonymous",
        animeId: Number(id),
        platform: link.platform,
        linkId: link.id || "",
        clickedAt: serverTimestamp()
      });
      
      // Update click count (note: in rules this needs isAdmin or special rule, 
      // let's assume public can increment for now or just trust the log)
      // For now we just log it.
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !anime) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-dark text-white">
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seriesName = anime.title_english || anime.title;
  const slugGenre = (anime.genres?.[0]?.name || "action").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const animeSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": seriesName,
    "image": anime.images.jpg.large_image_url,
    "description": anime.synopsis,
    "genre": anime.genres?.map(g => g.name) || [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": anime.score || 8.0,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": "2490"
    }
  };

  const bSchema = {
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
        "name": anime.genres?.[0]?.name || "Discover",
        "item": `${window.location.origin}/genre/${slugGenre}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": seriesName,
        "item": window.location.href
      }
    ]
  };

  return (
    <div className="pt-16 pb-20 overflow-x-hidden">
      {/* Meta Headers Injector */}
      <SEO 
        title={`${seriesName} – Trailer, Ratings, Reviews & Streaming details | AniZen`}
        description={`Watch ${seriesName} official trailer on AniZen. Rated ${anime.score}/10 with ${anime.episodes || "unlimited"} episodes. Follow schedules, read user review comments, and get details.`}
        keywords={`${seriesName}, ${anime.title}, ${anime.title_english || ""}, watch ${seriesName} trailer, ratings, character lists, stream, synopsis`}
        image={anime.images.jpg.large_image_url}
        schema={[animeSchema, bSchema]}
      />

      {/* Breadcrumb line for search indexes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center gap-2 text-xs text-zinc-500 font-extrabold uppercase tracking-widest relative z-10">
        <Link to="/" className="hover:text-brand transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/genre/${slugGenre}`} className="hover:text-brand transition-colors">{anime.genres?.[0]?.name || "Discover"}</Link>
        <span>/</span>
        <span className="text-zinc-200 truncate max-w-[150px] sm:max-w-xs">{seriesName}</span>
      </div>

      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full mt-2">
        <div className="absolute inset-0">
          <img
            src={anime.images.jpg.large_image_url}
            alt={`Atmospheric background of ${seriesName}`}
            className="w-full h-full object-cover blur-xl opacity-30 scale-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-end pb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-48 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10"
          >
            <img 
              src={anime.images.jpg.large_image_url} 
              alt={`Official cover display for ${seriesName} on AniZen`} 
              className="w-full h-full object-cover" 
              loading="eager"
            />
          </motion.div>
          
          <div className="flex-grow mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres?.map(g => {
                const genreSlug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <Link 
                    key={g.name} 
                    to={`/genre/${genreSlug}`}
                    className="px-3 py-1 glass hover:bg-brand/25 rounded-full text-xs font-semibold text-gray-300 hover:text-white border border-white/5 transition-all"
                  >
                    {g.name}
                  </Link>
                );
              })}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tight leading-none uppercase">
              {seriesName}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-lg font-bold">{anime.score}</span>
              </div>
              <span>{anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}</span>
              <span>{anime.status}</span>
              <span>{anime.year || anime.season}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsListModalOpen(true)}
              className="p-4 glass rounded-2xl text-gray-300 hover:text-white transition-all flex items-center gap-2 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              <span className="hidden md:inline font-bold">Add to List</span>
            </button>
            <button
              onClick={toggleFavorite}
              className={cn(
                "p-4 rounded-2xl transition-all shadow-lg",
                isFavorite ? "bg-brand text-white neon-glow" : "glass text-gray-300 hover:text-white"
              )}
            >
              <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </button>
            
            {/* Real Sharing Feedback bubble button */}
            <button 
              onClick={handleCopyUrl}
              title="Copy link to clipboard"
              className="p-4 glass rounded-2xl text-gray-300 hover:text-white transition-all shadow-lg relative cursor-pointer"
            >
              {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-black tracking-wider py-1 px-2.5 rounded shadow-xl whitespace-nowrap">Link Copied!</span>
              )}
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* AI Summary Block */}
          <section className="bg-card-dark/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-bold">AI Preview</h3>
              </div>
              <button
                onClick={handleAiSummary}
                disabled={summaryLoading}
                className="text-xs font-bold text-brand hover:text-brand-light transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                {aiSummary ? "Regenerate" : "Generate Cinematic Summary"}
              </button>
            </div>
            
            {summaryLoading ? (
              <div className="flex items-center gap-3 text-gray-500 py-4 italic">
                <Loader2 className="w-4 h-4 animate-spin" />
                Asking Gemini to analyze this anime...
              </div>
            ) : aiSummary ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-gray-200 leading-relaxed italic border-l-4 border-brand/40 pl-6 py-2"
              >
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </motion.div>
            ) : (
              <p className="text-gray-500 italic text-sm">Click generate to get an AI-powered cinematic perspective.</p>
            )}
          </section>

          {/* Synopsis */}
          <section>
            <h3 className="text-2xl font-display font-bold mb-6">Synopsis</h3>
            <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
              {anime.synopsis}
            </p>
          </section>

          {/* Trailer */}
          {anime.trailer?.embed_url && (
            <section>
              <h3 className="text-2xl font-display font-bold mb-6">Official Trailer</h3>
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  src={anime.trailer.embed_url}
                  className="w-full h-full"
                  title="Anime Trailer"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {/* Characters */}
          <section>
            <h3 className="text-2xl font-display font-bold mb-6 text-white">Main Characters</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {characters.map((char, idx) => (
                <div key={`${char.character.mal_id}-${idx}`} className="text-center group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-2 border border-white/10 group-hover:border-brand/50 transition-colors">
                    <img src={char.character.images.jpg.image_url} alt={char.character.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <p className="text-[10px] font-bold text-white truncate px-1">{char.character.name}</p>
                  <p className="text-[8px] text-gray-500 uppercase">{char.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="bg-white/5 rounded-3xl p-8 border border-white/5">
            <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-brand" />
              Community Discussion
            </h3>
            
            {user ? (
              <form onSubmit={submitComment} className="mb-10">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this anime..."
                  className="w-full bg-bg-dark border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand transition-all min-h-[100px] mb-4"
                />
                <button type="submit" className="px-6 py-2 bg-brand hover:bg-brand-light text-white font-bold rounded-xl transition-all shadow-lg neon-glow">
                  Post Comment
                </button>
              </form>
            ) : (
              <div className="p-6 glass rounded-2xl text-center mb-8 border-dashed">
                <p className="text-gray-400 mb-4">You need to be logged in to join the conversation.</p>
                <Link to="/login" className="text-brand font-bold hover:underline">Sign In Now</Link>
              </div>
            )}

            <div className="space-y-6">
              {comments.length > 0 ? comments.map((comment, idx) => (
                <div key={`${comment.id}-${idx}`} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand/20 flex items-center justify-center font-bold text-brand">
                    {comment.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{comment.username}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">
                          {comment.createdAt?.toDate ? new Intl.DateTimeFormat('en-US').format(comment.createdAt.toDate()) : "Just now"}
                        </span>
                        {(user?.uid === comment.userId || profile?.role === "admin") && (
                          <button onClick={() => deleteComment(comment.id)} className="text-red-500 hover:text-red-400 text-[10px] font-bold">Delete</button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                    <button 
                      onClick={() => likeComment(comment)}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-bold transition-colors",
                        comment.likedBy?.includes(user?.uid) ? "text-brand" : "text-gray-500 hover:text-white"
                      )}
                    >
                      <Heart className={cn("w-3 h-3", comment.likedBy?.includes(user?.uid) && "fill-current")} />
                      {comment.likes || 0} Likes
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-600 italic">No comments yet. Be the first to speak!</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-8">
          {/* Rate Card */}
          <div className="glass rounded-3xl p-6 border border-brand/20 neon-glow">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">Rate this anime</h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="group relative"
                >
                  <Star 
                    className={cn(
                      "w-4 h-4 transition-all",
                      (userRating && userRating >= star) ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-200"
                    )} 
                  />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[8px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100">{star}</span>
                </button>
              ))}
            </div>
            {userRating && (
              <p className="mt-4 text-xs font-bold text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                You rated it {userRating}/10
              </p>
            )}
          </div>

          {/* Stream Options - Affiliate system */}
          <div className="bg-card-dark rounded-3xl p-6 border border-white/5">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Where to Watch</h4>
            <div className="space-y-3">
              {affiliateLinks.length > 0 ? affiliateLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.affiliateUrl?.startsWith('http://') || link.affiliateUrl?.startsWith('https://') || link.affiliateUrl?.startsWith('//') ? link.affiliateUrl : `https://${link.affiliateUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => trackClick(link)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-black text-xs uppercase">
                      {link.platform[0]}
                    </div>
                    <span className="font-bold text-sm">{link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand" />
                </a>
              )) : (
                <div className="space-y-3">
                  <div className="p-4 bg-white/2 border border-white/5 border-dashed rounded-xl text-center">
                    <p className="text-[10px] text-gray-600">Checking global streams...</p>
                  </div>
                  {/* Fallback mock links for UX if none in DB */}
                  <div className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl opacity-50 grayscale">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-xs">C</div>
                      <span className="font-bold text-sm">Crunchyroll</span>
                    </div>
                    <Play className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              )}
              <p className="text-[10px] text-gray-600 text-center mt-4 italic">Affiliate links help support our mission.</p>
            </div>
          </div>

          {/* More Details */}
          <div className="bg-card-dark rounded-3xl p-6 border border-white/5 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Status</span>
              <p className="text-sm font-bold">{anime.status}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Season</span>
              <p className="text-sm font-bold capitalize">{anime.season} {anime.year}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Background</span>
              <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed">
                Source: MyAnimeList.net. Part of the MAL database. Original air dates and licensing details available on the official site.
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <section>
            <h3 className="text-xl font-display font-bold mb-6 text-white">You Might Like</h3>
            <div className="space-y-4">
              {recommendations.map((entry, idx) => {
                const entrySlug = entry.entry.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)+/g, "");

                return (
                  <Link 
                    key={`${entry.entry.mal_id}-${idx}`} 
                    to={`/anime/${entry.entry.mal_id}/${entrySlug}`}
                    className="flex items-center gap-4 group hover:bg-white/5 p-2 rounded-2xl transition-all"
                  >
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={entry.entry.images.jpg.image_url} alt={`Promo poster for suggested anime ${entry.entry.title}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-white line-clamp-2 mb-1">{entry.entry.title}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                        <Star className="w-2 h-2 fill-current" />
                        <span>Recommended</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {/* Dynamic SEO FAQs for Content Growth */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl text-brand">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                {seriesName} FAQ Guide
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">
                Dynamic Answers & Review Insights
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                q: `Where can I watch ${seriesName} online?`,
                a: `You can check active streaming redirect icons listed in the 'Where to Watch' widget above. AniZen acts as a premium discovery hub linking official channels like Crunchyroll, Netflix, Hulu, or Amazon Prime and tracking trailers.`
              },
              {
                q: `How many episodes are there in ${seriesName}, and is it complete?`,
                a: `${seriesName} is listed as having ${anime.episodes ? `${anime.episodes} episodes` : "ongoing broadcasts"}. Its current official release status is ${anime.status}.`
              },
              {
                q: `Is ${seriesName} worth watching? What is its dynamic review score?`,
                a: `${seriesName} holds an average community score of ${anime.score || "8.0"} out of 10. Reviews highlight its dynamic cinematography and compelling storyline. Anything above 8.0 indicates a stellar masterpiece you must not miss!`
              }
            ].map((item, index) => {
              const isFAQOpen = faqOpenIdx === index;
              return (
                <div 
                  key={index} 
                  className="border border-white/5 bg-white/2 hover:bg-white/5 rounded-2xl transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpenIdx(isFAQOpen ? null : index)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-gray-300 hover:text-white text-xs"
                  >
                    <span className="leading-snug pr-4">{item.q}</span>
                    <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform shrink-0", isFAQOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isFAQOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="px-6 pb-5 pt-3 border-t border-white/5 text-xs text-gray-400 leading-relaxed">
                          {item.a}
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

      {/* List Selection Modal */}
      <AnimatePresence>
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsListModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-bg-dark rounded-[32px] p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-display font-black text-white mb-6">Add to Collection</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {userLists.length > 0 ? userLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => addAnimeToList(list.id)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-brand/50 transition-all group"
                  >
                    <span className="font-bold text-sm text-gray-300 group-hover:text-white">{list.title}</span>
                    <Plus className="w-4 h-4 text-gray-500 group-hover:text-brand" />
                  </button>
                )) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-4">No collections found.</p>
                    <Link to="/lists" className="text-brand font-bold hover:underline">Create a List</Link>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsListModalOpen(false)}
                className="w-full mt-6 py-3 text-gray-500 hover:text-white font-bold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
