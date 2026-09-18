import { leadModel } from '../models/leadModel.js';
import { subscriberModel } from '../models/subscriberModel.js';
import { blogModel } from '../models/blogModel.js';
import { db } from '../config/db.js';

export const statsController = {
  async getDashboardSummary(req, res, next) {
    try {
      const [leadStats, subStats, blogStats, recentLeads, recentBlogs] = await Promise.all([
        leadModel.getStats(),
        subscriberModel.getStats(),
        blogModel.getStats(),
        leadModel.findAll({ limit: 5, offset: 0 }),
        blogModel.findAll({ limit: 5, offset: 0, sortBy: 'created_at', sortOrder: 'DESC' }),
      ]);

      const emailLogsCount = await db.get('SELECT COUNT(*) as count FROM email_logs');

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalLeads: leadStats.total,
            newLeads: leadStats.newLeads,
            totalSubscribers: subStats.total,
            activeSubscribers: subStats.active,
            totalBlogs: blogStats.total,
            publishedBlogs: blogStats.published,
            draftBlogs: blogStats.drafts,
            totalBlogViews: blogStats.totalViews,
            totalEmailsLogged: emailLogsCount ? emailLogsCount.count : 0,
          },
          leadsBreakdown: {
            byIntent: leadStats.byIntent,
            byStatus: leadStats.byStatus,
          },
          recentActivity: {
            leads: recentLeads.leads,
            blogs: recentBlogs.blogs,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
