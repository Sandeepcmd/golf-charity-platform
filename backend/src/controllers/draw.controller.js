import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';

// Get current/upcoming draw
export const getCurrentDraw = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let draw = await prisma.draw.findUnique({
      where: { month: currentMonth },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });

    // Create draw if doesn't exist
    if (!draw) {
      draw = await prisma.draw.create({
        data: {
          month: currentMonth,
          status: 'UPCOMING'
        },
        include: {
          _count: {
            select: { entries: true }
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...draw,
        entriesCount: draw._count.entries
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get draw by ID
export const getDraw = async (req, res, next) => {
  try {
    const { id } = req.params;

    const draw = await prisma.draw.findUnique({
      where: { id },
      include: {
        winners: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    });

    if (!draw) {
      throw new AppError('Draw not found', 404);
    }

    res.json({
      success: true,
      data: {
        ...draw,
        entriesCount: draw._count.entries
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get past draws
export const getPastDraws = async (req, res, next) => {
  try {
    const draws = await prisma.draw.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { month: 'desc' },
      take: 12,
      include: {
        winners: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    });

    res.json({
      success: true,
      data: draws.map(draw => ({
        ...draw,
        entriesCount: draw._count.entries
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Enter current draw
export const enterDraw = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check subscription
    if (!req.user.subscription || req.user.subscription.status !== 'ACTIVE') {
      throw new AppError('Active subscription required to enter draw', 403);
    }

    // Get user's 5 scores
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 5
    });

    if (scores.length < 5) {
      throw new AppError(`You need ${5 - scores.length} more score(s) to enter`, 400);
    }

    // Get or create current draw
    let draw = await prisma.draw.findUnique({
      where: { month: currentMonth }
    });

    if (!draw) {
      draw = await prisma.draw.create({
        data: {
          month: currentMonth,
          status: 'UPCOMING'
        }
      });
    }

    if (draw.status === 'COMPLETED') {
      throw new AppError('This draw has already been completed', 400);
    }

    // Check if already entered
    const existingEntry = await prisma.drawEntry.findUnique({
      where: {
        userId_drawId: {
          userId: req.user.id,
          drawId: draw.id
        }
      }
    });

    if (existingEntry) {
      throw new AppError('Already entered this draw', 400);
    }

    // Create entry with user's 5 scores
    const numbers = scores.map(s => s.score);

    const entry = await prisma.drawEntry.create({
      data: {
        userId: req.user.id,
        drawId: draw.id,
        numbers
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully entered the draw',
      data: {
        entry,
        numbers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's entry for current draw
export const getMyEntry = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const draw = await prisma.draw.findUnique({
      where: { month: currentMonth }
    });

    if (!draw) {
      return res.json({
        success: true,
        data: null
      });
    }

    const entry = await prisma.drawEntry.findUnique({
      where: {
        userId_drawId: {
          userId: req.user.id,
          drawId: draw.id
        }
      },
      include: { draw: true }
    });

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// Get user's winning history
export const getMyWinnings = async (req, res, next) => {
  try {
    const winnings = await prisma.winner.findMany({
      where: { userId: req.user.id },
      include: {
        draw: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalWinnings = winnings
      .filter(w => w.status === 'PAID')
      .reduce((sum, w) => sum + Number(w.prizeAmount), 0);

    res.json({
      success: true,
      data: {
        winnings,
        totalWinnings
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload proof of win (for winner verification)
export const uploadProof = async (req, res, next) => {
  try {
    const { winnerId } = req.params;
    const { proofUrl } = req.body;

    const winner = await prisma.winner.findUnique({
      where: { id: winnerId }
    });

    if (!winner) {
      throw new AppError('Winner record not found', 404);
    }

    if (winner.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    if (winner.status !== 'PENDING_VERIFICATION') {
      throw new AppError('Proof already submitted or verified', 400);
    }

    await prisma.winner.update({
      where: { id: winnerId },
      data: { proofUrl }
    });

    res.json({
      success: true,
      message: 'Proof uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};
