import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { SettingsDB, AssetsDB } from '../../utils/storage';
import { SiteSettings } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    mini_project_price: '1500', major_project_price: '4500', custom_project_price: '4500',
    research_paper_price: '3000', plagiarism_removal_price: '500',
    admin_password: '', security_question: '', security_answer: '',
    company_tagline: 'Coding Your Ideas',
    office_location_text: '65-5-259, VUDA Colony, Vizag - 530011',
    office_location_link: 'https://maps.google.com/?q=VUDA+Colony+Visakhapatnam',
    admin_phone: '9515192936',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<Record<string, string>>({});

  useEffect(() => { 
    SettingsDB.get().then(setSettings); 
    ['logo', 'hero_bg', 'payment_qr'].forEach(key => {
      AssetsDB.get(key).then(a => { if (a) setAssetData(prev => ({...prev, [key]: a.data})) });
    });
  }, []);

  const savePricing = async () => {
    await SettingsDB.update({
      mini_project_price: settings.mini_project_price,
      major_project_price: settings.major_project_price,
      custom_project_price: settings.custom_project_price,
      research_paper_price: settings.research_paper_price,
      plagiarism_removal_price: settings.plagiarism_removal_price,
    });
    setSuccess('Pricing updated!'); setTimeout(() => setSuccess(null), 3000);
  };

  const saveCompanyInfo = async () => {
    await SettingsDB.update({
      company_tagline: settings.company_tagline,
      office_location_text: settings.office_location_text,
      office_location_link: settings.office_location_link,
    });
    setSuccess('Company details updated!'); setTimeout(() => setSuccess(null), 3000);
  };

  const saveRecoveryPhone = async () => {
    if (!settings.admin_phone || settings.admin_phone.length < 10) {
      setError('Recovery mobile must be exactly 10 digits');
      return;
    }
    await SettingsDB.update({ admin_phone: settings.admin_phone });
    setSuccess('Recovery mobile updated!'); setError(null); setTimeout(() => setSuccess(null), 3000);
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Fill both fields'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords don\'t match'); return; }
    if (newPassword.length < 4) { setError('Min 4 characters'); return; }
    await SettingsDB.update({ admin_password: newPassword });
    setSuccess('Password changed!'); setNewPassword(''); setConfirmPassword(''); setError(null);
    const updated = await SettingsDB.get();
    setSettings(updated);
    setTimeout(() => setSuccess(null), 3000);
  };

  const inputCls = "w-full px-4 py-3 glass-input rounded-xl text-white text-sm placeholder-white/25 focus:outline-none";

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-white">Settings</h2><p className="text-sm text-white/30">Configure pricing, credentials, and security.</p></div>

      {success && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-green-500/[0.06] border border-green-500/[0.12] flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /><p className="text-green-400 text-sm">{success}</p></motion.div>}
      {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /><p className="text-red-400 text-sm">{error}</p></motion.div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Base Pricing & Company Details */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-base font-semibold text-white mb-5">💰 Base Pricing</p>
            <div className="space-y-3">
              {[
                { key: 'mini_project_price', label: 'Mini Project (₹)' },
                { key: 'major_project_price', label: 'Major Project (₹)' },
                { key: 'custom_project_price', label: 'Custom Project (₹)' },
                { key: 'research_paper_price', label: 'Research Paper (₹)' },
                { key: 'plagiarism_removal_price', label: 'Plagiarism Removal (₹)' },
              ].map(item => (
                <div key={item.key}>
                  <label className="block text-xs text-white/25 mb-1">{item.label}</label>
                  <input type="number" value={(settings as any)[item.key]} onChange={e => setSettings({ ...settings, [item.key]: e.target.value })} className={inputCls} />
                </div>
              ))}
              <button onClick={savePricing} className="w-full py-3 bg-gold hover:bg-gold-light text-black text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                <Save className="w-4 h-4" /> Save Pricing
              </button>
            </div>
          </div>

          {/* Company Details */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-base font-semibold text-white mb-5">🏢 Company Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/25 mb-1">Company Tagline</label>
                <input type="text" value={settings.company_tagline || ''} onChange={e => setSettings({ ...settings, company_tagline: e.target.value })} placeholder="e.g. Coding Your Ideas" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/25 mb-1">Office Location Text</label>
                <textarea value={settings.office_location_text || ''} onChange={e => setSettings({ ...settings, office_location_text: e.target.value })} placeholder="e.g. VUDA Colony, Vizag - 530011" className={`${inputCls} h-20 resize-none`} />
              </div>
              <div>
                <label className="block text-xs text-white/25 mb-1">Google Maps Redirect Link</label>
                <input type="text" value={settings.office_location_link || ''} onChange={e => setSettings({ ...settings, office_location_link: e.target.value })} placeholder="https://maps.google.com/..." className={inputCls} />
              </div>
              <button onClick={saveCompanyInfo} className="w-full py-3 bg-gold hover:bg-gold-light text-black text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
                <Save className="w-4 h-4" /> Save Company Details
              </button>
            </div>
          </div>
        </div>

        {/* Password + Security */}
        <div className="space-y-5">
          {/* Password */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-base font-semibold text-white mb-5">🔒 Admin Password</p>
            <div className="space-y-3">
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className={inputCls} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className={inputCls} />
              <button onClick={changePassword} className="w-full py-3 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
            <div className="mt-3 p-3 rounded-lg glass">
              <p className="text-xs text-white/25">Current: <code className="text-crimson/70">{settings.admin_password}</code></p>
            </div>
          </div>

          {/* Password Recovery Info */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-base font-semibold text-white mb-2">📱 Password Recovery</p>
            <p className="text-xs text-white/25 mb-4">Forgot password uses SMS OTP verification</p>
            
            <div className="p-4 rounded-xl glass text-center">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Registered Mobile</p>
              <p className="text-lg font-bold text-white/80 tracking-wider">
                {settings?.admin_phone && settings.admin_phone.length >= 10
                  ? `${settings.admin_phone.slice(0, 4)}****${settings.admin_phone.slice(-2)}`
                  : settings?.admin_phone || '9515****36'}
              </p>
              <p className="text-xs text-white/20 mt-2">OTP will be sent to this number for password reset</p>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs text-white/25 mb-1">Update Recovery Mobile</label>
                <input 
                  type="text" 
                  value={settings.admin_phone || ''} 
                  onChange={e => setSettings({ ...settings, admin_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                  placeholder="e.g. 9515192936" 
                  className={inputCls} 
                />
              </div>
              <button onClick={saveRecoveryPhone} className="w-full py-3 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Recovery Mobile
              </button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-gold/[0.06] border border-gold/[0.1]">
              <p className="text-xs text-white/30">
                ⚠️ <span className="text-gold/70 font-medium">Production Note:</span> Connect SMS API (Twilio, MSG91, or Fast2SMS) in your Node.js backend to send real OTP messages.
              </p>
            </div>
          </div>
        </div>
        {/* Global Assets */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <p className="text-base font-semibold text-white mb-5">🖼️ Global Assets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'logo', label: 'Website Logo', desc: 'Appears in navbar and footer. Best size: 200x50px' },
              { key: 'hero_bg', label: 'Hero Background', desc: 'Main landing page background image. Best size: 1920x1080px' },
              { key: 'payment_qr', label: 'Payment QR Code', desc: 'Shown on the payment page for UPI.' },
            ].map((asset) => (
              <div key={asset.key} className="p-4 rounded-xl glass border border-white/5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-white">{asset.label}</p>
                  <p className="text-xs text-white/20">{asset.desc}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {uploading === asset.key ? (
                      <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <img 
                        src={assetData[asset.key] || 'https://via.placeholder.com/150?text=No+Asset'} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Asset')}
                      />
                    )}
                  </div>
                  <label className="flex-1">
                    <div className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white text-center cursor-pointer transition-colors">
                      {uploading === asset.key ? 'Uploading...' : 'Select High Quality Image'}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={!!uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(asset.key);
                        
                        // 🚀 Lightning Fast Compression Logic
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            
                            // Max dimensions for speed and quality
                            const MAX_DIM = asset.key === 'hero_bg' ? 1920 : 800;
                            if (width > MAX_DIM || height > MAX_DIM) {
                              if (width > height) {
                                height = (MAX_DIM / width) * height;
                                width = MAX_DIM;
                              } else {
                                width = (MAX_DIM / height) * width;
                                height = MAX_DIM;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            // WebP at 0.8 quality is the gold standard for web
                            const compressedData = canvas.toDataURL('image/webp', 0.8);
                            
                            // Upload to server
                            fetch('/api/assets', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                asset_name: asset.key,
                                data: compressedData,
                                mime_type: 'image/webp'
                              })
                            })
                            .then(res => res.json())
                            .then((data) => {
                              if (data.success) {
                                setAssetData(prev => ({ ...prev, [asset.key]: compressedData }));
                                setSuccess(`${asset.label} uploaded!`);
                              } else {
                                setError('Upload failed. Try a smaller image.');
                              }
                            })
                            .catch(() => setError('Connection error'))
                            .finally(() => {
                              setUploading(null);
                              setTimeout(() => setSuccess(null), 3000);
                            });
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }} 
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
