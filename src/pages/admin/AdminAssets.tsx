import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImageIcon, QrCode, Check, AlertCircle } from 'lucide-react';
import { AssetsDB } from '../../utils/storage';
import { compressImage } from '../../utils/image';

export default function AdminAssets() {
  const [logo, setLogo] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    AssetsDB.get('logo').then(l => { if (l) setLogo(l.data); });
    AssetsDB.get('payment_qr').then(q => { if (q) setQrCode(q.data); });
  }, []);

  const handleUpload = async (type: 'logo' | 'payment_qr', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 0.2); // Compress to ~200KB
        await AssetsDB.set(type, compressedDataUrl, file.type);
        type === 'logo' ? setLogo(compressedDataUrl) : setQrCode(compressedDataUrl);
        setSuccess(`${type === 'logo' ? 'Logo' : 'QR Code'} updated!`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error("Compression failed:", err);
        alert("Failed to process image.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Assets</h2>
        <p className="text-[13px] text-white/30">Upload logo and payment QR code.</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-green-500/[0.06] border border-green-500/[0.12] flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-[13px]">{success}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { type: 'logo' as const, title: 'Company Logo', desc: 'Displayed in navbar & footer', icon: <ImageIcon className="w-5 h-5 text-crimson" />, preview: logo, hint: 'Square PNG with transparent bg, min 200×200px' },
          { type: 'payment_qr' as const, title: 'Payment QR Code', desc: 'Displayed on payment page', icon: <QrCode className="w-5 h-5 text-gold" />, preview: qrCode, hint: 'UPI/GPay/PhonePe QR image' },
        ].map((item) => (
          <div key={item.type} className="rounded-2xl glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">{item.icon}</div>
              <div>
                <p className="text-[14px] font-medium text-white">{item.title}</p>
                <p className="text-[12px] text-white/25">{item.desc}</p>
              </div>
            </div>

            <div className={`rounded-xl ${item.type === 'payment_qr' ? 'bg-white' : 'bg-white/[0.03]'} border border-white/[0.06] p-4 flex items-center justify-center mb-4`} style={{ minHeight: '160px' }}>
              {item.preview ? (
                <img src={item.preview} alt={item.title} className="max-h-40 object-contain" />
              ) : (
                <div className="text-center">
                  {item.icon}
                  <p className="text-[12px] text-white/20 mt-2">Not uploaded</p>
                </div>
              )}
            </div>

            <label className="block cursor-pointer">
              <div className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/[0.1] rounded-xl hover:border-white/[0.2] hover:bg-white/[0.02] transition-all text-[13px] text-white/30">
                <Upload className="w-4 h-4" /> Upload new
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(item.type, e)} className="hidden" />
            </label>
            <p className="text-[11px] text-white/15 mt-2">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gold/[0.04] border border-gold/[0.08] p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-white/30">Assets are stored securely in your TiDB Cloud database and persist across all sessions.</p>
      </div>
    </div>
  );
}
