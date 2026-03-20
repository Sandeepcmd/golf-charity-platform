import express from 'express';
import { body } from 'express-validator';
import {
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  createBillingPortalSession,
  getPlans,
  syncSubscription
} from '../controllers/subscription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/plans', getPlans);

router.post('/checkout',
  authenticate,
  validate([
    body('plan').isIn(['MONTHLY', 'YEARLY'])
  ]),
  createCheckoutSession
);

router.get('/current', authenticate, getSubscription);

router.post('/sync', authenticate, syncSubscription);

router.post('/cancel', authenticate, cancelSubscription);

router.post('/resume', authenticate, resumeSubscription);

router.post('/billing-portal', authenticate, createBillingPortalSession);

export default router;
