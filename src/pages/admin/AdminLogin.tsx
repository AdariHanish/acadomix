import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Shield, Smartphone, KeyRound } from 'lucide-react';
import { AdminAuth, SettingsDB } from '../../utils/storage';

type Mode = 'login' | 'phone' | 'otp' | 'reset';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('login');

  // Always clear admin auth when login page mounts
  // This ensures back-button always asks for password
  useEffect(() => {
    AdminAuth.logout();
  }, []);

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // In production, use this with SMS API: const ADMIN_PHONE = '9515192936';
  const MASKED_PHONE = '9515****36';

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await AdminAuth.login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid password.');
      setPassword('');
    }
  };

  const handleSendOtp = () => {
    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setCountdown(60);
    setError('');
    setMode('otp');

    // In production: call SMS API (Twilio / MSG91 / Fast2SMS) here
    // Example: await fetch('/api/send-otp', { method: 'POST', body: JSON.stringify({ phone: ADMIN_PHONE, otp: code }) })
    // For demo, we show the OTP in console and as a toast
    console.log(`[Acadomix] OTP for password reset: ${code}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      setError('');
      setMode('reset');
    } else {
      setError('Invalid OTP. Please check and try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) { setError('Fill both fields'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 4) { setError('Minimum 4 characters'); return; }

    await SettingsDB.update({ admin_password: newPassword });
    setResetSuccess(true);
    setError('');
    setTimeout(() => {
      setMode('login');
      setResetSuccess(false);
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpSent(false);
    }, 3000);
  };

  const inputCls = "w-full px-4 py-3.5 glass-input rounded-xl text-white text-sm placeholder-white/25 focus:outline-none";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-crimson" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-white/30 mt-1">
              {mode === 'login' && 'Enter password to continue'}
              {mode === 'phone' && 'Verify your identity'}
              {mode === 'otp' && 'Enter OTP sent to your phone'}
              {mode === 'reset' && 'Set your new password'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {resetSuccess && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 text-sm font-semibold">Password reset successfully!</p>
                <p className="text-green-400/60 text-xs mt-1">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Demo Notice - shown when OTP is sent */}
          <AnimatePresence>
            {otpSent && mode === 'otp' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl bg-gold/10 border border-gold/20 text-center">
                <p className="text-gold text-xs font-medium mb-1">📱 OTP sent to {MASKED_PHONE}</p>
                <p className="text-white/60 text-lg font-mono font-bold tracking-[0.3em]">{generatedOtp}</p>
                <p className="text-white/20 text-[10px] mt-1">
                  ⚠️ Demo mode — In production, OTP is sent via SMS only
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ===== LOGIN ===== */}
            {mode === 'login' && !resetSuccess && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password" required className={`${inputCls} pl-11 pr-11`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" className="w-full py-3.5 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors btn-glow">
                  Login
                </button>
                <button type="button" onClick={() => { setMode('phone'); setError(''); }}
                  className="w-full py-2 text-sm text-white/30 hover:text-crimson transition-colors flex items-center justify-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Forgot Password?
                </button>
              </motion.form>
            )}

            {/* ===== PHONE VERIFY ===== */}
            {mode === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div className="p-4 rounded-xl glass text-center">
                  <Smartphone className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-sm text-white/60 mb-1">We'll send an OTP to your registered mobile</p>
                  <p className="text-lg font-bold text-white tracking-wider">{MASKED_PHONE}</p>
                </div>
                <button onClick={handleSendOtp}
                  className="w-full py-3.5 bg-gold hover:bg-gold-light text-black text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setMode('login'); setError(''); }}
                  className="w-full py-2 text-sm text-white/30 hover:text-white/50 transition-colors flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </motion.div>
            )}

            {/* ===== OTP ENTRY ===== */}
            {mode === 'otp' && !resetSuccess && (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/30 mb-1.5 uppercase tracking-wider">Enter 6-digit OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" maxLength={6} value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                      placeholder="• • • • • •" required
                      className={`${inputCls} pl-11 text-center text-xl tracking-[0.5em] font-mono`}
                      autoFocus />
                  </div>
                </div>

                <button type="submit" disabled={otp.length !== 6}
                  className="w-full py-3.5 bg-crimson hover:bg-crimson-light disabled:opacity-40 disabled:hover:bg-crimson text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  Verify OTP <ArrowRight className="w-4 h-4" />
                </button>

                {/* Resend */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-white/20">Resend OTP in <span className="text-crimson">{countdown}s</span></p>
                  ) : (
                    <button type="button" onClick={handleSendOtp} className="text-xs text-crimson hover:text-crimson-light transition-colors">
                      Resend OTP
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => { setMode('login'); setError(''); setOtp(''); setOtpSent(false); }}
                  className="w-full py-2 text-sm text-white/30 hover:text-white/50 transition-colors flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </motion.form>
            )}

            {/* ===== RESET PASSWORD ===== */}
            {mode === 'reset' && !resetSuccess && (
              <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-green-400 text-xs font-medium">OTP verified! Set new password.</p>
                </div>

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="New password" required className={inputCls} autoFocus />
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword}
                    onChange={e => { setConfirmNewPassword(e.target.value); setError(''); }}
                    placeholder="Confirm new password" required className={inputCls} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button type="submit" className="w-full py-3.5 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors btn-glow">
                  Reset Password
                </button>

                <button type="button" onClick={() => { setMode('login'); setError(''); setNewPassword(''); setConfirmNewPassword(''); setOtp(''); setOtpSent(false); }}
                  className="w-full py-2 text-sm text-white/30 hover:text-white/50 transition-colors flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {mode === 'login' && !resetSuccess && (
            <p className="text-center text-white/10 text-[11px] mt-4">Default password: 1234</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
