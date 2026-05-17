import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers } from 'lucide-react';

const tech = [
  // Frontend
  { name: 'React', color: '#61DAFB', category: 'Frontend', slug: 'react' },
  { name: 'Next.js', color: '#FFFFFF', category: 'Frontend', slug: 'nextdotjs' },
  { name: 'Vue.js', color: '#41B883', category: 'Frontend', slug: 'vuedotjs' },
  { name: 'TypeScript', color: '#3178C6', category: 'Frontend', slug: 'typescript' },
  { name: 'Tailwind CSS', color: '#06B6D4', category: 'Frontend', slug: 'tailwindcss' },
  { name: 'Flutter', color: '#02569B', category: 'Frontend', slug: 'flutter' },
  // Backend
  { name: 'Node.js', color: '#339933', category: 'Backend', slug: 'nodedotjs' },
  { name: 'Python', color: '#3776AB', category: 'Backend', slug: 'python' },
  { name: 'Django', color: '#092E20', category: 'Backend', slug: 'django' },
  { name: 'Java', color: '#ED8B00', category: 'Backend', slug: 'oracle' },
  { name: 'Spring Boot', color: '#6DB33F', category: 'Backend', slug: 'springboot' },
  { name: 'FastAPI', color: '#009688', category: 'Backend', slug: 'fastapi' },
  // AI / ML
  { name: 'TensorFlow', color: '#FF6F00', category: 'AI / ML', slug: 'tensorflow' },
  { name: 'PyTorch', color: '#EE4C2C', category: 'AI / ML', slug: 'pytorch' },
  { name: 'OpenCV', color: '#5C3EE8', category: 'AI / ML', slug: 'opencv' },
  { name: 'Scikit-learn', color: '#F89939', category: 'AI / ML', slug: 'scikitlearn' },
  { name: 'Pandas', color: '#150458', category: 'AI / ML', slug: 'pandas' },
  { name: 'NLTK', color: '#3ECF8E', category: 'AI / ML', slug: 'python' },
  // Database
  { name: 'MySQL', color: '#4479A1', category: 'Database', slug: 'mysql' },
  { name: 'MongoDB', color: '#47A248', category: 'Database', slug: 'mongodb' },
  { name: 'Firebase', color: '#FFCA28', category: 'Database', slug: 'firebase' },
  { name: 'PostgreSQL', color: '#336791', category: 'Database', slug: 'postgresql' },
  { name: 'Redis', color: '#DC382D', category: 'Database', slug: 'redis' },
  { name: 'SQLite', color: '#003B57', category: 'Database', slug: 'sqlite' },
  // Cloud / DevOps
  { name: 'AWS', color: '#FF9900', category: 'Cloud / DevOps', slug: 'amazonwebservices' },
  { name: 'Docker', color: '#2496ED', category: 'Cloud / DevOps', slug: 'docker' },
  { name: 'GitHub Actions', color: '#2088FF', category: 'Cloud / DevOps', slug: 'githubactions' },
  { name: 'Vercel', color: '#FFFFFF', category: 'Cloud / DevOps', slug: 'vercel' },
  // IoT / Hardware
  { name: 'Arduino', color: '#00979D', category: 'IoT / Hardware', slug: 'arduino' },
  { name: 'Raspberry Pi', color: '#A22846', category: 'IoT / Hardware', slug: 'raspberrypi' },
  { name: 'ESP32', color: '#E7352C', category: 'IoT / Hardware', slug: 'espressif' },
  { name: 'MQTT', color: '#660066', category: 'IoT / Hardware', slug: 'hivemq' },
  // Tools
  { name: 'WordPress', color: '#21759B', category: 'Tools', slug: 'wordpress' },
  { name: 'Figma', color: '#F24E1E', category: 'Tools', slug: 'figma' },
  { name: 'Postman', color: '#FF6C37', category: 'Tools', slug: 'postman' },
];

const marqueeItems = tech.slice(0, 16);
const categories = [...new Set(tech.map(t => t.category))];

