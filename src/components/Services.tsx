import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Globe, FileCode, Database, Cpu, FileText, CheckCircle, BookOpen, ArrowRight, Tag } from 'lucide-react';
import { SettingsDB } from '../utils/storage';
import { SiteSettings } from '../types';

const defaultServices = [
  { icon: <FileCode className="w-6 h-6" />, title: 'Mini Projects', price: '₹1,500', tag: 'onwards', desc: 'Complete mini projects with source code, documentation & presentation.', features: ['Full Source Code', 'Documentation & PPT', '5-7 Day Delivery'], accent: 'crimson' },
  { icon: <Cpu className="w-6 h-6" />, title: 'Major Projects', price: '₹4,500', tag: 'onwards', desc: 'Full-scale final year projects with research papers & demo videos.', features: ['Complete Documentation', 'Video Demo', '14-21 Days'], popular: true, accent: 'gold' },
  { icon: <Globe className="w-6 h-6" />, title: 'Websites', price: '₹2,000', tag: 'onwards', desc: 'Modern, responsive websites for portfolios, startups & businesses.', features: ['Responsive Design', 'SEO Ready', 'Hosting Help'], accent: 'crimson' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'Assignments', price: '₹500', tag: 'onwards', desc: 'Quick turnaround on programming assignments & coursework.', features: ['All Languages', 'Plagiarism Free', '24-48 Hours'], accent: 'gold' },
  { icon: <FileText className="w-6 h-6" />, title: 'Research Papers', price: '₹3,000', tag: 'fixed', desc: 'Professional research papers with 100% zero plagiarism guarantee.', features: ['IEEE/Springer Format', 'Turnitin Report', 'Unlimited Revisions'], highlight: true, accent: 'gold' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'Plagiarism Removal', price: '₹500', tag: 'onwards', desc: 'Remove plagiarism while preserving meaning & academic integrity.', features: ['Before/After Report', 'Manual Rewrite', 'Quick Service'], accent: 'crimson' },
  { icon: <Database className="w-6 h-6" />, title: 'IoT Projects', price: '₹5,500', tag: 'onwards*', desc: 'Arduino, ESP32, Raspberry Pi projects with dashboards.', features: ['Hardware Guidance', 'Cloud Dashboard', '*Parts Separate'], accent: 'gold' },
  { icon: <Code2 className="w-6 h-6" />, title: 'Custom Projects', price: '₹4,500', tag: 'onwards', desc: 'Tell us your idea — we build it. Any technology, any domain.', features: ['Any Tech Stack', 'Your Requirements', 'Flexible Timeline'], accent: 'crimson' },
];

