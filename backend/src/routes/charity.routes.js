import express from 'express';
import { body } from 'express-validator';
import {
  getCharities,
  getCharity,
  selectCharity,
  getMyCharity,
  getCharityLeaderboard
} from '../controllers/charity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/', getCharities);

router.get('/leaderboard', getCharityLeaderboard);

router.get('/my-charity', authenticate, getMyCharity);

router.post('/select',
  authenticate,
  validate([
    body('charityId').isUUID()
  ]),
  selectCharity
);

router.get('/:id', getCharity);

export default router;
