import { Parser } from 'json2csv';
import { leadModel } from '../models/leadModel.js';
import { sendLeadConfirmation, sendAdminLeadAlert } from '../config/mailer.js';
import { logger } from '../utils/logger.js';

export const leadController = {
  async submitLead(req, res, next) {
    try {
      const { name, email, phone, organization, city, intent, message } = req.body;

      const lead = await leadModel.create({
        name,
        email,
        phone,
        organization,
        city,
        intent,
        message,
      });

      logger.success(`New Lead created: #${lead.id} [${lead.intent}] from ${lead.name} (${lead.email})`);

      // Asynchronous email triggers
      Promise.all([
        sendLeadConfirmation({ lead }).catch(err => logger.error('Error sending lead confirmation email:', err.message)),
        sendAdminLeadAlert({ lead }).catch(err => logger.error('Error sending admin alert email:', err.message)),
      ]);

      res.status(201).json({
        success: true,
        message: 'Your brief has been submitted successfully. A solutions advisor will get in touch with you shortly.',
        data: {
          id: lead.id,
          name: lead.name,
          intent: lead.intent,
          created_at: lead.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getLeads(req, res, next) {
    try {
      const { intent, status, search, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await leadModel.findAll({
        intent,
        status,
        search,
        limit: Number(limit),
        offset,
      });

      res.status(200).json({
        success: true,
        data: {
          leads: result.leads,
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

  async getLeadById(req, res, next) {
    try {
      const lead = await leadModel.findById(req.params.id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { lead },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateLeadStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['new', 'contacted', 'in_progress', 'converted', 'closed'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const existing = await leadModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      const updated = await leadModel.updateStatus(id, { status, notes });
      logger.info(`Lead #${id} status updated to '${status || existing.status}'`);

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: { lead: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await leadModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found',
        });
      }

      await leadModel.delete(id);
      logger.info(`Lead #${id} deleted by admin`);

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  async exportLeadsCSV(req, res, next) {
    try {
      const leads = await leadModel.exportAll();

      const fields = [
        { label: 'Lead ID', value: 'id' },
        { label: 'Contact Name', value: 'name' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Organization', value: 'organization' },
        { label: 'City', value: 'city' },
        { label: 'Intent', value: 'intent' },
        { label: 'Status', value: 'status' },
        { label: 'Message Brief', value: 'message' },
        { label: 'Internal Notes', value: 'notes' },
        { label: 'Submitted Date', value: 'created_at' },
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(leads);

      const filename = `syntellos_leads_${new Date().toISOString().slice(0, 10)}.csv`;

      res.header('Content-Type', 'text/csv');
      res.attachment(filename);
      return res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  async getLeadStats(req, res, next) {
    try {
      const stats = await leadModel.getStats();
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  },
};
