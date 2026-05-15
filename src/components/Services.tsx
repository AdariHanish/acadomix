import { motion } from 'framer-motion';
import { Code2, Globe, FileCode, Database, Cpu, FileText, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

const services = [
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
  return (
    <section id="services" className="relative py-20 sm:py-28 lg:py-32 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-gold font-semibold mb-4 uppercase tracking-wider">Our Services</span>
          <h2 className="text-section text-white mb-4">
            Everything you need.
            <br /><span className="text-gradient">All in one place.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {services.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group active:bg-white/5 transition-colors ${
                s.popular ? 'ring-1 ring-gold/40' : ''} ${s.highlight ? 'ring-1 ring-crimson/40' : ''}`}>
              {s.popular && <div className="absolute -top-px -right-px px-2.5 py-0.5 bg-gradient-to-r from-gold-dark to-gold text-black text-[9px] sm:text-[10px] font-bold rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">Popular</div>}
              {s.highlight && <div className="absolute -top-px -right-px px-2.5 py-0.5 bg-gradient-to-r from-crimson to-gold text-white text-[9px] sm:text-[10px] font-bold rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">0% Plag</div>}

              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl glass flex items-center justify-center mb-3 sm:mb-4 ${
                s.accent === 'gold' ? 'text-gold/60 group-hover:text-gold' : 'text-crimson/60 group-hover:text-crimson'
              } transition-colors`}>
                {s.icon}
              </div>

              <h3 className="text-card-title text-white mb-0.5">{s.title}</h3>
              <div className="flex items-baseline gap-1.5 mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl font-bold text-gradient">{s.price}</span>
                <span className="text-[10px] sm:text-xs text-white/25">{s.tag}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/35 leading-relaxed mb-3 sm:mb-4">{s.desc}</p>

              <ul className="space-y-1.5 mb-4">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.accent === 'gold' ? 'bg-gold/60' : 'bg-crimson/60'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a href={`https://wa.me/918897492936?text=${encodeURIComponent(`Hi! I'm interested in ${s.title} (${s.price}). Can you help?`)}`}
                target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold transition-colors group/link active:scale-95 ${
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
