import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { SettingsDB } from '../../utils/storage';
import { SiteSettings } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    mini_project_price: '1500', major_project_price: '4500', custom_project_price: '4500',
    research_paper_price: '3000', plagiarism_removal_price: '500',
    admin_password: '', security_question: '', security_answer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { SettingsDB.get().then(setSettings); }, []);

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
              <p className="text-lg font-bold text-white/80 tracking-wider">9515****36</p>
              <p className="text-xs text-white/20 mt-2">OTP will be sent to this number for password reset</p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-gold/[0.06] border border-gold/[0.1]">
              <p className="text-xs text-white/30">
                ⚠️ <span className="text-gold/70 font-medium">Production Note:</span> Connect SMS API (Twilio, MSG91, or Fast2SMS) in your Node.js backend to send real OTP messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