export default function TechStack() {
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? tech : tech.filter(t => t.category === activeCategory);

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      <div className="gold-divider mb-10" />
      
      {/* Title Centered at Top */}
      <div className="container-responsive mb-10 text-center">
        <p className="text-[10px] sm:text-xs text-gold/40 uppercase tracking-[0.25em] font-black">Technologies We Master</p>
      </div>

      {/* Scrolling Marquee Animation */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="flex gap-2 sm:gap-3"
        >
          {[...marqueeItems, ...marqueeItems].map((t, i) => (
            <div key={i} className="flex-shrink-0 glass-card rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 border border-white/[0.04]">
              {/* Dynamic Crisp Brand Mask Icon in exact brand color */}
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                style={{
                  backgroundColor: t.color,
                  WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@11.12.0/icons/${t.slug}.svg)`,
                  maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@11.12.0/icons/${t.slug}.svg)`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
              <span className="text-[10px] sm:text-xs text-white/35 font-medium whitespace-nowrap">{t.name}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Button below scrolling animation, centered */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => setShowAll(true)}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-gold/25 bg-gold/5 text-gold/70 hover:bg-gold/10 hover:border-gold/50 hover:text-gold text-xs sm:text-sm font-semibold transition-all active:scale-95 group shadow-lg shadow-crimson/5"
        >
          <Layers className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          View All Technologies
        </button>
      </div>

      <div className="gold-divider mt-12" />

      {/* VIEW ALL POPUP */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAll(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[36px] overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(30,5,5,0.96) 0%, rgba(18,8,2,0.98) 50%, rgba(25,8,3,0.96) 100%)',
                border: '1px solid rgba(212,168,83,0.25)',
                boxShadow: '0 0 80px rgba(220,20,60,0.12), 0 0 40px rgba(212,168,83,0.08), inset 0 1px 0 rgba(212,168,83,0.3)',
              }}
            >
              {/* Shimmer top border */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.7) 20%, rgba(212,168,83,1) 50%, rgba(220,20,60,0.7) 80%, transparent)' }}
              />
              {/* BG orbs */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-crimson/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold/6 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gold/10 relative z-10">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Technologies <span className="text-gradient">We Master</span>
                  </h3>
                  <p className="text-white/30 text-xs sm:text-sm mt-1">{tech.length} technologies across {categories.length} domains</p>
                </div>
                <button
                  onClick={() => setShowAll(false)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 px-6 sm:px-8 py-4 overflow-x-auto no-scrollbar border-b border-gold/10 relative z-10">
                {['All', ...categories].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-crimson to-gold text-white shadow-lg shadow-crimson/20'
                        : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tech Grid with Real Brand Logos */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {filtered.map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl group transition-all cursor-default"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(212,168,83,0.1)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${t.color}15 0%, ${t.color}05 100%)`;
                        e.currentTarget.style.borderColor = `${t.color}40`;
                        e.currentTarget.style.boxShadow = `0 0 20px ${t.color}15, inset 0 1px 0 ${t.color}20`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(212,168,83,0.1)';
                        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)';
                      }}
                    >
                      {/* Dynamic Crisp Genuine Brand SVG Mask Icon instead of simple circle */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          background: `${t.color}15`,
                          border: `1.5px solid ${t.color}35`,
                        }}
                      >
                        <div
                          className="w-6 h-6 flex-shrink-0 transition-transform group-hover:rotate-[5deg]"
                          style={{
                            backgroundColor: t.color,
                            WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@11.12.0/icons/${t.slug}.svg)`,
                            maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@11.12.0/icons/${t.slug}.svg)`,
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            filter: `drop-shadow(0 0 4px ${t.color}50)`,
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-white/80 font-bold text-xs sm:text-sm leading-tight">{t.name}</p>
                        <p className="text-white/20 text-[9px] sm:text-[10px] uppercase tracking-wider mt-0.5">{t.category}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
