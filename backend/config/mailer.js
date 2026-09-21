import nodemailer from 'nodemailer';
import { env } from './env.js';
import { db } from './db.js';
import { logger } from '../utils/logger.js';
import {
  getNewBlogTemplate,
  getLeadConfirmationTemplate,
  getAdminLeadAlertTemplate,
  getNewsletterWelcomeTemplate,
} from '../views/emailTemplates.js';

let transporter = null;
let isConfigured = false;
let lastVerifiedAt = null;

export function initMailer() {
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_HOST) {
    transporter = null;
    isConfigured = false;
    lastVerifiedAt = null;
    logger.info('SMTP is not configured. Email delivery is disabled until SMTP credentials are provided.');
    return getMailerStatus();
  }

  try {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    isConfigured = true;
    logger.success(`SMTP transporter initialized for ${env.SMTP_HOST}:${env.SMTP_PORT}`);
  } catch (err) {
    transporter = null;
    isConfigured = false;
    logger.warn(`Failed to initialize SMTP transporter: ${err.message}`);
  }

  return getMailerStatus();
}

export function getMailerStatus() {
  return {
    configured: isConfigured,
    host: env.SMTP_HOST || '',
    port: env.SMTP_PORT || null,
    secure: Boolean(env.SMTP_SECURE),
    from: env.SMTP_FROM || '',
    lastVerifiedAt,
  };
}

export async function verifyMailer() {
  if (!isConfigured || !transporter) {
    return {
      ok: false,
      message: 'SMTP is not configured. Add the SMTP environment variables first.',
      ...getMailerStatus(),
    };
  }

  try {
    await transporter.verify();
    lastVerifiedAt = new Date().toISOString();
    logger.success(`SMTP connection verified for ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return {
      ok: true,
      message: 'SMTP connection verified successfully.',
      ...getMailerStatus(),
    };
  } catch (err) {
    logger.error(`SMTP verification failed: ${err.message}`);
    return {
      ok: false,
      message: `SMTP verification failed: ${err.message}`,
      ...getMailerStatus(),
    };
  }
}

async function logEmail({ type, recipient, subject, status, errorMessage }) {
  try {
    const sentAt = db.getDriver() === 'mysql' ? 'NOW()' : 'datetime("now")';
    await db.run(
      `INSERT INTO email_logs (type, recipient, subject, status, error_message, sent_at) VALUES (?, ?, ?, ?, ?, ${sentAt})`,
      [type, recipient, subject, status, errorMessage]
    );
  } catch (dbErr) {
    logger.debug('Could not log email to DB:', dbErr.message);
  }
}

export async function sendEmail({ to, subject, html, type = 'general', replyTo }) {
  if (!isConfigured || !transporter) {
    const errorMessage = 'SMTP is not configured.';
    logger.warn(`[Email Not Sent] [${type}] To: ${to} | ${errorMessage}`);
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'not_configured',
      errorMessage,
    });
    return { success: false, status: 'not_configured', errorMessage };
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    logger.success(`[Email Sent] [${type}] To: ${to} | Subject: "${subject}"`);
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'sent',
      errorMessage: null,
    });
    return { success: true, status: 'sent', errorMessage: null };
  } catch (err) {
    logger.error(`[Email Failed] [${type}] To: ${to} | Error: ${err.message}`);
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, status: 'failed', errorMessage: err.message };
  }
}

export async function broadcastNewBlog({ blog, subscribers = [] }) {
  if (!subscribers?.length) {
    logger.info(`No active subscribers to broadcast blog "${blog.title}".`);
    return { count: 0, sent: 0, failed: 0, status: 'no_subscribers' };
  }

  if (!isConfigured || !transporter) {
    logger.warn(`Blog broadcast skipped for "${blog.title}" because SMTP is not configured.`);
    return {
      count: subscribers.length,
      sent: 0,
      failed: subscribers.length,
      status: 'not_configured',
    };
  }

  logger.info(`Starting blog publication broadcast for "${blog.title}" to ${subscribers.length} subscriber(s)...`);
  let sentCount = 0;
  let failCount = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token || '')}&email=${encodeURIComponent(sub.email)}`;
    const html = getNewBlogTemplate({ blog, unsubscribeUrl });
    const result = await sendEmail({
      to: sub.email,
      subject: `New Blog Published: ${blog.title} — Syntellos AI`,
      html,
      type: 'blog_broadcast',
    });

    if (result.success) sentCount += 1;
    else failCount += 1;
  }

  logger.success(`Blog broadcast complete: ${sentCount} sent, ${failCount} failed.`);
  return {
    count: subscribers.length,
    sent: sentCount,
    failed: failCount,
    status: failCount ? (sentCount ? 'partial' : 'failed') : 'sent',
  };
}

export async function sendLeadConfirmation({ lead }) {
  const html = getLeadConfirmationTemplate({ lead });
  return sendEmail({
    to: lead.email,
    subject: `We've Received Your Brief: ${lead.intent} — Syntellos AI`,
    html,
    type: 'lead_confirmation',
  });
}

export async function sendAdminLeadAlert({ lead }) {
  const html = getAdminLeadAlertTemplate({ lead });
  return sendEmail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `[New Lead] ${lead.intent} from ${lead.name} (${lead.organization || 'Individual'})`,
    html,
    type: 'admin_lead_alert',
    replyTo: lead.email,
  });
}

export async function sendNewsletterWelcome({ email, token }) {
  const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token || '')}&email=${encodeURIComponent(email)}`;
  const html = getNewsletterWelcomeTemplate({ email, unsubscribeUrl });
  return sendEmail({
    to: email,
    subject: 'Welcome to Syntellos AI Journal — Updates & Emerging Tech Insights',
    html,
    type: 'newsletter_welcome',
  });
}
