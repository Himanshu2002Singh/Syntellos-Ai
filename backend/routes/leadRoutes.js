import express from 'express';
import { leadController } from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateLeadSubmission } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateLeadSubmission, leadController.submitLead);
router.get('/', requireAuth, leadController.getLeads);
router.get('/export', requireAuth, leadController.exportLeadsCSV);
router.get('/stats', requireAuth, leadController.getLeadStats);
router.get('/:id', requireAuth, leadController.getLeadById);
router.patch('/:id', requireAuth, leadController.updateLeadStatus);
router.delete('/:id', requireAuth, leadController.deleteLead);

export default router;
