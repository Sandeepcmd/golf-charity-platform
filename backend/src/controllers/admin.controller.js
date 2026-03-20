import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { runDraw, calculatePrizePool } from '../services/draw.service.js';

// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.subscription = { status };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          subscription: true,
          selectedCharity: { include: { charity: true } },
          _count: { select: { scores: true, winners: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          ...u,
          password: undefined,
          scoresCount: u._count.scores,
          winsCount: u._count.winners
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        selectedCharity: { include: { charity: true } },
        scores: { orderBy: { playedAt: 'desc' } },
        entries: { include: { draw: true } },
        winners: { include: { draw: true } }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { ...user, password: undefined }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({
      success: true,
      message: 'User role updated',
      data: { id: user.id, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CHARITY MANAGEMENT ====================

export const createCharity = async (req, res, next) => {
  try {
    const { name, description, logoUrl, website } = req.body;

    const charity = await prisma.charity.create({
      data: { name, description, logoUrl, website }
    });

    res.status(201).json({
      success: true,
      data: charity
    });
  } catch (error) {
    next(error);
  }
};

export const updateCharity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, website, active } = req.body;

    const charity = await prisma.charity.update({
      where: { id },
      data: { name, description, logoUrl, website, active }
    });

    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCharity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - just mark as inactive
    await prisma.charity.update({
      where: { id },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'Charity deactivated'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DRAW MANAGEMENT ====================

export const getAllDraws = async (req, res, next) => {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { month: 'desc' },
      include: {
        _count: { select: { entries: true, winners: true } }
      }
    });

    res.json({
      success: true,
      data: draws.map(d => ({
        ...d,
        entriesCount: d._count.entries,
        winnersCount: d._count.winners
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const executeDraw = async (req, res, next) => {
  try {
    const { id } = req.params;

    const draw = await prisma.draw.findUnique({
      where: { id },
      include: { entries: true }
    });

    if (!draw) {
      throw new AppError('Draw not found', 404);
    }

    if (draw.status === 'COMPLETED') {
      throw new AppError('Draw already completed', 400);
    }

    if (draw.entries.length === 0) {
      throw new AppError('No entries in this draw', 400);
    }

    // Run the draw
    const result = await runDraw(draw.id);

    res.json({
      success: true,
      message: 'Draw executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getDrawEntries = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entries = await prisma.drawEntry.findMany({
      where: { drawId: id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// ==================== WINNER MANAGEMENT ====================

export const getPendingVerifications = async (req, res, next) => {
  try {
    const winners = await prisma.winner.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        draw: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: winners
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWinner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const winner = await prisma.winner.update({
      where: { id },
      data: {
        status,
        verificationNotes: notes,
        verifiedAt: new Date(),
        verifiedBy: req.user.id
      }
    });

    res.json({
      success: true,
      message: `Winner ${status.toLowerCase()}`,
      data: winner
    });
  } catch (error) {
    next(error);
  }
};

export const markWinnerPaid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const winner = await prisma.winner.findUnique({ where: { id } });

    if (!winner) {
      throw new AppError('Winner not found', 404);
    }

    if (winner.status !== 'VERIFIED') {
      throw new AppError('Winner must be verified before marking as paid', 400);
    }

    await prisma.winner.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Winner marked as paid'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PRIZE POOL CONFIG ====================

export const getPrizePoolConfig = async (req, res, next) => {
  try {
    const config = await prisma.prizePoolConfig.findFirst({
      where: { active: true }
    });

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrizePoolConfig = async (req, res, next) => {
  try {
    const {
      charityPercentage,
      operationalPercentage,
      fiveMatchPercentage,
      fourMatchPercentage,
      threeMatchPercentage,
      monthlyPrice,
      yearlyPrice
    } = req.body;

    // Validate percentages sum to 100
    const total = charityPercentage + operationalPercentage +
      fiveMatchPercentage + fourMatchPercentage + threeMatchPercentage;

    if (total !== 100) {
      throw new AppError('Percentages must sum to 100', 400);
    }

    if (charityPercentage < 10) {
      throw new AppError('Charity percentage must be at least 10%', 400);
    }

    // Deactivate current config
    await prisma.prizePoolConfig.updateMany({
      where: { active: true },
      data: { active: false }
    });

    // Create new config
    const config = await prisma.prizePoolConfig.create({
      data: {
        charityPercentage,
        operationalPercentage,
        fiveMatchPercentage,
        fourMatchPercentage,
        threeMatchPercentage,
        monthlyPrice,
        yearlyPrice,
        active: true
      }
    });

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DASHBOARD STATS ====================

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalCharities,
      totalPrizePoolPaid,
      totalCharityContributions,
      recentWinners,
      monthlyGrowth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.charity.count({ where: { active: true } }),
      prisma.winner.aggregate({
        where: { status: 'PAID' },
        _sum: { prizeAmount: true }
      }),
      prisma.charityContribution.aggregate({
        _sum: { amount: true }
      }),
      prisma.winner.findMany({
        where: { status: { in: ['VERIFIED', 'PAID'] } },
        include: {
          user: { select: { firstName: true, lastName: true } },
          draw: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      getMonthlyGrowth()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalCharities,
        totalPrizePoolPaid: totalPrizePoolPaid._sum.prizeAmount || 0,
        totalCharityContributions: totalCharityContributions._sum.amount || 0,
        recentWinners,
        monthlyGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

async function getMonthlyGrowth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true }
  });

  const growth = {};
  users.forEach(user => {
    const monthKey = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`;
    growth[monthKey] = (growth[monthKey] || 0) + 1;
  });

  return growth;
}
