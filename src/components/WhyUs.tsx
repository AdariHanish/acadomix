import { motion } from 'framer-motion';
import { Shield, Clock, Headphones, Award, Wallet, RefreshCw } from 'lucide-react';

const reasons = [
  { icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />, title: 'Student-Friendly Prices', desc: 'Built for student budgets. Premium quality at prices that won\'t break the bank.', color: 'text-gold group-hover:text-gold-light' },
  { icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />, title: 'On-Time Delivery', desc: 'Never miss a deadline. We deliver on or before the promised date, guaranteed.', color: 'text-crimson group-hover:text-crimson-light' },
  { icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />, title: '100% Original Code', desc: 'Every project built from scratch. No templates, no copied code — just original work.', color: 'text-gold group-hover:text-gold-light' },
  { icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />, title: '24/7 Support', desc: 'Available round the clock via WhatsApp, email, or phone call.', color: 'text-crimson group-hover:text-crimson-light' },
  { icon: <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />, title: 'Free Revisions', desc: 'We iterate until you\'re completely satisfied with the final output.', color: 'text-gold group-hover:text-gold-light' },
  { icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />, title: 'Expert Developers', desc: '500+ projects delivered by experienced, vetted professionals.', color: 'text-crimson group-hover:text-crimson-light' },
];

export default function WhyUs() {
  return (
    <section className="relative bg-surface-1 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="section-header">
          <span className="section-badge glass text-crimson">Why Choose Us</span>
          <h2 className="text-section text-white">
            Built different.
            <br /><span className="text-gradient">Built for you.</span>
          </h2>
          <p className="section-sub">Six reasons why 500+ students trust Acadomix for their academic projects.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {reasons.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 group active:bg-white/5 transition-colors">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl glass flex items-center justify-center flex-shrink-0 ${item.color} transition-colors`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-[11px] sm:text-sm text-white/35 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
