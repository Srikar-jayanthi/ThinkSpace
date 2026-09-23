const nodemailer = require('nodemailer');

/* ─────────────────────────────────────────────────────────────
   Email Service — Nodemailer SMTP via Gmail App Password
   SMTP_USER = contact.srikar.jayanthi@gmail.com
   SMTP_PASS = Gmail App Password (16 chars)
───────────────────────────────────────────────────────────── */

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();

/* ── SMTP Transporter (Gmail) ── */
let _smtpTransporter;
function getSmtpTransporter() {
  if (_smtpTransporter) return _smtpTransporter;
  _smtpTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
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

/* ── Main sendMail ── */
async function sendMail({ to, subject, html }) {
  const FROM = process.env.SMTP_USER || 'noreply@thinkspace.app';

  // Send via Gmail SMTP if credentials are set
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
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
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ [SMTP] Failed:', err.message);
    }
  }

  // Console fallback (so registration never breaks even without email config)
  // eslint-disable-next-line no-console
  console.log('\n📧 ══════════════════════════════════════');
  // eslint-disable-next-line no-console
  console.log(`   ⚠️  No SMTP configured — logging to console`);
  // eslint-disable-next-line no-console
  console.log(`   To: ${to}`);
  // eslint-disable-next-line no-console
  console.log(`   Subject: ${subject}`);
  // eslint-disable-next-line no-console
  console.log(`   Body: ${html.replace(/<[^>]*>/g, '')}`);
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
        <p style="color: #333;">You requested a password reset for your ThinkSpace account. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c5cfc, #a855f7); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset My Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px;">Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #7c5cfc;">${resetUrl}</a>
        </p>
        <p style="color: #e74c3c; font-size: 13px; font-weight: 600;">⏰ This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #aaa; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
      </div>
    `,
  });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
