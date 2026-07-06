import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Copy, Check, QrCode, Shield } from 'lucide-react';
import { PaymentsDB, AssetsDB, SettingsDB } from '../utils/storage';
import { compressImage } from '../utils/image';
import AppleLoader from '../components/AppleLoader';
import WhatsAppButton from '../components/WhatsAppButton';

import { ClickableImage } from '../components/ImageLightbox';
import { Spinner } from '../components/Spinner';
export default function PaymentPage() {

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState('/images/logo-placeholder.png');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({ student_name: '', college: '', phone: '', email: '', project_name: '', amount: '' });
  const [screenshot, setScreenshot] = useState<{ data: string; mime_type: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adminPhone, setAdminPhone] = useState('9515192936');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState('Coding Your Ideas');

  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => { 
    AssetsDB.get('payment_qr').then(qr => { 
      if (qr) setQrCode(qr.data); 
      setLoadingQr(false);
    }); 
    AssetsDB.get('logo').then(logo => {
      if (logo) setLogoSrc(logo.data);
    });
    SettingsDB.get().then(settings => {
      if (settings && settings.admin_phone) {
        setAdminPhone(settings.admin_phone);
      }
      if (settings && settings.company_tagline) {
        setTagline(settings.company_tagline);
      }
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 0.2); // Compress to ~200KB max
        setScreenshot({ data: compressedDataUrl, mime_type: file.type, name: file.name });
      } catch (err) {
        console.error("Compression failed:", err);
        alert("Failed to process image. Please try a smaller file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) { alert('Please upload payment screenshot'); return; }
    
    setSubmitting(true);
    try {
      // 600ms simulated buffer for satisfying visual loader confirmation
      await new Promise(resolve => setTimeout(resolve, 600));
      const response = await PaymentsDB.add({ 
        student_name: formData.student_name, 
        college: formData.college,
        phone: formData.phone, 
        email: formData.email, 
        project_name: formData.project_name, 
        amount: parseFloat(formData.amount), 
        screenshot_data: screenshot.data, 
        mime_type: screenshot.mime_type 
      });

      const cleanPhone = adminPhone.replace(/\D/g, '');
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const screenshotLink = `${window.location.origin}/api/payment-screenshot?id=${response.id}`;
      const messageText = `hello iam "${formData.student_name}" from ${formData.college} has done a payment of rupees ${formData.amount} and the link of the image of the screenshot he uploaded is ${screenshotLink}`;
      const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messageText)}`;
      
      setWhatsappUrl(url);
      setSubmitted(true);
      
      // Auto open whatsapp link
      window.open(url, '_blank');
      
      setFormData({ student_name: '', college: '', phone: '', email: '', project_name: '', amount: '' });
      setScreenshot(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit transaction confirmation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string, label: string) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 2000); };
  const inputCls = "w-full px-4 py-3 sm:py-3.5 glass-input rounded-xl text-white text-sm sm:text-base placeholder-white/25 focus:outline-none";
  const labelCls = "block text-[10px] sm:text-xs text-white/30 mb-1.5 uppercase tracking-wider font-medium";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-nav">
        <div className="container-responsive flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src={logoSrc}
              alt="Acadomix Logo"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: logoSrc, alt: 'Acadomix Logo' } }));
              }}
              className="h-11 w-11 sm:h-13 sm:w-13 rounded-2xl object-contain cursor-pointer active:scale-95 transition-transform shadow-lg shadow-crimson/20 border border-gold/30 hover:border-gold transition-colors"
            />
            <Link
              to="/"
              className="flex flex-col items-start active:scale-95 transition-transform"
            >
              <span className="text-xs sm:text-lg md:text-2xl font-black tracking-[0.1em] sm:tracking-[0.15em] text-gradient uppercase leading-none">
                ACADOMIX
              </span>
              <span className="text-[6px] sm:text-[9px] md:text-[10px] font-extrabold text-gradient tracking-[0.02em] sm:tracking-[0.05em] uppercase leading-none mt-0.5 sm:mt-1">
                {tagline}
              </span>
            </Link>
          </div>
          <Link to="/admin" className="p-2 text-white/30 hover:text-crimson transition-colors">
            <Shield className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="container-responsive py-10 sm:py-16 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
          <h1 className="text-section text-white mb-3">Secure <span className="text-gradient">Payment</span></h1>
          <p className="text-sm sm:text-base text-white/35">Pay via UPI and upload your screenshot for instant confirmation.</p>
        </motion.div>

        {/* Success */}
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-10 p-5 sm:p-6 rounded-2xl glass-card text-center border border-green-500/20">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-3" />
            <p className="text-base sm:text-lg font-semibold text-white">Payment Submitted! 🎉</p>
            <p className="text-sm text-white/40 mt-1 mb-4">Please make sure the pre-filled WhatsApp confirmation message is sent to speed up verification.</p>
            {whatsappUrl && (
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 w-full"
              >
                💬 Send WhatsApp Confirmation
              </a>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* QR & Payment Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            {/* QR Code */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center">
              <p className="text-base sm:text-lg font-semibold text-white mb-4">📱 Scan to Pay</p>
              
              <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-6" style={{ minHeight: '200px' }}>
                {loadingQr ? (
                  <AppleLoader />
                ) : qrCode ? (
                  <ClickableImage src={qrCode} alt="UPI QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-black/20 mx-auto mb-2" />
                    <p className="text-sm text-black/40">QR Code not available</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-white/20">GPay · PhonePe · Paytm · Any UPI App</p>
            </div>

            {/* Manual UPI */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              {[
                { label: 'UPI ID', value: '9515192936@ybl', key: 'upi' },
                { label: 'GPay / PhonePe Number', value: '9515192936', key: 'phone' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl">
                  <div>
                    <p className="text-[10px] sm:text-xs text-white/20 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm sm:text-base text-white/70 font-mono">{item.value}</p>
                  </div>
                  <button onClick={() => copyText(item.value, item.key)} className="p-2 sm:p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    {copied === item.key ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-white/25" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Notice */}
            <div className="rounded-xl bg-gold/10 border border-gold/20 p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-white/40">Take a screenshot after payment and upload it here. Your project starts after verification.</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-bold text-white mb-5 sm:mb-6">📤 Upload Payment Confirmation</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Full Name</label><input type="text" required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="John Doe" className={inputCls} /></div>
                  <div><label className={labelCls}>College Name</label><input type="text" required value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} placeholder="Vignan University" className={inputCls} /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Phone</label><input type="text" inputMode="numeric" pattern="[0-9]{10}" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="10-digit phone number" className={inputCls} /></div>
                  <div><label className={labelCls}>Email</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@email.com" className={inputCls} /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Project Name</label><input type="text" required value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} placeholder="Face Recognition" className={inputCls} /></div>
                  <div><label className={labelCls}>Amount Paid (₹)</label><input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="4500" className={inputCls} /></div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className={labelCls}>Payment Screenshot</label>
                  {screenshot ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <ClickableImage src={screenshot.data} alt="Payment Screenshot" className="w-full max-h-44 object-contain bg-white/5" />
                      <button type="button" onClick={() => setScreenshot(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/60 flex items-center justify-center text-xs hover:text-white">✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-8 sm:py-10 glass rounded-xl border-2 border-dashed border-white/10 hover:border-crimson/30 hover:bg-white/[0.02] transition-all cursor-pointer">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white/15 mb-2" />
                      <p className="text-sm text-white/25">Click to upload</p>
                      <p className="text-xs text-white/15 mt-1">PNG, JPG up to 5MB</p>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                <button type="submit" disabled={submitting} className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-crimson to-crimson-dark text-white text-sm sm:text-base font-semibold rounded-xl btn-glow shine flex items-center justify-center gap-2">
                  {submitting ? <Spinner size="sm" color="white" /> : <span><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline ml-1 mr-1" /> Submit Confirmation</span>}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-white/5 text-center">
                <p className="text-xs sm:text-sm text-white/20">Need help? <a href={`https://wa.me/918897492936?text=${encodeURIComponent("Hi! Acadomix, I'm interested in discussing a project collaboration with you.")}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">WhatsApp us</a></p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
}
