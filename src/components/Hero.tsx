import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Award, Clock, Sparkles } from 'lucide-react';
import { ReviewsDB } from '../utils/storage';
import LazyImage from './LazyImage';

export default function Hero() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  
  useEffect(() => {
    ReviewsDB.getApproved().then(data => {
      // Projects: each review = 1 project (team project still counts as 1)
      setTotalProjects(data.length);
      // Students: 1 (lead/solo) + count of team members per review
      const count = data.reduce((total, r) => {
        const teamCount = r.team_members
          ? r.team_members.split(',').filter((m: string) => m.trim()).length
          : 0;
        return total + 1 + teamCount;
      }, 0);
      setTotalStudents(count);
    });
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <LazyImage 
          src="/api/assets?asset_name=hero_bg" 
          alt="" 
          spinnerSize="lg"
          fetchPriority="high"
          loading="eager"
          className="w-full h-full object-cover opacity-30" 
          onError={(e) => (e.currentTarget.src = '/images/hero-bg.jpg')}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      {/* Orbs — CSS animated for GPU performance */}
      <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-crimson/10 rounded-full blur-[100px] pointer-events-none"
        style={{ animation: 'orbFloat1 10s ease-in-out infinite', willChange: 'transform' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none"
        style={{ animation: 'orbFloat2 12s ease-in-out infinite 1s', willChange: 'transform' }} />

      <div className="relative z-10 container-responsive text-center pt-20 sm:pt-24">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 sm:mb-8">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-[10px] sm:text-sm text-gold/80 font-medium">#1 Project Partner for Students</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-hero text-white mb-4 sm:mb-6">
          Your Academic Vision.
          <br />
          <span className="text-gradient">Engineered to Perfection.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-body text-white/40 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
          Mini projects, major projects, research papers, websites — delivered
          with <span className="text-crimson font-semibold">zero plagiarism</span> at
          <span className="text-gold font-semibold"> student-friendly prices</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <button onClick={() => scrollTo('contact')}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white text-sm sm:text-lg font-semibold rounded-full btn-glow shine flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Start Your Project <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <a href={`https://wa.me/918897492936?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`} target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 glass text-white/80 hover:text-white text-sm sm:text-lg font-semibold rounded-full transition-all duration-300 hover:bg-white/10 active:scale-[0.97] flex items-center justify-center gap-2">
            💬 WhatsApp Us
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
            {[
              { icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />, value: `${totalProjects}+`, label: 'Projects Delivered', color: 'text-crimson' },
              { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, value: `${totalStudents}+`, label: 'Happy Students', color: 'text-gold' },
              { icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />, value: '98%', label: 'Success Rate', color: 'text-crimson' },
              { icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />, value: '24/7', label: 'Support', color: 'text-gold' },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-3 sm:p-5 text-center active:bg-white/5 transition-colors">
                <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-[9px] sm:text-xs text-white/30 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-gold/30 flex justify-center pt-2">
          <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2.5 sm:w-1.5 sm:h-3 bg-gradient-to-b from-crimson to-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
