// Removed unused pool import to make handler dependency-free and prevent database connection boot crashes.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  try {
    // 1. Log the OTP to console (for debugging)
    console.log(`[OTP] Sending ${otp} to ${phone}`);

    // 2. Option A: Fast2SMS (Indian SMS Gateway - Has a free daily limit)
    const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY;

    // 3. Option B: Telegram Bot (100% FREE and Instant)
    // To use this: 
    // 1. Message @BotFather on Telegram to create a bot and get a TOKEN.
    // 2. Message @userinfobot to get your CHAT_ID.
    // 3. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to Vercel.
    const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    let sentTelegram = false;
    let sentSMS = false;

    // 1. Send to Telegram
    if (TG_TOKEN && TG_CHAT_ID) {
      try {
        const tgMsg = `🔐 Acadomix OTP: ${otp}\nFor phone: ${phone}`;
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text: tgMsg })
        });
        sentTelegram = true;
      } catch (e) {
        console.error('Telegram fail:', e);
      }
    }

    // 2. Send to Fast2SMS
    if (FAST2SMS_KEY) {
      try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=otp&variables_values=${otp}&numbers=${phone.replace(/\D/g, '')}`);
        const result = await response.json();
        if (result.return) sentSMS = true;
      } catch (e) {
        console.error('SMS fail:', e);
      }
    }

    if (sentTelegram || sentSMS) {
      return res.status(200).json({ 
        success: true, 
        message: `OTP sent via ${[sentTelegram && 'Telegram', sentSMS && 'SMS'].filter(Boolean).join(' and ')}` 
      });
    }

    // Fallback if no keys are set
    return res.status(200).json({ 
      success: true, 
      message: 'OTP generated (Dev Mode)', 
      notice: 'Check logs or add API keys to Vercel.' 
    });

  } catch (error: any) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}
