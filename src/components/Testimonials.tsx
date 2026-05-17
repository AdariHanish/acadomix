import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Review } from '../types';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.filter((r: Review) => r.is_approved));
      });
  }, []);

  if (reviews.length === 0) return null;

  // Duplicate for smooth infinite scroll if there aren't many
  const marqueeReviews = [...reviews, ...reviews, ...reviews, ...reviews].slice(0, 20);

  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-responsive relative z-10 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-crimson text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Star className="w-3.5 h-3.5 fill-crimson" /> Testimonials
        </motion.div>
        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
          What Students <span className="text-gradient">Say</span>
        </h2>
        <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto">
          Real feedback from our happy students across various engineering colleges.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex pb-8">
        <div className="flex w-max animate-marquee gap-6 px-3 hover:[animation-play-state:paused]">
          {marqueeReviews.map((r, i) => (
            <div key={i} className="w-[300px] sm:w-[400px] flex-shrink-0 glass-card p-6 sm:p-8 rounded-[30px] border border-white/5 hover:border-crimson/30 transition-all flex flex-col group">
              <h4 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors line-clamp-1">{r.project_name}</h4>
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                ))}
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-white/80">{r.student_name} <span className="text-white/30 font-normal">from</span> {r.college_name}</p>
                {r.team_members && (
                  <p className="text-[10px] text-crimson/60 uppercase font-bold tracking-widest mt-0.5">Team: {r.team_members}</p>
                )}
                <p className="text-xs text-white/40 mt-1">{r.year_of_study} · <span className="text-gold/70">{r.project_type}</span></p>
              </div>

              <p className="text-sm text-white/50 leading-relaxed italic line-clamp-4">"{r.experience}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center mt-12 relative z-10">
        <button 
          onClick={() => setShowAll(true)}
          className="px-8 py-4 bg-gradient-to-r from-crimson to-gold text-white text-sm sm:text-base font-bold rounded-full shadow-xl shadow-crimson/20 btn-glow shine transition-transform active:scale-[0.98]"
        >
          View All Reviews
        </button>
      </div>

      {/* ALL REVIEWS MODAL */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-4 sm:p-10 flex items-center justify-center"
          >
            <div className="w-full max-w-6xl h-full flex flex-col bg-surface-1 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-black/50">
                <div>
                  <h3 className="text-2xl font-bold text-white">Customer Reviews</h3>
                  <p className="text-white/30 text-sm mt-1">Showing all verified testimonials</p>
                </div>
                <button 
                  onClick={() => setShowAll(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((r, i) => (
                    <div key={i} className="glass-card p-6 rounded-[30px] border border-white/5 hover:border-crimson/30 transition-all flex flex-col group">
                      <h4 className="text-lg font-bold text-white mb-3 group-hover:text-gold transition-colors">{r.project_name}</h4>
                      
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-4 h-4 ${j < r.rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                        ))}
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-white/80">{r.student_name} <span className="text-white/30 font-normal">from</span> {r.college_name}</p>
                        {r.team_members && (
                          <p className="text-[10px] text-crimson/60 uppercase font-bold tracking-widest mt-0.5">Team: {r.team_members}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1">{r.year_of_study} · <span className="text-gold/70">{r.project_type}</span></p>
                      </div>

                      <p className="text-sm text-white/50 leading-relaxed italic">"{r.experience}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
