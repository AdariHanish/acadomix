import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, ArrowRight, Sparkles } from 'lucide-react';
import { ProjectsDB } from '../utils/storage';
import { Project } from '../types';
import AppleLoader from './AppleLoader';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'mini', name: 'Mini' },
  { id: 'major', name: 'Major' },
  { id: 'website', name: 'Web' },
  { id: 'aiml', name: 'AI/ML' },
  { id: 'datascience', name: 'Data' },
  { id: 'iot', name: 'IoT' },
  { id: 'research', name: 'Research' },
];

export default function ProjectsShowcase() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    ProjectsDB.getAll().then(data => {
      setAllProjects(data);
      setLoading(false);
    }).catch(err => {
      console.error('Fetch error:', err);
      setError('Failed to load projects. Please check your database connection.');
      setLoading(false);
    });
  }, []);
  const [active, setActive] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = active === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === active);

  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const discount = (o: number, p: number) => Math.round(((o - p) / o) * 100);

  const handleCategoryChange = useCallback((catId: string) => {
    setActive(catId);
    setShowAll(false);
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
        <div className="mb-8 sm:mb-12 -mx-2 px-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 sm:gap-2 justify-center min-w-max mx-auto p-1.5 glass rounded-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  active === cat.id
                    ? 'bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-lg shadow-crimson/30'
                    : 'text-white/40 hover:text-white active:text-crimson hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-center text-[10px] sm:text-xs text-white/20 mb-6">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
          {active !== 'all' && <span> in <span className="text-crimson">{categories.find(c => c.id === active)?.name}</span></span>}
        </p>

        {/* Projects Grid or Empty State */}
        {loading ? (
          <AppleLoader />
        ) : error || filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-16">
            <p className="text-3xl sm:text-4xl mb-3">{error ? '⚠️' : '📁'}</p>
            <p className="text-base sm:text-lg text-white/40 font-medium">{error || 'No projects in this category yet'}</p>
            {error ? (
              <div className="mt-4 p-4 rounded-xl glass max-w-md mx-auto text-xs text-white/30 text-left">
                <p className="font-bold text-white/50 mb-2 uppercase">Possible Fixes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Check if <code className="text-crimson">DATABASE_URL</code> is correctly set in Vercel environment variables.</li>
                  <li>Visit <a href="/api/setup" className="text-gold hover:underline">/api/setup</a> to initialize your database tables.</li>
                  <li>Ensure your TiDB cluster allows connections from Vercel's IP range.</li>
                </ul>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-white/20 mt-2 mb-6">Check back soon or request a custom project!</p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={scrollToContact}
                className="px-6 py-3 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-full transition-colors btn-glow active:scale-95">
                Request Custom Project
              </button>
              {error && (
                <button onClick={() => window.location.reload()}
                  className="px-6 py-3 glass hover:bg-white/5 text-white/60 text-sm font-semibold rounded-full transition-colors active:scale-95">
                  Try Again
                </button>
              )}
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] sm:text-xs font-semibold">
                      {discount(project.original_price, project.our_price)}% OFF
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] sm:text-xs text-white/20 uppercase tracking-wider mb-1">
                      {project.category} · {project.year_type}
                    </p>
                    <h3 className="text-card-title text-white mb-2 group-hover:text-gradient transition-all duration-300">
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
                    <div className="border-t border-white/5 pt-4 space-y-1">
                      <div className="flex justify-between text-[10px] sm:text-xs text-white/15">
                        <span>Original:</span>
                        <span className="line-through">₹{project.original_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-white/15">
                        <span>Market:</span>
                        <span className="line-through">₹{project.market_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-white/50">Our Price:</span>
                        <span className="text-lg sm:text-xl font-bold text-gradient">₹{project.our_price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={`https://wa.me/919515192936?text=${encodeURIComponent(`Hi! I'm interested in "${project.title}" (₹${project.our_price}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-3 bg-gradient-to-r from-crimson to-crimson-dark text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 btn-glow shine active:scale-[0.98] transition-transform"
                    >
                      <Sparkles className="w-4 h-4" /> Get This Project <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Show More */}
        {filtered.length > 6 && (
          <div className="text-center mt-8 sm:mt-10">
            <button onClick={() => setShowAll(!showAll)}
              className="px-6 sm:px-8 py-2.5 sm:py-3 glass text-white/60 hover:text-white font-semibold rounded-full transition-all hover:bg-white/5 text-xs sm:text-sm active:scale-95">
              {showAll ? 'Show Less' : `View All ${filtered.length} Projects`}
            </button>
          </div>
        )}

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
