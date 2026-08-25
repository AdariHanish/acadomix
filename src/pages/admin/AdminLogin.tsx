import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Shield, Smartphone, KeyRound } from 'lucide-react';
import { AdminAuth, SettingsDB } from '../../utils/storage';
import { Spinner } from '../../components/Spinner';

type Mode = 'login' | 'phone' | 'otp' | 'reset';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [submitting, setSubmitting] = useState(false);

  // Always clear admin auth when login page mounts
  // This ensures back-button always asks for password
  useEffect(() => {
    AdminAuth.logout();
  }, []);

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [adminPhone, setAdminPhone] = useState('9515192936');

  useEffect(() => {
    SettingsDB.get().then(settings => {
      if (settings?.admin_phone) setAdminPhone(settings.admin_phone);
    }).catch(() => {});
  }, []);

  const MASKED_PHONE = adminPhone.length >= 10
    ? `${adminPhone.slice(0, 4)}****${adminPhone.slice(-2)}`
    : adminPhone;

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Smooth 350ms delay for premium spinner feel
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (await AdminAuth.login(password)) {
      setSubmitting(false);
      navigate('/admin/dashboard');
    } else {
      setSubmitting(false);
      setError('Invalid password.');
      setPassword('');
    }
  };

  // Removed hardcoded ADMIN_PHONE in favor of database-fetched adminPhone state

  const handleSendOtp = async () => {
    setSubmitting(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone })
      });

      if (!response.ok) {
        const text = await response.text();
        setError(`Server error (${response.status}): ${text.slice(0, 80) || 'Check API gateway status.'}`);
        return;
      }

      setOtpSent(true);
      setCountdown(60);
      setMode('otp');
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Network error: Unable to reach the server. Check your internet connection.');
      } else {
        setError(`Error: ${err.message || 'Failed to send OTP.'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone, code: otp })
      });
      const result = await response.json();
      if (result.success) {
        setOtpVerified(true);
        setError('');
        setMode('reset');
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) { setError('Fill both fields'); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 4) { setError('Minimum 4 characters'); return; }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', password: newPassword })
      });
      
      if (!response.ok) throw new Error('Reset failed');
      
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
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

          {/* OTP Sent Confirmation */}
          <AnimatePresence>
            {otpSent && mode === 'otp' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-3 rounded-xl bg-gold/10 border border-gold/20 text-center">
                <p className="text-gold text-xs font-medium">📱 OTP sent to {MASKED_PHONE}</p>
                <p className="text-white/30 text-[10px] mt-1">
                  Check your phone for the 6-digit code
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
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors btn-glow flex items-center justify-center gap-2">
                  {submitting ? <Spinner size="sm" color="white" /> : 'Login'}
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
                <button onClick={handleSendOtp} disabled={submitting}
                  className="w-full py-3.5 bg-gold hover:bg-gold-light text-black text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submitting ? <Spinner size="sm" color="white" /> : <span>Send OTP <ArrowRight className="w-4 h-4 inline-block align-middle ml-1" /></span>}
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

                <button type="submit" disabled={otp.length !== 6 || submitting}
                  className="w-full py-3.5 bg-crimson hover:bg-crimson-light disabled:opacity-40 disabled:hover:bg-crimson text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {submitting ? <Spinner size="sm" color="white" /> : <span>Verify OTP <ArrowRight className="w-4 h-4 inline-block align-middle ml-1" /></span>}
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

                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-crimson hover:bg-crimson-light text-white text-sm font-semibold rounded-xl transition-colors btn-glow flex items-center justify-center gap-2">
                  {submitting ? <Spinner size="sm" color="white" /> : 'Reset Password'}
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
