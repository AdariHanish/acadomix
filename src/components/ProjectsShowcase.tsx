import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, ArrowRight, Sparkles } from 'lucide-react';
import { ProjectsDB } from '../utils/storage';
import { Project } from '../types';
import AppleLoader from './AppleLoader';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'website', name: 'Web Dev' },
  { id: 'aiml', name: 'AI/ML' },
  { id: 'datascience', name: 'Data Science' },
  { id: 'iot', name: 'IoT' },
  { id: 'research', name: 'Research' },
];

export default function ProjectsShowcase() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState('all');
  const [activeType, setActiveType] = useState<'mini' | 'major'>('major');
  const [hasScrolled, setHasScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ProjectsDB.getAll().then(data => {
      setAllProjects(data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load projects.');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Subtle nudge animation on mount for mobile
    const timeout = setTimeout(() => {
      if (scrollRef.current && window.innerWidth < 640 && !hasScrolled) {
        scrollRef.current.scrollTo({ left: 45, behavior: 'smooth' });
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }, 500);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [hasScrolled]);

  const getShowcaseData = () => {
    let projects = allProjects;
    
    // 1. Filter by Domain
    if (activeDomain !== 'all') {
      projects = projects.filter(p => p.category === activeDomain);
    }
    
    // 2. Filter by Type (Mini/Major)
    projects = projects.filter(p => p.year_type.toLowerCase() === activeType);

    const totalCount = projects.length;

    // 3. Selection: Grab exactly 2 projects to display
    const trendingAndPopular = projects.filter(p => p.is_trending && p.is_popular);
    const onlyPopular = projects.filter(p => p.is_popular && !trendingAndPopular.includes(p));
    const normal = projects.filter(p => !p.is_popular && !p.is_trending);

    const allSorted = [...trendingAndPopular, ...onlyPopular, ...normal];
    const displayed = allSorted.slice(0, 5);
    const remainingCount = totalCount - displayed.length;

    return { displayed, remainingCount };
  };

  const { displayed, remainingCount } = getShowcaseData();

  const handleDomainChange = useCallback((domId: string) => {
    setActiveDomain(domId);
  }, []);

  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="projects" className="relative py-20 sm:py-28 lg:py-32 bg-surface-1 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container-responsive relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-gold font-semibold mb-4 uppercase tracking-wider">
            Our Projects
          </span>
          <h2 className="text-section text-white mb-4">
            Ready-made. Custom-built.
            <br />
            <span className="text-white/30">Choose what fits.</span>
          </h2>
        </motion.div>

        {/* Filter Pills — scrollable on mobile */}
        <div className="relative mb-4 sm:mb-6">
          {!hasScrolled && (
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-1 via-surface-1/80 to-transparent pointer-events-none z-10 sm:hidden flex justify-end items-center pr-3">
              <ArrowRight className="w-5 h-5 text-white/50 animate-pulse drop-shadow-md" />
            </div>
          )}
          <div 
            ref={scrollRef}
            className="-mx-2 px-2 overflow-x-auto no-scrollbar relative"
            onScroll={() => { if (!hasScrolled) setHasScrolled(true); }}
          >
            <div className="flex gap-1.5 sm:gap-2 justify-start sm:justify-center w-max mx-auto p-1.5 glass rounded-full">
            {categories.map((cat) => {
              const count = cat.id === 'all' ? allProjects.length : allProjects.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleDomainChange(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-300 active:scale-95 flex items-center gap-1 ${
                    activeDomain === cat.id
                      ? 'bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-lg shadow-crimson/30'
                      : 'text-white/40 hover:text-white active:text-crimson hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                  {count > 0 && (
                    <span className={`text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded-full leading-none ${
                      activeDomain === cat.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/30'
                    }`}>{count > 9 ? `${count}` : count}</span>
                  )}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Type Toggle (Mini/Major) */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            {(['major', 'mini'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeType === type
                    ? 'bg-white text-black shadow-xl'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-center text-[10px] sm:text-xs text-white/20 mb-6">
          Showing featured <span className="text-gold uppercase font-bold">{activeType}</span> projects 
          {activeDomain !== 'all' && <span> in <span className="text-crimson">{categories.find(c => c.id === activeDomain)?.name}</span></span>}
        </p>

        {/* Projects Grid or Empty State */}
        {loading ? (
          <AppleLoader />
        ) : error || displayed.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-16">
            <p className="text-3xl sm:text-4xl mb-3">{error ? '⚠️' : '📁'}</p>
            <p className="text-base sm:text-lg text-white/40 font-medium">{error || 'No projects in this category yet'}</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={scrollToContact}
                className="px-6 py-3 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-full transition-colors btn-glow active:scale-95">
                Request Custom Project
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {displayed.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden group"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 p-4 sm:p-5 pb-0">
                    {project.is_popular && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-crimson/15 text-crimson text-[10px] sm:text-xs font-semibold">
                        <Star className="w-3 h-3 fill-crimson" /> Popular
                      </span>
                    )}
                    {project.is_trending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] sm:text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </span>
                    )}
                    {(!project.is_popular && !project.is_trending) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] sm:text-xs font-semibold">
                        <Star className="w-3 h-3" /> Normal
                      </span>
                    )}
                    {(() => {
                      const discountPercentage = Math.round(((project.market_price - project.our_price) / project.market_price) * 100);
                      if (discountPercentage > 0 && !isNaN(discountPercentage)) {
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] sm:text-xs font-semibold">
                            {discountPercentage}% OFF
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] sm:text-xs text-white/20 uppercase tracking-wider mb-1">
                      {project.category} · {project.year_type}
                    </p>
                    <h3 className="text-card-title text-white mb-2 group-hover:text-gold transition-all duration-300">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/30 leading-relaxed mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.features.split(',').slice(0, 3).map((f, j) => (
                        <span key={j} className="text-[10px] sm:text-xs px-2 py-1 rounded-lg glass text-white/30">
                          {f.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="border-t border-white/5 pt-4 space-y-1.5">
                      <div className="flex justify-between text-[10px] sm:text-xs text-red-500">
                        <span>Project Value:</span>
                        <span className="line-through decoration-red-500">₹{project.original_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] sm:text-xs text-yellow-500">
                        <span>Market Price:</span>
                        <span className="line-through decoration-yellow-500">₹{project.market_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gold/40 uppercase font-bold tracking-wider">Acadomix Price</span>
                          <span className="text-xl sm:text-2xl font-black text-gradient">₹{project.our_price.toLocaleString()}</span>
                        </div>
                        {(() => {
                          const discountPercentage = Math.round(((project.market_price - project.our_price) / project.market_price) * 100);
                          if (discountPercentage > 0 && !isNaN(discountPercentage)) {
                            return (
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-green-400/50 uppercase font-bold tracking-wider">You Save</span>
                                <span className="text-xs sm:text-sm font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg border border-green-400/20">
                                  {discountPercentage}% OFF
                                </span>
                              </div>
                            );
                          }
                          return <div />;
                        })()}
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={`https://wa.me/918897492936?text=${encodeURIComponent(`Hi! Acadomix, I’m interested in discussing the project: "${project.title}" (₹${project.our_price}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-3 bg-gradient-to-r from-crimson to-crimson-dark text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 btn-glow shine active:scale-[0.98] transition-transform"
                    >
                      <Sparkles className="w-4 h-4" /> Get This Project <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}

              {/* +X More Projects Card */}
              {remainingCount > 0 && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, delay: displayed.length * 0.04 }}
                  className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden group flex flex-col justify-center items-center text-center p-8 border border-gold/20 hover:border-gold/50 cursor-pointer"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Link to="/projects" className="flex flex-col items-center justify-center w-full h-full">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-crimson/20 to-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-crimson/10 border border-gold/20">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-crimson to-gold">+{remainingCount}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">More Projects</h3>
                    <p className="text-sm text-white/40 mb-6 px-4">Explore the full catalog of {activeDomain === 'all' ? 'all domains' : categories.find(c => c.id === activeDomain)?.name} projects</p>
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 group-hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all active:scale-95">
                      View All <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10 sm:mt-14">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all hover:border-gold/30 active:scale-95"
          >
            View All Projects Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Custom Project CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          className="mt-12 sm:mt-16"
        >
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3">
              Need a <span className="text-gradient">Custom Project</span>?
            </h3>
            <p className="text-xs sm:text-sm text-white/35 mb-5">
              Don't see what you're looking for? We build custom projects starting at ₹4,500
            </p>
            <button onClick={scrollToContact}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-full btn-glow shine text-sm active:scale-95 transition-transform">
              Request Custom Project <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
