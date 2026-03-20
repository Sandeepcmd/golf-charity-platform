import express from 'express';
import { body } from 'express-validator';
import {
  getCurrentDraw,
  getDraw,
  getPastDraws,
  enterDraw,
  getMyEntry,
  getMyWinnings,
  uploadProof
} from '../controllers/draw.controller.js';
import { authenticate, requireActiveSubscription } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/current', getCurrentDraw);

router.get('/past', getPastDraws);

router.get('/my-entry', authenticate, getMyEntry);

router.get('/my-winnings', authenticate, getMyWinnings);

router.post('/enter', authenticate, requireActiveSubscription, enterDraw);

router.post('/proof/:winnerId',
  authenticate,
  validate([
    body('proofUrl').isURL()
  ]),
  uploadProof
);

router.get('/:id', getDraw);

export default router;
