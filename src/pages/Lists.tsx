import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  LayoutGrid, 
  List as ListIcon, 
  MoreVertical,
  Edit,
  Share2
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Lists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchLists() {
      try {
        const q = query(collection(db, "lists"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setLists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLists();
  }, [user]);

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;
    
    try {
      const docRef = await addDoc(collection(db, "lists"), {
        userId: user.uid,
        title: newListName,
        description: newListDesc,
        anime: [],
        createdAt: serverTimestamp()
      });
      
      setLists(prev => [{
        id: docRef.id,
        title: newListName,
        description: newListDesc,
        anime: [],
        createdAt: new Date().toISOString()
      }, ...prev]);
      
      setNewListName("");
      setNewListDesc("");
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "lists", id));
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return null;

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-display font-black text-white mb-2 tracking-tight">Your Collections</h1>
          <p className="text-gray-500">Curate and share your favorite anime experiences.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-3 bg-brand text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-brand-light transition-all shadow-xl neon-glow"
        >
          <Plus className="w-5 h-5" />
          Create New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-700">
            <ListIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No collections yet</h3>
          <p className="text-gray-600 mb-8 max-w-xs mx-auto">Start building your first custom anime collection to share with the community.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-brand font-bold hover:underline underline-offset-4"
          >
            Create your first list
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map((list, idx) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-card-dark rounded-3xl border border-white/5 p-8 hover:border-brand/40 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteList(list.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                 <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-brand transition-colors">{list.title}</h2>
                 <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{list.description || "No description provided."}</p>
              </div>

              <div className="flex items-center gap-2 mb-8">
                {list.anime && list.anime.length > 0 ? (
                   <div className="flex -space-x-4">
                     {list.anime.slice(0, 4).map((a: any, i: number) => (
                       <img key={i} src={a.image} className="w-10 h-10 rounded-full border-2 border-card-dark object-cover" alt="" />
                     ))}
                     {list.anime.length > 4 && (
                       <div className="w-10 h-10 rounded-full border-2 border-card-dark bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                         +{list.anime.length - 4}
                       </div>
                     )}
                   </div>
                ) : (
                   <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Empty Collection</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-[10px] text-gray-600 font-medium">Created {new Date(list.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-4">
                   <button className="text-gray-500 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                   <button className="text-gray-500 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-bg-dark rounded-[32px] p-10 border border-white/10 shadow-2xl"
            >
              <h2 className="text-3xl font-display font-black text-white mb-8">New Collection</h2>
              <form onSubmit={createList} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">Collection Name</label>
                  <input 
                    autoFocus
                    required
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g. Best Romance Anime"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-widest">Description (Optional)</label>
                  <textarea 
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="Describe your collection..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand transition-all min-h-[120px]"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-brand text-white font-bold rounded-2xl hover:bg-brand-light transition-all neon-glow shadow-lg"
                  >
                    Create List
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
