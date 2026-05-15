import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { ReviewsDB } from '../utils/storage';
import { Review } from '../types';
import AppleLoader from './AppleLoader';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    ReviewsDB.getApproved().then(data => {
      setReviews(data.slice(0, 6));
      setLoading(false);
    }); 
  }, []);

  return (
    <section id="testimonials" className="relative py-20 sm:py-28 lg:py-32 bg-surface-1 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-crimson font-semibold mb-4 uppercase tracking-wider">Testimonials</span>
          <h2 className="text-section text-white mb-4">
            Loved by students.
            <br /><span className="text-gradient">Across the country.</span>
          </h2>
        </motion.div>

        {loading ? (
          <AppleLoader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col group active:bg-white/5 transition-colors">
                <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-gold/20 mb-2 sm:mb-3 group-hover:text-gold/40 transition-colors" />
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-3 sm:mb-4 flex-1 italic line-clamp-4">"{r.experience}"</p>
                {r.pricing_review && <p className="text-[10px] sm:text-xs text-gold/40 mb-3">💰 {r.pricing_review}</p>}
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${s <= r.rating ? 'text-gold fill-gold' : 'text-white/10'}`} />)}
                </div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-crimson to-gold flex items-center justify-center text-white text-[9px] sm:text-xs font-bold">
                    {r.student_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white/80">{r.student_name}</p>
                    <p className="text-[9px] sm:text-xs text-white/25">{r.year_of_study} · {r.college_name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.15 }} className="text-center mt-8 sm:mt-10">
          <Link to="/reviews" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 glass text-gold/70 hover:text-gold font-semibold rounded-full transition-all hover:bg-white/5 text-xs sm:text-sm active:scale-95">
            View All Reviews <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
