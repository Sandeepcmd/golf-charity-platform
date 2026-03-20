import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ]),
  register
);

router.post('/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ]),
  login
);

router.get('/me', authenticate, getMe);

router.put('/profile',
  authenticate,
  validate([
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty()
  ]),
  updateProfile
);

router.put('/password',
  authenticate,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ]),
  changePassword
);

export default router;
