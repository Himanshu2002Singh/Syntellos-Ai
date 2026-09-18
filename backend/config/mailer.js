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

export function initMailer() {
  if (env.SMTP_USER && env.SMTP_PASS) {
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
      logger.success(`SMTP Transporter initialized for ${env.SMTP_HOST}:${env.SMTP_PORT} (${env.SMTP_USER})`);
    } catch (err) {
      logger.warn(`Failed to initialize SMTP transporter: ${err.message}. Running in simulated log mode.`);
      isConfigured = false;
    }
  } else {
    logger.info('SMTP credentials not provided in .env. Running email service in simulated delivery mode (all dispatches logged to DB & console).');
    isConfigured = false;
  }
}

export async function sendEmail({ to, subject, html, type = 'general' }) {
  let status = 'sent';
  let errorMessage = null;

  try {
    if (isConfigured && transporter) {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      logger.success(`[Email Sent] [${type}] To: ${to} | Subject: "${subject}"`);
    } else {
      logger.info(`[Email Simulated] [${type}] To: ${to} | Subject: "${subject}"`);
    }
  } catch (err) {
    status = 'failed';
    errorMessage = err.message;
    logger.error(`[Email Failed] [${type}] To: ${to} | Error: ${err.message}`);
  }

  // Log to database
  try {
    await db.run(
      'INSERT INTO email_logs (type, recipient, subject, status, error_message, sent_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      [type, to, subject, status, errorMessage]
    );
  } catch (dbErr) {
    try {
      await db.run(
        'INSERT INTO email_logs (type, recipient, subject, status, error_message, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [type, to, subject, status, errorMessage]
      );
    } catch (innerErr) {
      logger.debug('Could not log email to DB:', innerErr.message);
    }
  }

  return { success: status === 'sent', status, errorMessage };
}

// 1. Broadcast alert when new blog is published
export async function broadcastNewBlog({ blog, subscribers = [] }) {
  if (!subscribers || subscribers.length === 0) {
    logger.info(`No active subscribers to broadcast blog "${blog.title}".`);
    return { count: 0, sent: 0, failed: 0 };
  }

  logger.info(`Starting blog publication broadcast for "${blog.title}" to ${subscribers.length} subscriber(s)...`);
  let sentCount = 0;
  let failCount = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${sub.unsubscribe_token || ''}&email=${encodeURIComponent(sub.email)}`;
    const html = getNewBlogTemplate({ blog, unsubscribeUrl });
    const res = await sendEmail({
      to: sub.email,
      subject: `New Blog Published: ${blog.title} — Syntellos AI`,
      html,
      type: 'blog_broadcast',
    });

    if (res.success) sentCount++;
    else failCount++;
  }

  logger.success(`Blog broadcast complete: ${sentCount} sent, ${failCount} failed.`);
  return { count: subscribers.length, sent: sentCount, failed: failCount };
}

// 2. Consultation inquiry acknowledgement to lead
export async function sendLeadConfirmation({ lead }) {
  const html = getLeadConfirmationTemplate({ lead });
  return sendEmail({
    to: lead.email,
    subject: `We've Received Your Brief: ${lead.intent} — Syntellos AI`,
    html,
    type: 'lead_confirmation',
  });
}

// 3. Admin alert for new lead
export async function sendAdminLeadAlert({ lead }) {
  const html = getAdminLeadAlertTemplate({ lead });
  return sendEmail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `🚨 [New Lead] ${lead.intent} from ${lead.name} (${lead.organization || 'Individual'})`,
    html,
    type: 'admin_lead_alert',
  });
}

// 4. Welcome email to newsletter subscriber
export async function sendNewsletterWelcome({ email, token }) {
  const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${token}&email=${encodeURIComponent(email)}`;
  const html = getNewsletterWelcomeTemplate({ email, unsubscribeUrl });
  return sendEmail({
    to: email,
    subject: 'Welcome to Syntellos AI Journal — Updates & Emerging Tech Insights',
    html,
    type: 'newsletter_welcome',
  });
}
