import { blogModel } from '../models/blogModel.js';
import { subscriberModel } from '../models/subscriberModel.js';
import { broadcastNewBlog } from '../config/mailer.js';
import { logger } from '../utils/logger.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const blogController = {
  async getBlogs(req, res, next) {
    try {
      const { category, search, page = 1, limit = 12, sortBy, sortOrder } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await blogModel.findAll({
        is_published: 1,
        category,
        search,
        limit: Number(limit),
        offset,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: {
          blogs: result.blogs,
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

  async getBlogBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const blog = await blogModel.findBySlug(slug);

      if (!blog || (!blog.is_published && !req.user)) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      blogModel.incrementViews(slug).catch(err => logger.debug('Error incrementing views:', err.message));

      const related = await blogModel.findAll({
        is_published: 1,
        category: blog.category,
        limit: 3,
        offset: 0,
      });

      const relatedBlogs = related.blogs.filter(b => b.id !== blog.id);

      res.status(200).json({
        success: true,
        data: {
          blog: {
            ...blog,
            views: (blog.views || 0) + 1,
          },
          relatedBlogs,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await blogModel.getCategories();
      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllBlogsAdmin(req, res, next) {
    try {
      const { category, search, is_published, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await blogModel.findAll({
        category,
        search,
        is_published,
        limit: Number(limit),
        offset,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });

      res.status(200).json({
        success: true,
        data: {
          blogs: result.blogs,
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

  async getBlogByIdAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await blogModel.findById(id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { blog },
      });
    } catch (err) {
      next(err);
    }
  },

  async createBlog(req, res, next) {
    try {
      const {
        title,
        slug: customSlug,
        category,
        excerpt,
        content,
        featured_image,
        featured_video,
        author,
        read_time,
        tags,
        is_published,
        send_email_notification = true,
      } = req.body;

      let finalSlug = customSlug ? slugify(customSlug) : slugify(title);

      const existing = await blogModel.findBySlug(finalSlug);
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const blog = await blogModel.create({
        title,
        slug: finalSlug,
        category,
        excerpt,
        content,
        featured_image,
        featured_video,
        author,
        read_time,
        tags,
        is_published: !!is_published,
      });

      logger.success(`Blog created: "${blog.title}" (${blog.slug}) [Published: ${blog.is_published}]`);

      if (blog.is_published && send_email_notification) {
        subscriberModel.getAllActive().then(subscribers => {
          broadcastNewBlog({ blog, subscribers });
        }).catch(err => logger.error('Error fetching subscribers for broadcast:', err.message));
      }

      res.status(201).json({
        success: true,
        message: `Blog ${blog.is_published ? 'published' : 'saved as draft'} successfully.`,
        data: { blog },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateBlog(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await blogModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      const {
        title,
        slug: customSlug,
        category,
        excerpt,
        content,
        featured_image,
        featured_video,
        author,
        read_time,
        tags,
        is_published,
        send_email_notification = false,
      } = req.body;

      let finalSlug = undefined;
      if (customSlug) {
        finalSlug = slugify(customSlug);
        if (finalSlug !== existing.slug) {
          const duplicate = await blogModel.findBySlug(finalSlug);
          if (duplicate && duplicate.id !== Number(id)) {
            finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
          }
        }
      }

      const updated = await blogModel.update(id, {
        title,
        slug: finalSlug,
        category,
        excerpt,
        content,
        featured_image,
        featured_video,
        author,
        read_time,
        tags,
        is_published,
      });

      logger.info(`Blog #${id} updated by admin.`);

      if (is_published && !existing.is_published && send_email_notification) {
        subscriberModel.getAllActive().then(subscribers => {
          broadcastNewBlog({ blog: updated, subscribers });
        }).catch(err => logger.error('Error broadcasting blog update:', err.message));
      }

      res.status(200).json({
        success: true,
        message: 'Blog updated successfully.',
        data: { blog: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async togglePublish(req, res, next) {
    try {
      const { id } = req.params;
      const { is_published, send_email_notification = false } = req.body;

      const existing = await blogModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      const targetStatus = is_published !== undefined ? !!is_published : !existing.is_published;
      const updated = await blogModel.togglePublish(id, targetStatus);

      logger.info(`Blog #${id} publish status changed to: ${targetStatus}`);

      if (targetStatus && !existing.is_published && send_email_notification) {
        subscriberModel.getAllActive().then(subscribers => {
          broadcastNewBlog({ blog: updated, subscribers });
        }).catch(err => logger.error('Error broadcasting toggled blog:', err.message));
      }

      res.status(200).json({
        success: true,
        message: `Blog ${targetStatus ? 'published' : 'moved to drafts'} successfully.`,
        data: { blog: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteBlog(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await blogModel.findById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      await blogModel.delete(id);
      logger.info(`Blog #${id} ("${existing.title}") deleted by admin.`);

      res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  async broadcastBlog(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await blogModel.findById(id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      const subscribers = await subscriberModel.getAllActive();
      if (subscribers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No active subscribers found to broadcast to.',
        });
      }

      const broadcastResult = await broadcastNewBlog({ blog, subscribers });

      res.status(200).json({
        success: true,
        message: `Broadcast completed. Sent to ${broadcastResult.sent} subscribers.`,
        data: broadcastResult,
      });
    } catch (err) {
      next(err);
    }
  },

  async getBlogStats(req, res, next) {
    try {
      const stats = await blogModel.getStats();
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  },
};
