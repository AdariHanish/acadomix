import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ProjectsDB, getCachedData } from '../utils/storage';
import { Project } from '../types';
import AppleLoader from '../components/AppleLoader';

const categories = [
  { id: 'all', name: 'All Domains' },
  { id: 'website', name: 'Web Development' },
  { id: 'aiml', name: 'AI & Machine Learning' },
  { id: 'datascience', name: 'Data Science' },
  { id: 'iot', name: 'Internet of Things' },
  { id: 'research', name: 'Research Papers' },
];

export default function ProjectsPage() {
  const cached = getCachedData<Project[]>('/projects');
  const [allProjects, setAllProjects] = useState<Project[]>(cached || []);
  const [loading, setLoading] = useState(!cached || cached.length === 0);
  const [activeDomain, setActiveDomain] = useState('all');
  const [activeType, setActiveType] = useState<'mini' | 'major'>('major');

  useEffect(() => {
    window.scrollTo(0, 0);
    ProjectsDB.getAll().then(data => {
      setAllProjects(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const getFilteredProjects = () => {
    let projects = allProjects;
    
    // 1. Domain
    if (activeDomain !== 'all') {
      projects = projects.filter(p => p.category === activeDomain);
    }

    // 2. Type
    projects = projects.filter(p => p.year_type.toLowerCase() === activeType);

    // Sort: Trending+Popular first, then Popular, then Normal — show ALL
    const trendingAndPopular = projects.filter(p => p.is_trending && p.is_popular);
    const onlyPopular = projects.filter(p => p.is_popular && !trendingAndPopular.includes(p));
    const normal = projects.filter(p => !p.is_popular && !p.is_trending);

    return [...trendingAndPopular, ...onlyPopular, ...normal];
  };

  const displayed = getFilteredProjects();

  return (
    <div className="vintage-classic-canvas min-h-screen text-white relative overflow-hidden">
      {/* Subtle vintage grain texture */}
      <div className="absolute inset-0 vintage-grain pointer-events-none opacity-40" />

      {/* Background ambient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-crimson/8 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold/8 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-crimson/6 rounded-full blur-[130px] pointer-events-none" />

      <Navbar />
      
      <main className="pt-24 sm:pt-32 pb-20 relative z-10">
        <div className="container-responsive">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-gold text-xs sm:text-sm mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </Link>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
                Project <span className="text-gradient">Catalog</span>
              </h1>
              <p className="text-sm sm:text-base text-white/30 max-w-xl">
                Browse our complete collection of <span className="text-gold font-bold">{allProjects.length}</span> premium projects across all domains.
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4 p-2 glass rounded-2xl sm:rounded-full">
            {categories.map((cat) => {
              const count = cat.id === 'all' ? allProjects.length : allProjects.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveDomain(cat.id)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-semibold rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                    activeDomain === cat.id
                      ? 'bg-gradient-to-r from-gold-dark to-gold text-black shadow-lg shadow-gold/20'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    activeDomain === cat.id ? 'bg-black/20 text-black/70' : 'bg-white/10 text-white/30'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Type Toggle (Mini/Major) */}
          <div className="flex justify-start mb-10">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              {(['major', 'mini'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
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

          {loading ? (
            <label className="block relative"><AppleLoader /></label>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {displayed.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, delay: i * 0.05 , ease: "easeOut" }}
                    className="glass-card rounded-3xl overflow-hidden flex flex-col h-full border border-white/5 hover:border-gold/30 transition-colors group"
                  >
                    <div className="flex flex-wrap gap-1.5 p-5 pb-0">
                      {project.is_popular && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-gold" /> Popular
                        </span>
                      )}
                      {project.is_trending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-crimson/10 text-crimson text-[10px] font-bold uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" /> Trending
                        </span>
                      )}
                      {(!project.is_popular && !project.is_trending) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider">
                          <Star className="w-3 h-3" /> Normal
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{project.category} · {project.year_type}</p>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">{project.title}</h3>
                      <p className="text-sm text-white/65 leading-relaxed mb-6 flex-1 line-clamp-3">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.features.split(',').slice(0, 3).map((f, j) => (
                          <span key={j} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/10 text-white/60 border border-white/10">{f.trim()}</span>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/15 space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-white/50 uppercase tracking-widest">
                            <span>Project Value</span>
                            <span className="text-red-500 line-through">₹{project.original_price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-white/60 font-bold uppercase tracking-widest">
                            <span>Market Price</span>
                            <span className="text-yellow-400 line-through decoration-gold/60">₹{project.market_price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-gold uppercase font-bold tracking-tighter mb-0.5">Acadomix Price</p>
                            <p className="text-3xl font-black text-white">₹{project.our_price.toLocaleString()}</p>
                          </div>
                          {(() => {
                            const discountPercentage = Math.round(((project.market_price - project.our_price) / project.market_price) * 100);
                            if (discountPercentage > 0 && !isNaN(discountPercentage)) {
                              return (
                                <div className="text-right">
                                  <p className="text-[10px] text-green-400 uppercase font-bold tracking-tighter mb-0.5">Your Savings</p>
                                  <span className="text-sm font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-xl border border-green-400/20">
                                    {discountPercentage}% OFF
                                  </span>
                                </div>
                              );
                            }
                            return <div />;
                          })()}
                        </div>
                        
                        <a
                          href={`https://wa.me/918897492636?text=${encodeURIComponent(`Hi! Acadomix, I’m interested in discussing the project: "${project.title}" (₹${project.our_price}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 bg-gradient-to-r from-gold-dark to-gold text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <Sparkles className="w-4 h-4" /> Get This Project <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
