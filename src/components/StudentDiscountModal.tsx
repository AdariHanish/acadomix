import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, GraduationCap } from 'lucide-react';
import { compressImage } from '../utils/image';
import { AssetsDB } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDiscountModal({ isOpen, onClose }: Props) {
  const [idCard, setIdCard] = useState<string | null>(null);
  const [idCardName, setIdCardName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 0.45); // Compress to ~400KB max for faster database save
    setIdCard(compressed);
    setIdCardName(file.name);
  };

  const handleClaim = async () => {
    if (!studentName.trim()) {
      alert('Please enter your name first!');
      return;
    }
    if (!idCard) {
      alert('Please upload your college ID card first!');
      return;
    }
    setSending(true);

    try {
      // 1. Generate a unique asset name for this student's ID card (including their name)
      const sanitizedName = studentName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const uniqueAssetName = `studentid_${sanitizedName}_${Date.now()}`;
      
      // 2. Parse the MIME type
      const mimeMatch = idCard.match(/^data:(image\/[a-zA-Z+.-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      
      // 3. Upload the asset to database (no local download)
      await AssetsDB.set(uniqueAssetName, idCard, mimeType);
      
      // 4. Generate the direct hosted link for the admin to view
      const publicUrl = `${window.location.origin}/api/assets?asset_name=${uniqueAssetName}&raw=true`;

      // 5. Build WhatsApp message with EXACT user-requested text
      const msg = encodeURIComponent(
        `Hi Acadomix! I want to claim the 10% Student Discount. I am sending my college ID card for verification below. Please apply the discount on my next project!\n\n` +
        `👤 Name: ${studentName}\n` +
        `📎 College ID Card: ${publicUrl}`
      );
      
      const waUrl = `https://wa.me/918897492636?text=${msg}`;
      
      // Open WhatsApp — no file downloads, just the hosted link
      window.open(waUrl, '_blank');
      
      setSending(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to upload/link discount ID:', err);
      alert('Failed to connect to gateway. Please check your network and try again.');
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-md glass-card rounded-[32px] p-7 border border-gold/20 shadow-[0_0_80px_rgba(212,168,83,0.1)] relative overflow-hidden"
          >
            {/* BG glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />

            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
                <GraduationCap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Claim 10% OFF 🎓</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Upload your college ID card and we'll apply the<br/>
                <span className="text-gold font-semibold">exclusive student discount</span> on your project.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              {/* Name Input */}
              <label className="block">
                <span className="block text-xs text-white/30 uppercase tracking-wider mb-2 font-medium">Full Name</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                />
              </label>

              {/* ID Card Upload */}
              <label className="block">
                <span className="block text-xs text-white/30 uppercase tracking-wider mb-2 font-medium">Upload College ID Card</span>
                {idCard ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gold/30 bg-black/30">
                    <img src={idCard} alt="ID Card" className="w-full max-h-48 object-contain" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 py-2 px-3">
                      <p className="text-xs text-white/60 truncate">{idCardName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIdCard(null); setIdCardName(''); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/60 flex items-center justify-center text-xs hover:text-white hover:bg-crimson/80 transition-all"
                    >✕</button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-white/10 hover:border-gold/40 rounded-2xl p-6 text-center transition-colors cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <Upload className="w-8 h-8 text-white/20 group-hover:text-gold/50 mx-auto mb-2 transition-colors" />
                    <p className="text-sm text-white/30 group-hover:text-white/50 transition-colors">Click to upload or drag & drop</p>
                    <p className="text-xs text-white/15 mt-1">JPG, PNG, WEBP supported</p>
                  </div>
                )}
              </label>

              <div className="p-3 rounded-xl bg-gold/5 border border-gold/10 text-xs text-gold/60 flex gap-2">
                <span>🎓</span>
                <span>Clicking "Claim Discount" uploads your ID card securely and opens WhatsApp with a pre-filled hosted verification link. No downloads required!</span>
              </div>

              <button
                onClick={handleClaim}
                disabled={sending || !idCard}
                className="w-full py-3.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98] transition-all"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Opening WhatsApp...' : 'Claim Discount on WhatsApp'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