export default function Services() {
  const [activeTouchIndex, setActiveTouchIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    SettingsDB.get().then(setSettings);
  }, []);

  const handleServiceClick = (serviceTitle: string) => {
    let domain = serviceTitle;
    if (serviceTitle === 'Plagiarism Removal') domain = 'Plagiarism Removal';
    else if (serviceTitle === 'Custom Projects') domain = 'Custom';
    else if (serviceTitle === 'IoT Projects') domain = 'IoT Project';
    else if (serviceTitle === 'Mini Projects') domain = 'Mini Project';
    else if (serviceTitle === 'Major Projects') domain = 'Major Project';
    else if (serviceTitle === 'Websites') domain = 'Website';
    else if (serviceTitle === 'Assignments') domain = 'Assignment';
    else if (serviceTitle === 'Research Papers') domain = 'Research Paper';
    
    window.dispatchEvent(new CustomEvent('select-service', { detail: domain }));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const cardEl = target.closest('[data-index]');
      if (cardEl) {
        const index = parseInt(cardEl.getAttribute('data-index') || '', 10);
        if (!isNaN(index) && index !== activeTouchIndex) {
          setActiveTouchIndex(index);
        }
      }
    }
  };

  const services = defaultServices.map(s => {
    let currentPrice = s.price;
    let originalPrice = '';
    
    if (settings) {
      if (s.title === 'Mini Projects') currentPrice = `₹${settings.mini_project_price}`;
      else if (s.title === 'Major Projects') currentPrice = `₹${settings.major_project_price}`;
      else if (s.title === 'Research Papers') currentPrice = `₹${settings.research_paper_price}`;
      else if (s.title === 'Plagiarism Removal') currentPrice = `₹${settings.plagiarism_removal_price}`;
      else if (s.title === 'Custom Projects') currentPrice = `₹${settings.custom_project_price}`;

      if (settings.offer_active) {
        if (s.title === 'Mini Projects' && settings.original_mini_price) originalPrice = `₹${settings.original_mini_price}`;
        else if (s.title === 'Major Projects' && settings.original_major_price) originalPrice = `₹${settings.original_major_price}`;
        else if (s.title === 'Custom Projects' && settings.original_custom_price) originalPrice = `₹${settings.original_custom_price}`;
      }
    }
    
    return { ...s, currentPrice, originalPrice };
  });

  const offerActive = settings?.offer_active && settings?.offer_end_time && new Date(settings.offer_end_time).getTime() > Date.now();

  return (
    <section id="services" className="relative section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="section-header">
          {offerActive ? (
            <motion.span 
              animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(220,20,60,0.2)", "0 0 20px rgba(220,20,60,0.6)", "0 0 10px rgba(220,20,60,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="section-badge glass bg-crimson/20 border border-crimson/40 text-white shadow-lg shadow-crimson/20"
            >
              <Tag className="w-4 h-4 text-gold" /> {settings.offer_reason} — Limited Time
            </motion.span>
          ) : (
            <span className="section-badge glass text-gold">Our Services</span>
          )}
          <h2 className="text-section text-white">
            Everything you need.
            <br /><span className="text-gradient">All in one place.</span>
          </h2>
          <p className="section-sub">Mini to major — every academic need covered with quality and care.</p>
        </motion.div>
 
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
          onTouchMove={handleTouchMove}
        >
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => handleServiceClick(s.title)}
              onTouchStart={() => setActiveTouchIndex(i)}
              data-index={i}
              className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group active:bg-white/5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${
                activeTouchIndex === i ? 'glass-card-active' : ''
              } ${s.popular ? 'ring-1 ring-gold/40' : ''} ${s.highlight ? 'ring-1 ring-crimson/40' : ''} ${offerActive && s.originalPrice ? 'border-crimson/30 shadow-[0_0_30px_rgba(220,20,60,0.1)]' : ''}`}>
              
              {offerActive && s.originalPrice && (
                <div className="absolute inset-0 bg-gradient-to-br from-crimson/5 to-transparent pointer-events-none" />
              )}

              {s.popular && !offerActive && <div className="absolute -top-px -right-px px-2.5 py-0.5 bg-gradient-to-r from-gold-dark to-gold text-black text-[9px] sm:text-[10px] font-bold rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">Popular</div>}
              {s.highlight && !offerActive && <div className="absolute -top-px -right-px px-2.5 py-0.5 bg-gradient-to-r from-crimson to-gold text-white text-[9px] sm:text-[10px] font-bold rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">0% Plag</div>}
              {offerActive && s.originalPrice && (
                <div className="absolute -top-px -right-px px-3 py-1 bg-gradient-to-r from-crimson to-crimson-dark text-white text-[10px] font-black rounded-bl-2xl rounded-tr-2xl uppercase tracking-widest shadow-lg shadow-crimson/50 animate-pulse">
                  Offer Active
                </div>
              )}

              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl glass flex items-center justify-center mb-3 sm:mb-4 relative z-10 ${
                s.accent === 'gold' ? 'text-gold/60 group-hover:text-gold' : 'text-crimson/60 group-hover:text-crimson'
              } transition-colors`}>
                {s.icon}
              </div>

              <h3 className="text-card-title text-white mb-0.5 relative z-10">{s.title}</h3>
              <div className="flex items-baseline gap-1.5 mb-2 sm:mb-3 relative z-10 flex-wrap">
                <span className="text-lg sm:text-xl font-bold text-gradient">{s.currentPrice}</span>
                {s.originalPrice && (
                  <span className="text-xs sm:text-sm text-red-500/60 line-through decoration-red-500/60 font-semibold">{s.originalPrice}</span>
                )}
                <span className="text-[10px] sm:text-xs text-white/25">{s.tag}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/35 leading-relaxed mb-3 sm:mb-4 relative z-10">{s.desc}</p>

              <ul className="space-y-1.5 mb-4 relative z-10">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.accent === 'gold' ? 'bg-gold/60' : 'bg-crimson/60'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href={`https://wa.me/918897492936?text=${encodeURIComponent(`Hi! I'm interested in ${s.title} (${s.currentPrice}). Can you help?`)}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold transition-colors group/link active:scale-95 relative z-10 ${
                  s.accent === 'gold' ? 'text-gold hover:text-gold-light' : 'text-crimson hover:text-crimson-light'
                }`}>
                Enquire Now <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
