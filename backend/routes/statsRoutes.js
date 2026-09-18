import express from 'express';
import { statsController } from '../controllers/statsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, statsController.getDashboardSummary);

export default router;
