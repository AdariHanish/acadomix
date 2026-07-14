import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, Timer, Tag } from 'lucide-react';
import { SettingsDB } from '../utils/storage';
import { SiteSettings } from '../types';

function OfferCountdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (timeLeft.expired) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
      <Timer className="w-3 h-3 text-gold shrink-0" />
      <span className="text-gold font-bold">
        {String(timeLeft.d).padStart(2,'0')}d {String(timeLeft.h).padStart(2,'0')}h {String(timeLeft.m).padStart(2,'0')}m {String(timeLeft.s).padStart(2,'0')}s
      </span>
    </div>
  );
}

export default function Pricing() {
  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const load = () => SettingsDB.get().then(setSettings);
    load();
    // Re-poll every 60s so price rolls back automatically for users currently on the page
    pollRef.current = window.setInterval(load, 60000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const offerActive = !!(
    settings?.offer_active &&
    settings?.offer_end_time &&
    new Date(settings.offer_end_time).getTime() > Date.now()
  );

  const mini = offerActive ? settings!.mini_project_price : (settings?.mini_project_price || '1500');
  const major = offerActive ? settings!.major_project_price : (settings?.major_project_price || '4500');
  const origMini = settings?.original_mini_price;
  const origMajor = settings?.original_major_price;

  const plans = [
    {
      name: 'Starter', icon: <Zap className="w-5 h-5" />, price: `₹${mini}`,
      originalPrice: offerActive && origMini ? `₹${origMini}` : null,
      period: 'onwards', desc: 'Mini projects & assignments',
      features: ['Full Source Code', 'Basic Documentation', 'WhatsApp Support', '2 Free Revisions', '5-7 Day Delivery'],
      cta: 'Get Started', gradient: 'from-white/10 to-white/5', check: 'text-gold'
    },
    {
      name: 'Professional', icon: <Star className="w-5 h-5" />, price: `₹${major}`,
      originalPrice: offerActive && origMajor ? `₹${origMajor}` : null,
      period: 'onwards', desc: 'Major projects & websites',
      features: ['Complete Source Code & DB', 'Full Documentation + PPT', 'Report & Synopsis', '24/7 Priority Support', '5 Free Revisions', '14-21 Day Delivery', 'Video Demo'],
      cta: 'Most Popular', popular: true, gradient: 'from-crimson to-crimson-dark', check: 'text-gold'
    },
    {
      name: 'Research', icon: <Crown className="w-5 h-5" />, price: `₹${settings?.research_paper_price || '3000'}`,
      originalPrice: null,
      period: 'fixed', desc: 'Zero plagiarism papers',
      features: ['IEEE/Springer Format', '100% Zero Plagiarism', 'Turnitin Report', 'Unlimited Revisions', 'Publication Guidance', 'Reference Management'],
      cta: 'Order Now', gradient: 'from-gold-dark to-gold', check: 'text-crimson'
    },
  ];

  return (
    <section id="pricing" className="relative section-glow overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="section-header">
          <span className="section-badge glass text-crimson">Pricing Plans</span>
          <h2 className="text-section text-white">
            Premium quality.
            <br /><span className="text-gradient">Student-friendly prices.</span>
          </h2>
          <p className="section-sub">Transparent pricing with no hidden charges — ever.</p>

          {/* Offer Banner */}
          {offerActive && settings && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-col items-center gap-2 mt-4 px-6 py-3 rounded-2xl bg-gold/10 border border-gold/25">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold" />
                <p className="text-gold font-bold text-sm">🎉 {settings.offer_reason}</p>
              </div>
              <OfferCountdown endTime={settings.offer_end_time!} />
              <p className="text-[10px] text-white/30">Offer prices active — ends automatically when timer hits zero</p>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col ${plan.popular ? 'md:-mt-3 md:mb-[-12px] ring-2 ring-crimson/40' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-crimson via-gold-dark to-gold text-white text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg shadow-crimson/30">
                  ⚡ Most Popular
                </div>
              )}
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-3 sm:mb-4`}>{plan.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">{plan.name}</h3>
              <p className="text-[11px] sm:text-xs text-white/30 mb-3 sm:mb-4">{plan.desc}</p>
              <div className="mb-5 sm:mb-6">
                {plan.originalPrice && (
                  <div className="text-white/30 text-xs line-through mb-0.5">{plan.originalPrice}</div>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-gradient">{plan.price}</span>
                <span className="text-[10px] sm:text-xs text-white/20 ml-1.5">/ {plan.period}</span>
                {offerActive && plan.originalPrice && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[9px] font-bold uppercase">Offer Price</span>
                )}
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
