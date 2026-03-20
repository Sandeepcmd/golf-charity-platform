import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AppError } from './error.middleware.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: true,
        selectedCharity: {
          include: { charity: true }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

export const requireActiveSubscription = (req, res, next) => {
  if (!req.user.subscription || req.user.subscription.status !== 'ACTIVE') {
    return next(new AppError('Active subscription required', 403));
  }
  next();
};
