import { subscriberModel } from '../models/subscriberModel.js';
import {
  getMailerStatus,
  sendNewsletterWelcome,
  sendEmail,
  verifyMailer,
} from '../config/mailer.js';
import { getNewsletterBroadcastTemplate } from '../views/emailTemplates.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const newsletterController = {
  async subscribe(req, res, next) {
    try {
      const { name, email } = req.body;
      const subscriber = await subscriberModel.create({ name, email });

      if (subscriber.alreadySubscribed) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to Syntellos AI Journal.',
          data: { name: subscriber.name, email: subscriber.email, is_active: true },
        });
      }

      logger.success(`New Newsletter Subscription: ${subscriber.email}`);

      sendNewsletterWelcome({
        email: subscriber.email,
        token: subscriber.unsubscribe_token,
      }).catch(err => logger.error('Error sending newsletter welcome email:', err.message));

      res.status(201).json({
        success: true,
        message: 'You are subscribed to Syntellos AI Journal.',
        data: {
          name: subscriber.name,
          email: subscriber.email,
          is_active: true,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async unsubscribe(req, res, next) {
    try {
      const { token, email } = req.query;

      if (!token && !email) {
        return res.status(400).json({
          success: false,
          message: 'Unsubscribe token or email is required.',
        });
      }

      const success = await subscriberModel.unsubscribe({ token, email });
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Subscriber record not found or already unsubscribed.',
        });
      }

      logger.info(`Unsubscribed: ${email || token}`);

      res.status(200).json({
        success: true,
        message: 'You have been successfully unsubscribed from Syntellos AI Journal.',
      });
    } catch (err) {
      next(err);
    }
  },

  async getSubscribers(req, res, next) {
    try {
      const { search, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await subscriberModel.findAll({
        search,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        data: {
          subscribers: result.subscribers,
          pagination: {
            total: result.total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(result.total / Number(limit)),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteSubscriber(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await subscriberModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Subscriber not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Subscriber removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async sendManualBroadcast(req, res, next) {
    try {
      const { subject, htmlContent, plainText } = req.body;

      if (!subject || (!htmlContent && !plainText)) {
        return res.status(400).json({
          success: false,
          message: 'Subject and email content are required for broadcast.',
        });
      }

      const mailStatus = getMailerStatus();
      if (!mailStatus.configured) {
        return res.status(503).json({
          success: false,
          message: 'SMTP is not configured. Add the SMTP environment variables before sending a newsletter.',
        });
      }

      const activeSubscribers = await subscriberModel.getAllActive();
      if (activeSubscribers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No active subscribers found to receive broadcast.',
        });
      }

      logger.info(`Admin initiated manual broadcast "${subject}" to ${activeSubscribers.length} subscribers.`);

      let sentCount = 0;
      let failCount = 0;
      const content = htmlContent || plainText;

      for (const sub of activeSubscribers) {
        const unsubscribeUrl = `${env.FRONTEND_URL}/newsletter/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token || '')}&email=${encodeURIComponent(sub.email)}`;
        const html = getNewsletterBroadcastTemplate({
          subject,
          content,
          unsubscribeUrl,
          contentIsHtml: Boolean(htmlContent),
        });

        const emailResult = await sendEmail({
          to: sub.email,
          subject,
          html,
          type: 'manual_broadcast',
        });

        if (emailResult.success) sentCount += 1;
        else failCount += 1;
      }

      res.status(200).json({
        success: true,
        message: `Newsletter finished. Sent: ${sentCount}, Failed: ${failCount}.`,
        data: {
          total: activeSubscribers.length,
          sent: sentCount,
          failed: failCount,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getSubscriberStats(req, res, next) {
    try {
      const stats = await subscriberModel.getStats();
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  },

  async getMailStatus(req, res) {
    res.status(200).json({
      success: true,
      data: getMailerStatus(),
    });
  },

  async verifyMailStatus(req, res) {
    const result = await verifyMailer();
    if (!result.ok) {
      return res.status(result.configured ? 502 : 503).json({
        success: false,
        message: result.message,
        data: result,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  },
};
