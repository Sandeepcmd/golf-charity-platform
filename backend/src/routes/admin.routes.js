import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUser,
  updateUserRole,
  createCharity,
  updateCharity,
  deleteCharity,
  getAllDraws,
  executeDraw,
  getDrawEntries,
  getPendingVerifications,
  verifyWinner,
  markWinnerPaid,
  getPrizePoolConfig,
  updatePrizePoolConfig,
  getDashboardStats
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role',
  validate([body('role').isIn(['USER', 'ADMIN'])]),
  updateUserRole
);

// Charities
router.post('/charities',
  validate([
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty()
  ]),
  createCharity
);
router.put('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);

// Draws
router.get('/draws', getAllDraws);
router.get('/draws/:id/entries', getDrawEntries);
router.post('/draws/:id/execute', executeDraw);

// Winners
router.get('/verifications', getPendingVerifications);
router.put('/winners/:id/verify',
  validate([
    body('status').isIn(['VERIFIED', 'REJECTED'])
  ]),
  verifyWinner
);
router.post('/winners/:id/paid', markWinnerPaid);

// Prize Pool Config
router.get('/config', getPrizePoolConfig);
router.put('/config',
  validate([
    body('charityPercentage').isInt({ min: 10, max: 100 }),
    body('operationalPercentage').isInt({ min: 0, max: 100 }),
    body('fiveMatchPercentage').isInt({ min: 0, max: 100 }),
    body('fourMatchPercentage').isInt({ min: 0, max: 100 }),
    body('threeMatchPercentage').isInt({ min: 0, max: 100 }),
    body('monthlyPrice').isDecimal(),
    body('yearlyPrice').isDecimal()
  ]),
  updatePrizePoolConfig
);

export default router;
