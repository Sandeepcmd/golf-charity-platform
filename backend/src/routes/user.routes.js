import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes are mostly in auth - this is for additional user features
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      role: req.user.role,
      subscription: req.user.subscription,
      createdAt: req.user.createdAt
    }
  });
});

export default router;
