import express from 'express';
import { blogController } from '../controllers/blogController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBlogPayload } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', blogController.getBlogs);
router.get('/categories', blogController.getCategories);
router.get('/slug/:slug', blogController.getBlogBySlug);

// Admin protected routes
router.get('/admin/all', requireAuth, blogController.getAllBlogsAdmin);
router.get('/admin/stats', requireAuth, blogController.getBlogStats);
router.get('/admin/:id', requireAuth, blogController.getBlogByIdAdmin);
router.post('/admin', requireAuth, validateBlogPayload, blogController.createBlog);
router.put('/admin/:id', requireAuth, blogController.updateBlog);
router.patch('/admin/:id/publish', requireAuth, blogController.togglePublish);
router.post('/admin/:id/broadcast', requireAuth, blogController.broadcastBlog);
router.delete('/admin/:id', requireAuth, blogController.deleteBlog);

export default router;
