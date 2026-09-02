import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CreditCard } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden vintage-pinstripe">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-crimson/8 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.7 , ease: "easeOut" }}
          className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 text-center max-w-4xl mx-auto border-gold/20 shadow-2xl">
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity , ease: "easeOut" }}
            className="text-3xl sm:text-4xl mb-4 sm:mb-6">🚀</motion.div>
          <h2 className="text-section text-white">
            Ready to ace
            <br /><span className="text-gradient">your project?</span>
          </h2>
          <p className="text-xs sm:text-base text-white/35 max-w-lg mx-auto mb-6 sm:mb-8">
            Don't let deadlines stress you out. Get expert help and focus on what matters — your learning.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white text-sm sm:text-base font-semibold rounded-full btn-glow shine flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Start Your Project <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a href={`https://wa.me/918897492636?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`} target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base font-semibold rounded-full transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.97]">
              💬 WhatsApp Us
            </a>
            <a href="tel:+919515192936"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-full transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.97]">
              📞 Call Us Now
            </a>
            <Link to="/payment"
              className="btn-payment-luxury w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-full flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gold-light drop-shadow-[0_0_6px_rgba(212,168,83,0.8)]" /> Make Payment <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
