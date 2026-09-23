const nodemailer = require('nodemailer');

/* ─────────────────────────────────────────────────────────────
   Email Service — Dual-mode:
     1. Resend HTTP API  (production — works on Render free tier)
     2. Nodemailer SMTP  (local dev fallback)
───────────────────────────────────────────────────────────── */

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();
const VERIFIED_RESEND_EMAIL = 'contact.srikar.jayanthi@gmail.com';

/* ── Google Apps Script Gmail Relay (Sends to ANY recipient from your Gmail) ── */
async function sendViaGoogleScript({ to, subject, html }) {
  const url = process.env.GMAIL_SCRIPT_URL;
  if (!url) return null;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
    redirect: 'follow',
  });

  const data = await response.json();
  if (data?.error) throw new Error(data.error);
  // eslint-disable-next-line no-console
  console.log(`📧 [GMAIL-RELAY] Delivered directly to recipient: ${to}`);
  return { accepted: [to], provider: 'gmail-relay' };
}

/* ── Resend (HTTP API — works on all cloud hosts) ── */
async function sendViaResend({ to, subject, html }) {
  // If target is the verified Resend address, send directly.
  // In Resend sandbox, only the account owner email can receive messages.
  // If a different address is requested, send to the owner with an annotation so it succeeds.
  const recipient = to.toLowerCase() === VERIFIED_RESEND_EMAIL.toLowerCase() 
    ? to 
    : VERIFIED_RESEND_EMAIL;

  const modifiedSubject = to.toLowerCase() === VERIFIED_RESEND_EMAIL.toLowerCase()
    ? subject
    : `[For: ${to}] ${subject}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ThinkSpace <onboarding@resend.dev>',
      to: [recipient],
      subject: modifiedSubject,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || JSON.stringify(data));
  // eslint-disable-next-line no-console
  console.log(`📧 [RESEND] Email delivered to: ${recipient} (requested: ${to}) | ID: ${data.id}`);
  return { accepted: [recipient], provider: 'resend', id: data.id };
}

/* ── Nodemailer SMTP (local dev) ── */
let _smtpTransporter;
function getSmtpTransporter() {
  if (_smtpTransporter) return _smtpTransporter;
  _smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
  return _smtpTransporter;
}

async function sendViaSmtp({ to, subject, html }) {
  const FROM = process.env.SMTP_USER || 'noreply@thinkspace.app';
  const transporter = getSmtpTransporter();
  const info = await transporter.sendMail({
    from: `"ThinkSpace" <${FROM}>`,
    to,
    subject,
    html,
  });
  // eslint-disable-next-line no-console
  console.log(`📧 [SMTP] Email sent to: ${to} | ID: ${info.messageId}`);
  return info;
}

/* ── Main sendMail: Google Relay → Resend → SMTP → console fallback ── */
async function sendMail({ to, subject, html }) {
  // 1. Try Google Apps Script Relay first if configured (can send to ANY recipient in the world!)
  if (process.env.GMAIL_SCRIPT_URL) {
    try {
      const res = await sendViaGoogleScript({ to, subject, html });
      if (res) return res;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ [GMAIL-RELAY] Failed:', err.message, '— falling back to Resend');
    }
  }

  // 2. Try Resend (HTTP — works on Render free tier)
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend({ to, subject, html });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ [RESEND] Failed:', err.message, '— falling back to SMTP');
    }
  }

  // 3. Try SMTP (works locally with Gmail App Password)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      return await sendViaSmtp({ to, subject, html });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ [SMTP] Failed:', err.message, '— falling back to console log');
    }
  }

  // 4. Console fallback — registration never breaks even without email config
  // eslint-disable-next-line no-console
  console.log('\n📧 ══════════════════════════════════════');
  // eslint-disable-next-line no-console
  console.log(`   ⚠️  No email provider — logging to console`);
  // eslint-disable-next-line no-console
  console.log(`   To: ${to} | Subject: ${subject}`);
  // eslint-disable-next-line no-console
  console.log('══════════════════════════════════════\n');
  return { accepted: [to], fallback: true };
}

/* ── OTP Verification Email ── */
async function sendVerificationEmail(email, otp) {
  // eslint-disable-next-line no-console
  console.log(`\n📧 Sending OTP to: ${email} | OTP: ${otp}`);
  return sendMail({
    to: email,
    subject: 'ThinkSpace — Email Verification Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #7c5cfc; margin: 0;">🧠 ThinkSpace</h2>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Sharpen Your Mind. Communicate with Impact.</p>
        </div>
        <p style="color: #333;">Welcome to ThinkSpace! Use the verification code below to activate your account.</p>
        <div style="background: #f4f0ff; border: 2px dashed #7c5cfc; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #666; font-size: 13px;">Your verification code</p>
          <span style="font-size: 36px; font-weight: bold; color: #7c5cfc; letter-spacing: 6px;">${otp}</span>
        </div>
        <p style="color: #555; font-size: 14px;">Enter this 6-digit code on the verification page to complete your registration.</p>
        <p style="color: #e74c3c; font-size: 13px; font-weight: 600;">⏰ This code expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #aaa; font-size: 12px;">If you didn't create a ThinkSpace account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

/* ── Password Reset Email ── */
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  return sendMail({
    to: email,
    subject: 'ThinkSpace — Reset Your Password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #7c5cfc; margin: 0;">🧠 ThinkSpace</h2>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Sharpen Your Mind. Communicate with Impact.</p>
        </div>
        <p style="color: #333;">You requested a password reset for your ThinkSpace account (requested for: <strong>${email}</strong>). Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c5cfc, #a855f7); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset My Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px;">Or copy and paste this link:<br>
          <a href="${resetUrl}" style="color: #7c5cfc;">${resetUrl}</a>
        </p>
        <p style="color: #e74c3c; font-size: 13px; font-weight: 600;">⏰ This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #aaa; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
