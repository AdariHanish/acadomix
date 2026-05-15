import { motion } from 'framer-motion';
import { MessageSquare, FileSearch, Code2, Rocket } from 'lucide-react';

const steps = [
  { icon: <MessageSquare className="w-6 h-6" />, step: '01', title: 'Share Requirements', desc: 'Tell us your project details, tech stack, deadline, and any specific guidelines.', color: 'text-crimson group-hover:text-crimson-light' },
  { icon: <FileSearch className="w-6 h-6" />, step: '02', title: 'Get a Quote', desc: 'Receive a transparent quote with clear timeline. No hidden charges, ever.', color: 'text-gold group-hover:text-gold-light' },
  { icon: <Code2 className="w-6 h-6" />, step: '03', title: 'We Build It', desc: 'Expert developers start working with regular progress updates.', color: 'text-crimson group-hover:text-crimson-light' },
  { icon: <Rocket className="w-6 h-6" />, step: '04', title: 'Deliver & Support', desc: 'Complete project with source code, documentation, and free support.', color: 'text-gold group-hover:text-gold-light' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 lg:py-32 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-gold font-semibold mb-4 uppercase tracking-wider">How It Works</span>
          <h2 className="text-section text-white mb-4">
            Four simple steps.
            <br /><span className="text-gradient">That's all it takes.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {steps.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-4 sm:p-5 text-center relative group active:bg-white/5 transition-colors">
              <span className="absolute top-3 right-3 text-2xl sm:text-3xl font-bold text-white/[0.04] group-hover:text-gold/10 transition-colors">{item.step}</span>
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl glass flex items-center justify-center mx-auto mb-3 sm:mb-4 ${item.color} transition-colors`}>
                {item.icon}
              </div>
              <h3 className="text-xs sm:text-base font-semibold text-white mb-1 sm:mb-2">{item.title}</h3>
              <p className="text-[10px] sm:text-sm text-white/35 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ delay: 0.3 }}
          className="text-center mt-10 sm:mt-14">
          <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white text-sm sm:text-base font-semibold rounded-full btn-glow shine active:scale-[0.97] transition-transform">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5" /> Start Your Project Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
