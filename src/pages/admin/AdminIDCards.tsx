import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Image as ImageIcon, Calendar } from 'lucide-react';
import { AssetsDB } from '../../utils/storage';
import { AppAsset } from '../../types';

export default function AdminIDCards() {
  const [idCards, setIdCards] = useState<AppAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIDCards();
  }, []);

  const fetchIDCards = async () => {
    try {
      const allAssets = await AssetsDB.getAll();
      const studentIds = allAssets.filter(asset => asset.asset_name.startsWith('studentid_'));
      // Sort newest first
      studentIds.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setIdCards(studentIds);
    } catch (err) {
      console.error('Failed to fetch ID cards', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assetName: string) => {
    if (!window.confirm('Are you sure you want to delete this ID card? This cannot be undone and will free up database space.')) return;
    try {
      await AssetsDB.delete(assetName);
      setIdCards(prev => prev.filter(card => card.asset_name !== assetName));
    } catch (err) {
      alert('Failed to delete ID card');
    }
  };

  const parseCardData = (assetName: string) => {
    const parts = assetName.split('_');
    if (parts.length >= 3) {
      // studentid_{name}_{timestamp}
      const timestamp = parseInt(parts.pop() || '0');
      const name = parts.slice(1).join('_');
      return { name, date: new Date(timestamp) };
    }
    // Fallback for older cards without name
    return { name: 'Unknown Student', date: new Date() };
  };

  const openLightbox = (src: string, alt: string) => {
    window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src, alt } }));
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student ID Cards</h1>
          <p className="text-white/40">Manage and verify uploaded student ID cards for discounts.</p>
        </div>
        <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl border border-gold/20 font-bold">
          Total Cards: {idCards.length}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : idCards.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/5">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No ID Cards</h3>
          <p className="text-white/40">Student uploads will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {idCards.map((card) => {
              const { name, date } = parseCardData(card.asset_name);
              
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col group"
                >
                  {/* Image Viewer */}
                  <div 
                    className="relative aspect-video bg-black/50 cursor-pointer overflow-hidden border-b border-white/10"
                    onClick={() => openLightbox(card.data, `${name}'s ID Card`)}
                  >
                    <img 
                      src={card.data} 
                      alt="ID Card" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                        Click to Expand
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
                      <Calendar className="w-3.5 h-3.5" />
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <a
                        href={card.data}
                        download={`IDCard_${name.replace(/\s+/g, '_')}.png`}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                      <button
                        onClick={() => handleDelete(card.asset_name)}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-crimson/10 hover:bg-crimson/20 text-crimson text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
