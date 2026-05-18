import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { LeadsDB } from '../utils/storage';
import StudentDiscountModal from './StudentDiscountModal';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', college: '', branch: '', project_domain: '', budget: '', deadline: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (e.target.name === 'phone') {
      val = val.replace(/\D/g, '').slice(0, 10);
    }
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LeadsDB.add(formData as any);
    setSubmitted(true);
    setFormData({ name: '', college: '', branch: '', project_domain: '', budget: '', deadline: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputCls = "w-full px-3 sm:px-4 py-3 glass-input rounded-xl text-white text-xs sm:text-sm placeholder-white/25 focus:outline-none";
  const labelCls = "block text-[9px] sm:text-[11px] text-gold/40 mb-1 sm:mb-1.5 uppercase tracking-wider font-medium";

  return (
    <section id="contact" className="relative py-20 sm:py-28 lg:py-32 bg-surface-1 section-glow overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="container-responsive relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-gold font-semibold mb-4 uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-section text-white mb-4">Let's <span className="text-gradient">build together.</span></h2>
          <p className="text-xs sm:text-sm text-white/30 max-w-lg mx-auto">Reach out online or visit us offline — we're always ready to help.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.6 }}
            className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-sm sm:text-lg font-bold text-white mb-4 sm:mb-5">📩 Send Your Requirements</h3>
              {submitted && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-xs sm:text-sm">Thank you! We'll get back within 24 hours.</p>
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className={inputCls} /></div>
                  <div><label className={labelCls}>Phone / WhatsApp</label><input type="text" inputMode="numeric" pattern="[0-9]{10}" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit number" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}>College</label><input type="text" name="college" value={formData.college} onChange={handleChange} required placeholder="Your College" className={inputCls} /></div>
                  <div><label className={labelCls}>Branch</label><input type="text" name="branch" value={formData.branch} onChange={handleChange} required placeholder="CSE, IT, ECE..." className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div><label className={labelCls}>Project Type</label>
                    <select name="project_domain" value={formData.project_domain} onChange={handleChange} required className={`${inputCls} [&>option]:bg-surface-2`}>
                      <option value="">Select</option><option>Mini Project</option><option>Major Project</option><option>Website</option><option>Research Paper</option><option>Assignment</option><option>IoT Project</option><option>Custom</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Budget</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} required className={`${inputCls} [&>option]:bg-surface-2`}>
                      <option value="">Select</option><option>₹1,500 – ₹3,000</option><option>₹3,000 – ₹5,000</option><option>₹5,000 – ₹10,000</option><option>₹10,000+</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Deadline</label><input type="text" name="deadline" value={formData.deadline} onChange={handleChange} required placeholder="e.g. 2 weeks" className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Project Details</label><textarea name="message" value={formData.message} onChange={handleChange} rows={3} required placeholder="Describe your project..." className={`${inputCls} resize-none`} /></div>
                <button type="submit" className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-crimson via-crimson-dark to-gold-dark text-white text-xs sm:text-sm font-semibold rounded-xl btn-glow shine flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
                  <Send className="w-4 h-4" /> Submit Request
                </button>
              </form>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="glass-card rounded-2xl p-4 sm:p-5">
              <h3 className="text-xs sm:text-base font-bold text-white mb-3 sm:mb-4">📍 Contact Information</h3>
              <div className="space-y-3">
                {[
                  { icon: <Phone className="w-4 h-4" />, label: 'Call / WhatsApp', value: '+91 88974 92936', href: 'tel:+918897492936', color: 'group-hover:text-gold' },
                  { icon: <Mail className="w-4 h-4" />, label: 'Email', value: 'acadomix@gmail.com', href: `mailto:acadomix@gmail.com?subject=${encodeURIComponent('Project Collaboration')}&body=${encodeURIComponent("Hi! Acadomix, I'm interested in discussing a project collaboration with you.")}`, color: 'group-hover:text-crimson' },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Office', value: '65-5-259, VUDA Colony, Vizag - 530011', href: 'https://maps.google.com/?q=VUDA+Colony+Visakhapatnam', color: 'group-hover:text-gold' },
                  { icon: <Clock className="w-4 h-4" />, label: 'Hours', value: 'Mon - Sat: 9 AM - 9 PM', href: '#', color: 'group-hover:text-crimson' },
                ].map((c, i) => (
                  <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-start gap-2.5 sm:gap-3 group active:bg-white/5 rounded-lg p-1 -m-1 transition-colors">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg glass flex items-center justify-center text-white/40 flex-shrink-0 ${c.color} transition-colors`}>{c.icon}</div>
                    <div>
                      <p className="text-[9px] sm:text-[11px] text-white/20 uppercase tracking-wider">{c.label}</p>
                      <p className="text-[11px] sm:text-sm text-white/60 group-hover:text-white transition-colors">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <a href={`https://wa.me/918897492936?text=${encodeURIComponent('Hi! Acadomix, I’m interested in discussing a project collaboration with you.')}`} target="_blank" rel="noopener noreferrer"
              className="glass-card rounded-2xl p-4 sm:p-5 text-center block group hover:ring-1 hover:ring-green-500/30 active:bg-white/5 transition-all">
              <MessageCircle className="w-7 h-7 sm:w-9 sm:h-9 text-green-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-green-400 text-xs sm:text-sm font-semibold">WhatsApp Us Now</p>
              <p className="text-green-400/40 text-[10px] sm:text-xs mt-0.5">Instant response guaranteed</p>
            </a>

            <button
              onClick={() => setShowDiscount(true)}
              className="glass-card rounded-2xl p-4 sm:p-5 text-center animate-border-glow border-gold/20 w-full group hover:border-gold/50 transition-all active:scale-[0.98]"
            >
              <p className="text-xl sm:text-2xl mb-1">🎓</p>
              <p className="text-gold text-xs sm:text-sm font-semibold">Student Discount</p>
              <p className="text-white/30 text-[10px] sm:text-xs mt-1">Show college ID → Get <span className="text-gradient font-bold">10% OFF</span></p>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-crimson mt-2 group-hover:text-gold transition-colors">
                Claim Now <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            <StudentDiscountModal isOpen={showDiscount} onClose={() => setShowDiscount(false)} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
