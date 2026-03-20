import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';

// Get all active charities
export const getCharities = async (req, res, next) => {
  try {
    const charities = await prisma.charity.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    next(error);
  }
};

// Get single charity
export const getCharity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const charity = await prisma.charity.findUnique({
      where: { id },
      include: {
        contributions: {
          orderBy: { month: 'desc' },
          take: 12
        },
        _count: {
          select: { userCharities: true }
        }
      }
    });

    if (!charity) {
      throw new AppError('Charity not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...charity,
        supportersCount: charity._count.userCharities
      }
    });
  } catch (error) {
    next(error);
  }
};

// Select charity for user
export const selectCharity = async (req, res, next) => {
  try {
    const { charityId } = req.body;

    const charity = await prisma.charity.findUnique({
      where: { id: charityId }
    });

    if (!charity || !charity.active) {
      throw new AppError('Charity not found or inactive', 404);
    }

    // Upsert user charity selection
    const userCharity = await prisma.userCharity.upsert({
      where: { userId: req.user.id },
      update: { charityId },
      create: {
        userId: req.user.id,
        charityId
      },
      include: { charity: true }
    });

    res.json({
      success: true,
      message: 'Charity selected successfully',
      data: userCharity
    });
  } catch (error) {
    next(error);
  }
};

// Get user's selected charity
export const getMyCharity = async (req, res, next) => {
  try {
    const userCharity = await prisma.userCharity.findUnique({
      where: { userId: req.user.id },
      include: { charity: true }
    });

    res.json({
      success: true,
      data: userCharity
    });
  } catch (error) {
    next(error);
  }
};

// Get charity leaderboard (most supported)
export const getCharityLeaderboard = async (req, res, next) => {
  try {
    const charities = await prisma.charity.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { userCharities: true }
        }
      },
      orderBy: {
        totalContributions: 'desc'
      }
    });

    const leaderboard = charities.map(charity => ({
      id: charity.id,
      name: charity.name,
      logoUrl: charity.logoUrl,
      totalContributions: charity.totalContributions,
      supportersCount: charity._count.userCharities
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};
