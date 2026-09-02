import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ArrowRight, Quote, Calendar, Briefcase, Users, GraduationCap, CreditCard, Eye } from 'lucide-react';
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
  const popupReviews = marqueeReviews.slice(0, 10);

  return (
    <section id="testimonials" className="relative section-glow overflow-hidden vintage-pinstripe">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/10 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="container-responsive relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          className="section-header"
        >
          <span className="section-badge glass-pill-solid text-crimson">
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
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex pb-8">
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

      {/* View 10 Reviews + Do Payment buttons — stacked vertically */}
      <div className="flex flex-col items-center justify-center gap-4 mt-10 mb-4 relative z-10 px-4">
        <button
          onClick={() => setShowAll(true)}
          className="px-8 py-4 bg-gradient-to-r from-crimson to-gold text-white text-sm sm:text-base font-bold rounded-full shadow-xl shadow-crimson/20 btn-glow shine transition-transform active:scale-[0.98] flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View 10 Reviews
        </button>
        <Link
          to="/payment"
          className="btn-payment-luxury px-8 py-4 rounded-full text-sm sm:text-base flex items-center gap-2.5"
        >
          <CreditCard className="w-4 h-4 drop-shadow-[0_0_6px_rgba(212,168,83,0.9)]" />
          <span>Do Payment / Pay Online</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 10 REVIEWS POPUP MODAL */}
      <AnimatePresence>
        {showAll && !selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md p-4 sm:p-10 flex items-center justify-center"
            onClick={e => { if (e.target === e.currentTarget) setShowAll(false); }}
          >
            <div className="w-full max-w-6xl h-full flex flex-col bg-[#100810] border border-gold/25 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(220,20,60,0.15),0_0_40px_rgba(212,168,83,0.10)]">
              {/* Header */}
              <div className="p-6 sm:p-8 border-b border-gold/10 flex items-center justify-between bg-black/50 flex-shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-white">Latest <span className="text-gradient">10 Reviews</span></h3>
                  <p className="text-white/30 text-sm mt-1">Click any card to see full details</p>
                </div>
                <button
                  onClick={() => setShowAll(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cards Grid */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popupReviews.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.8, ease: 'easeOut' }}
                      onClick={() => setSelectedReview(r)}
                      className="glass-card p-5 sm:p-6 rounded-[24px] sm:rounded-[30px] border border-white/10 hover:border-gold/50 hover:bg-white/[0.04] transition-all flex flex-col group cursor-pointer active:scale-[0.98] shadow-xl relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Quote className="w-7 h-7 text-crimson/40 group-hover:text-gold/70 transition-colors" />
                        <span className="text-[10px] text-white/40 flex items-center gap-1 glass px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3" /> {r.date ? new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Verified'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors line-clamp-1">{r.project_name}</h4>
                      <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-4 flex-1 italic line-clamp-3">"{r.experience}"</p>

                      <div className="flex gap-0.5 mb-3">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass text-crimson/80 text-[10px] sm:text-xs font-medium">
                          <Briefcase className="w-3 h-3" /> {r.project_type}
                        </span>
                        {r.team_members && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg glass text-gold/80 text-[10px] font-bold uppercase tracking-wider">
                            <Users className="w-3 h-3" /> Team ({1 + r.team_members.split(',').filter(m => m.trim()).length})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-3.5 border-t border-white/10">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-crimson to-gold flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-md">
                          {r.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white/90 truncate">{r.student_name}</p>
                          <p className="text-[10px] sm:text-xs text-white/40 flex items-center gap-1 truncate">
                            <GraduationCap className="w-3 h-3 flex-shrink-0" /> {r.year_of_study} · {r.college_name}
                          </p>
                        </div>
                        <span className="text-[11px] text-gold/80 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                          Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 sm:p-6 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                <p className="text-xs sm:text-sm text-white/50 text-center sm:text-left">
                  Showing <span className="text-gold font-bold">10 latest reviews</span> · {reviews.length} total reviews
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link
                    to="/reviews"
                    onClick={() => setShowAll(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-crimson to-gold text-white font-bold text-sm rounded-full transition-transform active:scale-[0.98] shadow-lg shadow-crimson/25 whitespace-nowrap"
                  >
                    View All {reviews.length} Reviews <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/payment"
                    onClick={() => setShowAll(false)}
                    className="btn-payment-luxury px-6 py-3 rounded-full text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4 drop-shadow-[0_0_6px_rgba(212,168,83,0.8)]" />
                    Do Payment
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* INDIVIDUAL REVIEW DETAIL MODAL — same luxury design as ReviewPage */}
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#120a16] border border-gold/40 rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Ambient glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crimson to-gold flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-crimson/25">
                    {selectedReview.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold text-white truncate">{selectedReview.student_name}</p>
                    <p className="text-xs text-white/50 truncate flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" /> {selectedReview.year_of_study} · {selectedReview.college_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[62vh] overflow-y-auto custom-scrollbar relative z-10">
                {/* Team Members */}
                {selectedReview.team_members && (
                  <div className="p-4 rounded-2xl bg-crimson/10 border border-crimson/25 shadow-inner">
                    <p className="text-[10px] text-crimson/80 uppercase font-bold tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Team Members
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-crimson/20 border border-crimson/30 rounded-full text-xs text-white font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-crimson inline-block animate-pulse" />
                        {selectedReview.student_name} <span className="text-gold text-[10px] font-bold uppercase">(Lead)</span>
                      </span>
                      {selectedReview.team_members.split(',').filter(m => m.trim()).map((m, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/80">
                          <span className="w-2 h-2 rounded-full bg-gold/70 inline-block" />
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Info */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-gold/70" /> Project Details
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gold">{selectedReview.project_name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/45 flex-wrap">
                    <span className="text-crimson/80 font-medium">{selectedReview.project_type}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {selectedReview.date ? new Date(selectedReview.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Verified Review'}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold" /> Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(j => (
                        <Star key={j} className={`w-5 h-5 ${j <= selectedReview.rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gold/90 font-bold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20">
                      {selectedReview.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-crimson" /> Experience
                  </p>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed italic border-l-2 border-gold/40 pl-4 py-1 bg-white/[0.01] rounded-r-xl">
                    "{selectedReview.experience}"
                  </p>
                </div>

                {/* Pricing */}
                {selectedReview.pricing_review && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Feedback on Pricing</p>
                    <p className="text-xs sm:text-sm text-emerald-300 italic">"{selectedReview.pricing_review}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row gap-3 relative z-10">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 py-3 px-4 glass rounded-xl text-white/70 hover:text-white text-xs sm:text-sm font-semibold transition-all text-center hover:bg-white/10"
                >
                  Close
                </button>
                <Link
                  to="/reviews"
                  onClick={() => { setSelectedReview(null); setShowAll(false); }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-crimson to-gold text-white text-xs sm:text-sm font-bold rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-crimson/25 flex items-center justify-center gap-2"
                >
                  <span>View All Reviews</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
