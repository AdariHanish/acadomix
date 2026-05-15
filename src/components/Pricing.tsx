import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown } from 'lucide-react';

const plans = [
  { name: 'Starter', icon: <Zap className="w-5 h-5" />, price: '₹1,500', period: 'onwards', desc: 'Mini projects & assignments',
    features: ['Full Source Code', 'Basic Documentation', 'WhatsApp Support', '2 Free Revisions', '5-7 Day Delivery'],
    cta: 'Get Started', gradient: 'from-white/10 to-white/5', check: 'text-gold' },
  { name: 'Professional', icon: <Star className="w-5 h-5" />, price: '₹4,500', period: 'onwards', desc: 'Major projects & websites',
    features: ['Complete Source Code & DB', 'Full Documentation + PPT', 'Report & Synopsis', '24/7 Priority Support', '5 Free Revisions', '14-21 Day Delivery', 'Video Demo'],
    cta: 'Most Popular', popular: true, gradient: 'from-crimson to-crimson-dark', check: 'text-gold' },
  { name: 'Research', icon: <Crown className="w-5 h-5" />, price: '₹3,000', period: 'fixed', desc: 'Zero plagiarism papers',
    features: ['IEEE/Springer Format', '100% Zero Plagiarism', 'Turnitin Report', 'Unlimited Revisions', 'Publication Guidance', 'Reference Management'],
    cta: 'Order Now', gradient: 'from-gold-dark to-gold', check: 'text-crimson' },
];

export default function Pricing() {
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="pricing" className="relative py-20 sm:py-28 lg:py-32 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-crimson font-semibold mb-4 uppercase tracking-wider">Pricing Plans</span>
          <h2 className="text-section text-white mb-4">
            Premium quality.
            <br /><span className="text-gradient">Student-friendly prices.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col ${
                plan.popular ? 'md:-mt-3 md:mb-[-12px] ring-2 ring-crimson/40' : ''
              }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-crimson via-gold-dark to-gold text-white text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-crimson/30">
                  ⚡ Most Popular
                </div>
              )}
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-3 sm:mb-4`}>{plan.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">{plan.name}</h3>
              <p className="text-[11px] sm:text-xs text-white/30 mb-3 sm:mb-4">{plan.desc}</p>
              <div className="mb-5 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-gradient">{plan.price}</span>
                <span className="text-[10px] sm:text-xs text-white/20 ml-1.5">/ {plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 sm:mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[11px] sm:text-sm text-white/50">
                    <Check className={`w-4 h-4 ${plan.check} flex-shrink-0 mt-0.5`} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={scrollToContact}
                className={`w-full py-3 sm:py-3.5 text-[11px] sm:text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.97] ${
                  plan.popular
                    ? 'bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white btn-glow shine'
                    : 'glass text-white/70 hover:text-white hover:bg-white/10'
                }`}>{plan.cta}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
