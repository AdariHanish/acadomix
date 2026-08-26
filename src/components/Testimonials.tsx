import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ArrowRight } from 'lucide-react';
import { Review } from '../types';
import useLockBodyScroll from '../hooks/useLockBodyScroll';
import { Link } from 'react-router-dom';
import { ReviewsDB } from '../utils/storage';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useLockBodyScroll(showAll || selectedReview !== null);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return new Date(dateStr).getTime();
    const parts = dateStr.split('/');
    if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    return new Date(dateStr).getTime();
  };

  useEffect(() => {
    ReviewsDB.getApproved()
      .then(data => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) => parseDate(b.date) - parseDate(a.date));
        setReviews(sorted);
      })
      .catch(err => console.error("Failed to load reviews for testimonials:", err));
  }, []);

  if (reviews.length === 0) return null;

  // Show reviews marked as visible_in_home; fallback to 10 newest if none are marked
  const homeVisibleReviews = reviews.filter(r => r.visible_in_home);
  const marqueeReviews = homeVisibleReviews.length > 0 ? homeVisibleReviews : reviews.slice(0, 10);

  return (
    <section id="testimonials" className="bg-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/10 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="container-responsive relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="section-header"
        >
          <span className="section-badge glass border border-white/10 text-crimson">
            <Star className="w-4 h-4 fill-crimson" /> Testimonials
          </span>
          <h2 className="text-section text-white">
            What Students <span className="text-gradient">Say</span>
          </h2>
          <p className="section-sub">
            Real feedback from our happy students across various engineering colleges.
          </p>
          <p className="text-white/30 text-sm font-medium tracking-widest mt-4 flex items-center justify-center gap-1.5 flex-wrap">
            ✦ Scrolling through {homeVisibleReviews.length > 0 ? <span className="text-gold/70 font-semibold">featured reviews</span> : <span className="text-gold/70 font-semibold">the 10 newest reviews</span>} ✦
          </p>
        </motion.div>
      </div>{/* end container-responsive for header */}

      {/* Marquee Container (Edge-to-Edge) */}
      <div className="relative w-full overflow-hidden flex pb-8">
        {/* Edge Gradients for Smooth Fade In/Out */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee gap-6 px-3 hover:[animation-play-state:paused]">
          {marqueeReviews.map((r, i) => (
            <div key={i} onClick={() => setSelectedReview(r)} className="w-[300px] sm:w-[400px] flex-shrink-0 glass-card p-6 sm:p-8 rounded-[30px] border border-white/5 hover:border-crimson/30 transition-all flex flex-col group cursor-pointer active:scale-95">
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
      <div className="text-center mt-10 mb-4 relative z-10">
        <button 
          onClick={() => setShowAll(true)}
          className="px-8 py-4 bg-gradient-to-r from-crimson to-gold text-white text-sm sm:text-base font-bold rounded-full shadow-xl shadow-crimson/20 btn-glow shine transition-transform active:scale-[0.98]"
        >
          View All {reviews.length} Reviews
        </button>
      </div>

      {/* ALL REVIEWS MODAL */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md p-4 sm:p-10 flex items-center justify-center"
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
              {/* View All Customer Reviews Button */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-center">
                <Link
                  to="/reviews"
                  onClick={() => setShowAll(false)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-crimson to-gold text-white font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-crimson/20"
                >
                  View All Customer Reviews <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* INDIVIDUAL REVIEW MODAL */}
        {selectedReview && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md p-4 sm:p-10 flex items-center justify-center"
            onClick={() => setSelectedReview(null)}
          >
            <div 
              className="w-full max-w-2xl bg-surface-1 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crimson to-gold flex flex-shrink-0 items-center justify-center text-white font-bold text-lg shadow-lg">
                      {selectedReview.student_name.split(' ').map(n => n[0]).join('').slice(0,2)}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white">{selectedReview.student_name}</h3>
                     <p className="text-white/40 text-sm mt-0.5">{selectedReview.college_name}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                 <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Project</p>
                    <p className="text-lg font-bold text-gold">{selectedReview.project_name} <span className="text-sm font-normal text-white/40">({selectedReview.project_type})</span></p>
                    {selectedReview.team_members && (
                      <p className="text-xs text-crimson/80 uppercase font-bold tracking-widest mt-1">Team: {selectedReview.team_members}</p>
                    )}
                 </div>

                 <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Rating</p>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-6 h-6 ${j < selectedReview.rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                      ))}
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Experience</p>
                    <p className="text-base text-white/80 leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
                      "{selectedReview.experience}"
                    </p>
                 </div>

                 {selectedReview.pricing_review && (
                   <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">On Pricing</p>
                      <p className="text-sm text-green-400/80 italic">"{selectedReview.pricing_review}"</p>
                   </div>
                 )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => { setSelectedReview(null); setShowAll(true); }}
                  className="w-full py-4 bg-gradient-to-r from-crimson to-gold text-white font-bold rounded-2xl transition-transform active:scale-[0.98] shadow-lg shadow-crimson/20"
                >
                  View All Reviews
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
