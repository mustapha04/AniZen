import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import AnimeCard from "../components/AnimeCard";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchFavorites() {
      try {
        const q = query(collection(db, "favorites"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setFavorites(snapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-dark">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-brand/10 rounded-2xl">
          <Heart className="w-8 h-8 text-brand fill-current" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tight">Your Collection</h1>
          <p className="text-gray-500">All your bookmarked anime in one place.</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map((fav, idx) => (
            <motion.div
              key={`${fav.animeId}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Mapping favorite data to a shape AnimeCard expects */}
              <AnimeCard anime={{
                mal_id: fav.animeId,
                title: fav.title,
                title_english: fav.title,
                images: {
                  jpg: {
                    image_url: fav.image,
                    large_image_url: fav.image
                  }
                },
                score: 0,
                synopsis: "",
                episodes: 0,
                status: "",
                genres: [],
                year: 0,
                season: "",
                trailer: { youtube_id: "", url: "", embed_url: "" }
              }} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-card-dark rounded-3xl border border-white/5 border-dashed">
          <Heart className="w-16 h-16 text-gray-800 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-8">Start exploring and save the shows you love.</p>
          <Link to="/search" className="px-8 py-3 bg-brand hover:bg-brand-light text-white font-bold rounded-xl transition-all shadow-xl neon-glow">
            Find Anime
          </Link>
        </div>
      )}
    </div>
  );
}
