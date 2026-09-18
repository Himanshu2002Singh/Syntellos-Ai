import express from 'express';
import { newsletterController } from '../controllers/newsletterController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateSubscription } from '../middleware/validate.js';

const router = express.Router();

router.post('/subscribe', validateSubscription, newsletterController.subscribe);
router.get('/unsubscribe', newsletterController.unsubscribe);
router.get('/subscribers', requireAuth, newsletterController.getSubscribers);
router.get('/stats', requireAuth, newsletterController.getSubscriberStats);
router.post('/broadcast', requireAuth, newsletterController.sendManualBroadcast);
router.delete('/subscribers/:id', requireAuth, newsletterController.deleteSubscriber);

export default router;
