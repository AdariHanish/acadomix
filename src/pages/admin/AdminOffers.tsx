import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Check, AlertTriangle, RotateCcw, Zap, Timer } from 'lucide-react';
import { SettingsDB } from '../../utils/storage';
import { SiteSettings } from '../../types';

function Countdown({ endTime, onExpire }: { endTime: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
  const calledExpire = useRef(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, expired: true });
        if (!calledExpire.current) { calledExpire.current = true; onExpire(); }
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s, expired: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  if (timeLeft.expired) return (
    <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <p className="text-red-400 text-sm font-semibold">⏰ Offer Expired — Prices have been rolled back automatically</p>
    </div>
  );

  const blocks = [
    { label: 'Days', val: timeLeft.d },
    { label: 'Hours', val: timeLeft.h },
    { label: 'Mins', val: timeLeft.m },
    { label: 'Secs', val: timeLeft.s },
  ];

  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {blocks.map(({ label, val }) => (
        <div key={label} className="flex flex-col items-center bg-white/5 rounded-xl px-4 py-3 min-w-[70px]">
          <span className="text-3xl font-black text-gold tabular-nums">{String(val).padStart(2, '0')}</span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SETTINGS: SiteSettings = {
  mini_project_price: '1500', major_project_price: '4500', custom_project_price: '4500',
  research_paper_price: '3000', plagiarism_removal_price: '500',
  admin_password: '', security_question: '', security_answer: '',
};

export default function AdminOffers() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [offerReason, setOfferReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const [miniPrice, setMiniPrice] = useState('');
  const [majorPrice, setMajorPrice] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SettingsDB.get().then(s => {
      setSettings(s);
      setMiniPrice(s.mini_project_price);
      setMajorPrice(s.major_project_price);
      setCustomPrice(s.custom_project_price);
      setOfferReason(s.offer_reason || '');
      setEndDate(s.offer_end_time ? s.offer_end_time.slice(0, 16) : '');
      setLoading(false);
    });
  }, []);

  const handleExpire = async () => {
    // Auto-rollback: restore original prices
    const orig = settings;
    await SettingsDB.update({
      offer_active: false,
      mini_project_price: orig.original_mini_price || orig.mini_project_price,
      major_project_price: orig.original_major_price || orig.major_project_price,
      custom_project_price: orig.original_custom_price || orig.custom_project_price,
    });
    const fresh = await SettingsDB.get();
    setSettings(fresh);
    setMiniPrice(fresh.mini_project_price);
    setMajorPrice(fresh.major_project_price);
    setCustomPrice(fresh.custom_project_price);
  };

  const activateOffer = async () => {
    if (!offerReason.trim()) { setError('Please enter an offer reason / festival name.'); return; }
    if (!endDate) { setError('Please select an offer end date & time.'); return; }
    if (new Date(endDate).getTime() <= Date.now()) { setError('End date must be in the future.'); return; }
    if (!miniPrice || !majorPrice || !customPrice) { setError('Please set all three prices.'); return; }
    setError(null);
    try {
      await SettingsDB.update({
        offer_active: true,
        offer_reason: offerReason,
        offer_end_time: new Date(endDate).toISOString(),
        original_mini_price: settings.mini_project_price,
        original_major_price: settings.major_project_price,
        original_custom_price: settings.custom_project_price,
        mini_project_price: miniPrice,
        major_project_price: majorPrice,
        custom_project_price: customPrice,
      });
      const fresh = await SettingsDB.get();
      setSettings(fresh);
      setSuccess('🎉 Offer activated! Prices updated on website.');
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError('Failed to activate offer. Please try again.');
    }
  };

  const deactivateOffer = async () => {
    try {
      await SettingsDB.update({
        offer_active: false,
        mini_project_price: settings.original_mini_price || settings.mini_project_price,
        major_project_price: settings.original_major_price || settings.major_project_price,
        custom_project_price: settings.original_custom_price || settings.custom_project_price,
      });
      const fresh = await SettingsDB.get();
      setSettings(fresh);
      setMiniPrice(fresh.mini_project_price);
      setMajorPrice(fresh.major_project_price);
      setCustomPrice(fresh.custom_project_price);
      setSuccess('Offer ended. Original prices restored.');
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError('Failed to end offer.');
    }
  };

  const inputCls = 'w-full px-4 py-3 glass-input rounded-xl text-white text-sm placeholder-white/25 focus:outline-none';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const offerIsActive = settings.offer_active && settings.offer_end_time && new Date(settings.offer_end_time).getTime() > Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Tag className="w-5 h-5 text-gold" /> Offers & Festival Pricing</h2>
        <p className="text-sm text-white/30 mt-1">Set limited-time discounts that automatically roll back when the countdown ends.</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-500/[0.06] border border-green-500/[0.12] flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 shrink-0" /><p className="text-green-400 text-sm">{success}</p>
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Current offer status */}
      {offerIsActive && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 border border-gold/20 bg-gold/[0.03]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-base font-semibold text-white">🎉 {settings.offer_reason}</p>
            </div>
            <button onClick={deactivateOffer}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-500/20 text-red-400 rounded-xl text-xs font-medium transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> End Offer Now
            </button>
          </div>
          <p className="text-xs text-white/30 mb-4 text-center uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-gold" /> Offer ends in
          </p>
          <Countdown endTime={settings.offer_end_time!} onExpire={handleExpire} />
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Mini Project', orig: settings.original_mini_price, curr: settings.mini_project_price },
              { label: 'Major Project', orig: settings.original_major_price, curr: settings.major_project_price },
              { label: 'Custom Project', orig: settings.original_custom_price, curr: settings.custom_project_price },
            ].map(item => (
              <div key={item.label} className="glass rounded-xl p-3 text-center">
                <p className="text-[10px] text-white/25 uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-white/30 line-through mt-1">₹{item.orig}</p>
                <p className="text-lg font-bold text-crimson">₹{item.curr}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create / Update Offer */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <p className="text-base font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> {offerIsActive ? 'Update Active Offer' : 'Create New Offer'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/25 mb-1.5">Festival / Offer Reason</label>
            <input type="text" value={offerReason} onChange={e => setOfferReason(e.target.value)}
              placeholder="e.g. Diwali Special, New Year Offer" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-white/25 mb-1.5">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Offer End Date &amp; Time</span>
            </label>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Discounted Prices (Offer Prices)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Mini Project (₹)', val: miniPrice, set: setMiniPrice, orig: settings.mini_project_price },
              { label: 'Major Project (₹)', val: majorPrice, set: setMajorPrice, orig: settings.major_project_price },
              { label: 'Custom Project (₹)', val: customPrice, set: setCustomPrice, orig: settings.custom_project_price },
            ].map(item => (
              <div key={item.label}>
                <label className="block text-xs text-white/25 mb-1.5">{item.label}</label>
                <input type="number" value={item.val} onChange={e => item.set(e.target.value)} placeholder={item.orig} className={inputCls} />
                <p className="text-[10px] text-white/20 mt-1">Original: ₹{item.orig}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={activateOffer}
          className="w-full py-3 bg-gold hover:bg-gold-light text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> {offerIsActive ? 'Update Offer' : 'Activate Offer & Update Prices'}
        </button>
        <p className="text-[11px] text-white/20 text-center">
          When the countdown reaches zero, original prices are automatically restored — no action needed.
        </p>
      </div>
    </div>
  );
}
