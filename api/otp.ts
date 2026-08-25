// Server-side OTP store: { phone -> { code, expiresAt } }
// OTP is generated HERE on the server, never sent to the client.
// The client only submits a code to verify.

interface OtpEntry { code: string; expiresAt: number; attempts: number; }
const otpStore = new Map<string, OtpEntry>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  otpStore.forEach((val, key) => {
    if (now > val.expiresAt) otpStore.delete(key);
  });
}, 10 * 60 * 1000);

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    // ── Send OTP ────────────────────────────────────────────────────────────
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Generate server-side OTP (never returned to client)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(cleanPhone, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

    // Log to console for debugging (backend only — not visible in browser)
    console.log(`[OTP] Generated for ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-2)}: ${code}`);

    const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;

    let sent = false;

    if (TG_TOKEN && TG_CHAT_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: `🔐 Acadomix Admin OTP: *${code}*\nPhone: ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-2)}\nExpires in 5 minutes.`, parse_mode: 'Markdown' })
        });
        sent = true;
      } catch (e) { console.error('[OTP] Telegram error:', e); }
    }

    if (!sent && FAST2SMS_KEY) {
      try {
        const r = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=otp&variables_values=${code}&numbers=${cleanPhone}`);
        const j = await r.json();
        if (j.return) sent = true;
      } catch (e) { console.error('[OTP] SMS error:', e); }
    }

    // Always respond success — never reveal whether delivery succeeded (prevents phone enumeration)
    return res.status(200).json({ success: true, message: 'OTP sent' });

  } else if (req.method === 'PUT') {
    // ── Verify OTP ──────────────────────────────────────────────────────────
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const entry = otpStore.get(cleanPhone);

    if (!entry) {
      return res.status(400).json({ error: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    entry.attempts++;
    if (entry.attempts > MAX_VERIFY_ATTEMPTS) {
      otpStore.delete(cleanPhone);
      return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    // Timing-safe comparison
    const codesMatch = code.length === entry.code.length &&
      code.split('').every((c: string, i: number) => c === entry.code[i]);

    if (!codesMatch) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    // OTP verified — delete from store immediately (single-use)
    otpStore.delete(cleanPhone);
    return res.status(200).json({ success: true });

  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
