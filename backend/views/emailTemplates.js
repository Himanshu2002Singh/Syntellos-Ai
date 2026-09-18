import { env } from '../config/env.js';

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1F2937;
  background-color: #0B0F19;
  margin: 0;
  padding: 30px 15px;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #111827;
  border: 1px solid #1F2937;
  border-radius: 8px;
  overflow: hidden;
  color: #E5E7EB;
`;

const headerStyles = `
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  padding: 32px 30px;
  text-align: center;
  border-bottom: 2px solid #E2A33B;
`;

const bodyStyles = `
  padding: 32px 30px;
  font-size: 15px;
`;

const footerStyles = `
  background-color: #0B0F19;
  padding: 24px 30px;
  text-align: center;
  font-size: 12px;
  color: #9CA3AF;
  border-top: 1px solid #1F2937;
`;

const btnStyles = `
  display: inline-block;
  background-color: #E2A33B;
  color: #0F172A;
  font-weight: 700;
  text-decoration: none;
  padding: 13px 28px;
  border-radius: 4px;
  margin: 20px 0;
  font-size: 15px;
`;

export function getNewBlogTemplate({ blog, unsubscribeUrl }) {
  const blogUrl = `${env.FRONTEND_URL}/blogs/${blog.slug}`;
  const banner = blog.featured_image ? `<img src="${blog.featured_image}" alt="${blog.title}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin-bottom: 20px;" />` : '';

  return `
  <!DOCTYPE html>
  <html>
  <body style="${baseStyles}">
    <div style="${containerStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; font-weight: 800; letter-spacing: -0.5px;">
          SYNTELLOS <span style="color: #E2A33B;">AI</span>
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
          New Publication Alert
        </p>
      </div>
      <div style="${bodyStyles}">
        ${banner}
        <div style="display: inline-block; background-color: rgba(226, 163, 59, 0.15); color: #E2A33B; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 12px;">
          ${blog.category || 'AI Insights'}
        </div>
        <h2 style="margin: 0 0 16px; color: #FFFFFF; font-size: 20px; line-height: 1.3;">
          ${blog.title}
        </h2>
        <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 12px;">
          By ${blog.author || 'Syntellos Editorial'} • ${blog.read_time || '5 min read'}
        </p>
        <p style="color: #D1D5DB; margin-bottom: 24px; font-size: 15px; line-height: 1.6;">
          ${blog.excerpt || 'Read our latest article breaking down enterprise AI engineering, ecosystem partnerships, and deployment strategies.'}
        </p>
        <div style="text-align: center;">
          <a href="${blogUrl}" style="${btnStyles}">Read Full Article →</a>
        </div>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0 0 8px;">Syntellos AI — India GTM & Delivery Partner for AI Ecosystem Partners</p>
        <p style="margin: 0 0 12px; color: #6B7280;">Noida Extension, Gaur City 2, Greater Noida, UP, India</p>
        <p style="margin: 0;">
          You received this email because you subscribed to Syntellos AI updates. 
          ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color: #E2A33B; text-decoration: underline;">Unsubscribe</a>` : ''}
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function getLeadConfirmationTemplate({ lead }) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="${baseStyles}">
    <div style="${containerStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; font-weight: 800;">
          SYNTELLOS <span style="color: #E2A33B;">AI</span>
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
          Consultation Brief Received
        </p>
      </div>
      <div style="${bodyStyles}">
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Hello ${lead.name},</h2>
        <p style="color: #D1D5DB;">
          Thank you for reaching out to Syntellos AI. We have received your inquiry regarding <strong>${lead.intent}</strong>.
        </p>
        <div style="background-color: #1F2937; border-left: 4px solid #E2A33B; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 13px;"><strong>Organization:</strong> ${lead.organization || 'Not specified'}</p>
          <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 13px;"><strong>Intent:</strong> ${lead.intent}</p>
          <p style="margin: 0; color: #D1D5DB; font-size: 14px;"><strong>Your Brief:</strong> "${lead.message}"</p>
        </div>
        <p style="color: #D1D5DB;">
          Our India strategy and delivery team is reviewing your requirements alongside our global technology partners. A solutions advisor will connect with you within <strong>1–2 business days</strong>.
        </p>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 24px;">
          Need immediate assistance? You can also message us directly on WhatsApp at <a href="https://wa.me/919889505166" style="color: #E2A33B; text-decoration: none;">+91 98895 05166</a>.
        </p>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">© ${new Date().getFullYear()} Syntellos AI. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function getAdminLeadAlertTemplate({ lead }) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="${baseStyles}">
    <div style="${containerStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 22px; color: #FFFFFF;">
          🚨 New Lead Capture Alert
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #E2A33B; font-weight: 700;">
          ${lead.intent}
        </p>
      </div>
      <div style="${bodyStyles}">
        <h2 style="color: #FFFFFF; font-size: 17px; margin-top: 0;">Lead Details:</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #D1D5DB;">
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #9CA3AF;">Name:</td>
            <td style="padding: 10px 0; color: #FFFFFF;">${lead.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; color: #9CA3AF;">Email:</td>
            <td style="padding: 10px 0;"><a href="mailto:${lead.email}" style="color: #E2A33B;">${lead.email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; color: #9CA3AF;">Phone:</td>
            <td style="padding: 10px 0;">${lead.phone || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; color: #9CA3AF;">Organization:</td>
            <td style="padding: 10px 0;">${lead.organization || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; color: #9CA3AF;">City / Region:</td>
            <td style="padding: 10px 0;">${lead.city || 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1F2937;">
            <td style="padding: 10px 0; font-weight: bold; color: #9CA3AF;">User Intent:</td>
            <td style="padding: 10px 0; color: #E2A33B; font-weight: bold;">${lead.intent}</td>
          </tr>
        </table>
        <div style="margin-top: 20px;">
          <p style="color: #9CA3AF; font-weight: bold; margin-bottom: 6px;">Project Brief / Message:</p>
          <div style="background-color: #1F2937; padding: 14px; border-radius: 4px; color: #F3F4F6; white-space: pre-wrap; font-size: 14px;">
            ${lead.message}
          </div>
        </div>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0;">Syntellos AI Admin Notification Engine</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function getNewsletterWelcomeTemplate({ email, unsubscribeUrl }) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="${baseStyles}">
    <div style="${containerStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; font-weight: 800;">
          SYNTELLOS <span style="color: #E2A33B;">AI</span>
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
          Subscription Confirmed
        </p>
      </div>
      <div style="${bodyStyles}">
        <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">Welcome to Syntellos AI Journal,</h2>
        <p style="color: #D1D5DB;">
          You are now subscribed to receive actionable insights on GenAI, Robotics, Computer Vision, and Emerging Tech delivery for Indian enterprises and academic institutions.
        </p>
        <p style="color: #D1D5DB;">
          Whenever we publish practical playbooks, field notes, or OEM technology briefs, you'll be the first to know.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${env.FRONTEND_URL}/blogs" style="${btnStyles}">Explore Recent Insights →</a>
        </div>
      </div>
      <div style="${footerStyles}">
        <p style="margin: 0 0 8px;">Syntellos AI</p>
        <p style="margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #E2A33B; text-decoration: underline;">Unsubscribe</a> at any time.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
