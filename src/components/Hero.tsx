import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Award, Clock, Sparkles, CreditCard } from 'lucide-react';
import { ReviewsDB, getCachedData } from '../utils/storage';

function computeStats(data: any[]) {
  if (!Array.isArray(data)) return { projects: 0, students: 0, teamStats: { teams: 0, members: 0, individuals: 0 } };
  let tTeams = 0, tMembers = 0, tIndiv = 0;
  const count = data.reduce((total, r) => {
    if (r.team_members) {
      tTeams++;
      const mCount = r.team_members.split(',').filter((m: string) => m.trim()).length;
      tMembers += (mCount + 1);
      return total + 1 + mCount;
    } else {
      tIndiv++;
      return total + 1;
    }
  }, 0);
  return {
    projects: data.length,
    students: count,
    teamStats: { teams: tTeams, members: tMembers, individuals: tIndiv }
  };
}

export default function Hero() {
  const initialCached = getCachedData<any[]>('/reviews');
  const initialStats = computeStats(initialCached || []);

  const [totalStudents, setTotalStudents] = useState(initialStats.students);
  const [totalProjects, setTotalProjects] = useState(initialStats.projects);
  const [teamStats, setTeamStats] = useState(initialStats.teamStats);

  useEffect(() => {
    ReviewsDB.getApproved()
      .then(data => {
        if (!Array.isArray(data)) return;
        const stats = computeStats(data);
        setTotalProjects(stats.projects);
        setTotalStudents(stats.students);
        setTeamStats(stats.teamStats);
      })
      .catch(err => console.error("Failed to load hero stats:", err));
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const heroBgSrc = '/api/assets?asset_name=hero_bg&raw=true';
  const [heroBgLoaded, setHeroBgLoaded] = useState(false);
  const [heroBgFailed, setHeroBgFailed] = useState(false);
  const [heroLogo, setHeroLogo] = useState<string | null>(() => {
    try { return localStorage.getItem('acadomix_cached_logo') || null; } catch { return null; }
  });

  useEffect(() => {
    if (!heroLogo) {
      import('../utils/storage').then(({ AssetsDB }) => {
        AssetsDB.get('logo').then(asset => {
          if (asset?.data) setHeroLogo(asset.data);
        }).catch(() => { });
      });
    }
  }, [heroLogo]);

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden vintage-classic-canvas">
      {/* Vintage Classic Background Art */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Vintage ornate damask wallpaper pattern layer — visible & high luxury */}
        <div className="absolute inset-0 vintage-damask-pattern pointer-events-none opacity-60" />

        {/* Subtle vintage grain texture */}
        <div className="absolute inset-0 vintage-grain pointer-events-none opacity-40" />

        {/* Vintage antique illumination: warm golden zenith & deep wine ambient tones */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 50% at 50% 0%, rgba(212, 168, 83, 0.22) 0%, transparent 65%),
              radial-gradient(ellipse 80% 55% at 85% 85%, rgba(180, 20, 50, 0.16) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 15% 85%, rgba(139, 0, 0, 0.18) 0%, transparent 55%),
              transparent
            `
          }}
        />

        {/* Database uploaded background image (if uploaded by admin) */}
        {!heroBgFailed && (
          <img
            src={heroBgSrc}
            alt=""
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-700 ${heroBgLoaded ? 'opacity-25' : 'opacity-0'}`}
            onLoad={() => setHeroBgLoaded(true)}
            onError={() => setHeroBgFailed(true)}
          />
        )}

        {/* Vignette & Soft Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

        {/* Soft, slow floating ambient orbs in distant corners */}
        <div className="absolute top-1/6 left-1/10 w-72 sm:w-[460px] h-72 sm:h-[460px] bg-crimson/12 rounded-full blur-[100px] pointer-events-none"
          style={{ animation: 'orbFloat1 14s ease-in-out infinite', willChange: 'transform' }} />
        <div className="absolute bottom-1/6 right-1/10 w-72 sm:w-[460px] h-72 sm:h-[460px] bg-gold/14 rounded-full blur-[100px] pointer-events-none"
          style={{ animation: 'orbFloat2 16s ease-in-out infinite 1s', willChange: 'transform' }} />
      </div>

      <div className="relative z-10 container-responsive text-center pt-20 sm:pt-24">
        {/* Solid Glassmorphic Badge Pill — No see-through, 100% visible text */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-pill-solid mb-6 sm:mb-8 cursor-default"
        >
          <Sparkles className="w-4 h-4 text-gold shrink-0 drop-shadow-[0_0_8px_rgba(212,168,83,0.9)]" />
          <span className="text-xs sm:text-sm text-gold font-bold tracking-wide select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            #1 Project Partner for Students
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease: "easeOut" }}
          className="text-hero text-white mb-4 sm:mb-6">
          Your Academic Vision.
          <br />
          <span className="text-gradient">Engineered to Perfection.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-body text-white/40 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
          Mini projects, major projects, research papers, websites — delivered
          with <span className="text-crimson font-semibold">zero plagiarism</span> at
          <span className="text-gold font-semibold"> student-friendly prices</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-3 sm:gap-3.5 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button onClick={() => scrollTo('contact')}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white text-sm sm:text-lg font-semibold rounded-full btn-glow shine flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Start Your Project <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a href={`https://wa.me/918897492636?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`} target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-green-500 hover:bg-green-600 text-white text-sm sm:text-lg font-semibold rounded-full transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.97]">
              💬 WhatsApp Us
            </a>
          </div>

          {/* Do Payment Button */}
          <Link to="/payment"
            className="btn-payment-luxury w-full sm:w-auto px-7 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 group"
          >
            <CreditCard className="w-4 h-4 text-gold-light group-hover:text-white transition-colors drop-shadow-[0_0_6px_rgba(212,168,83,0.8)]" />
            <span>Do Payment / Pay Online</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold/70 group-hover:translate-x-1 group-hover:text-gold transition-all" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-14 sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
            {[
              { icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />, value: `${totalProjects}`, label: 'Projects Delivered', color: 'text-crimson', link: '/reviews' },
              { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, value: `${totalStudents}`, label: 'Happy Students', color: 'text-gold', link: '/reviews' },
              { icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />, value: '98%', label: 'Success Rate', color: 'text-crimson' },
              { icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />, value: '24/7', label: 'Support', color: 'text-gold' },
            ].map((stat, i) => {
              const CardContent = (
                <>
                  <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-[9px] sm:text-xs text-white/30 uppercase tracking-wider">{stat.label}</div>
                </>
              );

              if (stat.link) {
                return (
                  <Link key={i} to={stat.link} className="glass-card rounded-2xl p-3 sm:p-5 text-center active:bg-white/5 transition-colors hover:scale-105 cursor-pointer block">
                    {CardContent}
                  </Link>
                );
              }

              return (
                <div key={i} className="glass-card rounded-2xl p-3 sm:p-5 text-center active:bg-white/5 transition-colors">
                  {CardContent}
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 max-w-4xl mx-auto px-4">
            <Link to="/reviews" className="glass-card rounded-2xl p-4 sm:p-5 text-center hover:scale-[1.02] transition-transform cursor-pointer block">
              <p className="text-[10px] sm:text-xs text-gold/80 font-bold uppercase tracking-[0.15em] mb-4 flex items-center justify-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" /> Acadomix Customers
              </p>
              <div className="flex flex-wrap justify-around items-center gap-4">
                <div className="flex-1 min-w-[100px]">
                  <p className="text-xl sm:text-2xl font-bold text-gradient">{teamStats.teams}</p>
                  <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider mt-1">Teams</p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex-1 min-w-[100px]">
                  <p className="text-xl sm:text-2xl font-bold text-gradient">{teamStats.members}</p>
                  <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider mt-1">Team Members</p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex-1 min-w-[100px]">
                  <p className="text-xl sm:text-2xl font-bold text-gradient">{teamStats.individuals}</p>
                  <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider mt-1">Individuals</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-gold/30 flex justify-center pt-2">
          <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="w-1 h-2.5 sm:w-1.5 sm:h-3 bg-gradient-to-b from-crimson to-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
