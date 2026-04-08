
// Mock SMS service
// In a real application, we would use Twilio, MSG91, or AWS SNS.

interface SMSOptions {
    to: string;
    message: string;
}

// Simple in-memory rate limiter for demo purposes
// In production, use Redis or database
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function sendSMS({ to, message }: SMSOptions) {
    if (!to) {
        console.warn("[SMS] No recipient number provided.");
        return false;
    }

    // Rate Limiting Check
    const lastSent = rateLimitMap.get(to);
    const now = Date.now();
    if (lastSent && now - lastSent < RATE_LIMIT_WINDOW) {
        console.warn(`[SMS] Rate limit exceeded for ${to}. Skipping message.`);
        return false;
    }

    // In a real app: await smsProvider.send(...)
    console.log(`
    [SMS SENT]
    ----------------------------------------------------
    To: ${to}
    Time: ${new Date().toISOString()}
    ----------------------------------------------------
    Message:
    ${message}
    ----------------------------------------------------
    `);

    // Update rate limit
    rateLimitMap.set(to, now);

    // Simulating success
    return true;
}

export async function sendOTP_SMS(mobile: string, otp: string) {
    const message = `Your GovProNet verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return await sendSMS({ to: mobile, message });
}

export async function sendEventReminderSMS(mobile: string, eventName: string, eventDate: string) {
    const message = `Reminder: You are registered for ${eventName} on ${eventDate}. We look forward to seeing you! - GovProNet`;
    return await sendSMS({ to: mobile, message });
}

export async function sendCriticalAlertSMS(mobile: string, alertMessage: string) {
    const message = `ALERT: ${alertMessage} - GovProNet`;
    return await sendSMS({ to: mobile, message });
}
