import express from 'express';
import { body } from 'express-validator';
import {
  getMyScores,
  addScore,
  updateScore,
  deleteScore,
  getDrawEntryNumbers
} from '../controllers/score.controller.js';
import { authenticate, requireActiveSubscription } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/', authenticate, getMyScores);

router.post('/',
  authenticate,
  requireActiveSubscription,
  validate([
    body('score').isInt({ min: 1, max: 45 }),
    body('playedAt').isISO8601(),
    body('courseName').optional().trim()
  ]),
  addScore
);

router.put('/:id',
  authenticate,
  validate([
    body('score').optional().isInt({ min: 1, max: 45 }),
    body('playedAt').optional().isISO8601(),
    body('courseName').optional().trim()
  ]),
  updateScore
);

router.delete('/:id', authenticate, deleteScore);

router.get('/draw-numbers', authenticate, getDrawEntryNumbers);

export default router;
