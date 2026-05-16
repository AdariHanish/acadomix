import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, X, GraduationCap } from 'lucide-react';
import { Review } from '../types';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.filter((r: Review) => r.is_approved));
      });
  }, []);

  const next = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(reviews.length - 1);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-responsive relative z-10">
        <div className="text-center mb-16">
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

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
          {/* Navigation Arrows */}
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Testimonial Card */}
          <div className="min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="glass-card p-8 sm:p-12 rounded-[40px] border border-white/5 relative">
                  <Quote className="absolute top-8 left-8 w-12 h-12 text-white/5 -scale-x-100" />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < reviews[currentIndex].rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                      ))}
                    </div>
                    
                    <p className="text-lg sm:text-2xl text-white/80 leading-relaxed mb-8 italic">
                      "{reviews[currentIndex].experience}"
                    </p>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crimson to-gold flex items-center justify-center text-white font-bold text-xl mb-4 border-2 border-black">
                        {reviews[currentIndex].student_name[0]}
                      </div>
                      <h4 className="text-white font-bold text-lg">{reviews[currentIndex].student_name}</h4>
                      {reviews[currentIndex].team_members && (
                        <p className="text-[10px] text-crimson/60 uppercase font-bold tracking-widest mt-1 mb-2">Team: {reviews[currentIndex].team_members}</p>
                      )}
                      <p className="text-white/30 text-sm flex items-center gap-2 mt-1">
                        <GraduationCap className="w-4 h-4" /> {reviews[currentIndex].college_name} · {reviews[currentIndex].year_of_study}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button 
            onClick={() => setShowAll(true)}
            className="px-8 py-4 bg-gradient-to-r from-crimson to-gold text-white font-bold rounded-2xl shadow-xl shadow-crimson/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
          >
            View All {reviews.length} Reviews <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-black/50">
                <div>
                  <h3 className="text-2xl font-bold text-white">Customer Reviews</h3>
                  <p className="text-white/30 text-sm mt-1">Showing all {reviews.length} verified testimonials</p>
                </div>
                <button 
                  onClick={() => setShowAll(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content - Grid of Reviews */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reviews.map((r, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-crimson/30 transition-all group">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-gold text-gold' : 'text-white/10'}`} />
                        ))}
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{r.experience}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white text-xs font-bold group-hover:bg-crimson group-hover:text-white transition-colors">
                          {r.student_name[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{r.student_name}</p>
                          <p className="text-white/20 text-[11px]">{r.college_name}</p>
                        </div>
                      </div>
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
