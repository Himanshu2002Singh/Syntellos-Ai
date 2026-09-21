import express from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';
import newsletterRoutes from './newsletterRoutes.js';
import blogRoutes from './blogRoutes.js';
import statsRoutes from './statsRoutes.js';
import mediaRoutes from './mediaRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Syntellos AI Backend API',
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/blogs', blogRoutes);
router.use('/stats', statsRoutes);
router.use('/media', mediaRoutes);

export default router;
