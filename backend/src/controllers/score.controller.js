import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';

// Get user's scores (latest 5)
export const getMyScores = async (req, res, next) => {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    next(error);
  }
};

// Add a new score
export const addScore = async (req, res, next) => {
  try {
    const { score, playedAt, courseName } = req.body;

    // Validate Stableford score (1-45)
    if (score < 1 || score > 45) {
      throw new AppError('Score must be between 1 and 45 Stableford points', 400);
    }

    // Check how many scores user has
    const existingScores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' }
    });

    // If user has 5 scores, adding new one will push out oldest
    // This is handled by keeping only latest 5 in queries

    const newScore = await prisma.score.create({
      data: {
        userId: req.user.id,
        score,
        playedAt: new Date(playedAt),
        courseName
      }
    });

    // Get updated scores (latest 5)
    const updatedScores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 5
    });

    res.status(201).json({
      success: true,
      message: 'Score added successfully',
      data: {
        newScore,
        allScores: updatedScores
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a score
export const updateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, playedAt, courseName } = req.body;

    // Verify ownership
    const existingScore = await prisma.score.findUnique({
      where: { id }
    });

    if (!existingScore) {
      throw new AppError('Score not found', 404);
    }

    if (existingScore.userId !== req.user.id) {
      throw new AppError('Not authorized to update this score', 403);
    }

    if (existingScore.verified) {
      throw new AppError('Cannot update a verified score', 400);
    }

    // Validate Stableford score
    if (score && (score < 1 || score > 45)) {
      throw new AppError('Score must be between 1 and 45 Stableford points', 400);
    }

    const updatedScore = await prisma.score.update({
      where: { id },
      data: {
        ...(score && { score }),
        ...(playedAt && { playedAt: new Date(playedAt) }),
        ...(courseName !== undefined && { courseName })
      }
    });

    res.json({
      success: true,
      message: 'Score updated successfully',
      data: updatedScore
    });
  } catch (error) {
    next(error);
  }
};

// Delete a score
export const deleteScore = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingScore = await prisma.score.findUnique({
      where: { id }
    });

    if (!existingScore) {
      throw new AppError('Score not found', 404);
    }

    if (existingScore.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Not authorized to delete this score', 403);
    }

    await prisma.score.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Score deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get scores for draw entry (user's latest 5)
export const getDrawEntryNumbers = async (req, res, next) => {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: { playedAt: 'desc' },
      take: 5
    });

    if (scores.length < 5) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          message: `You need ${5 - scores.length} more score(s) to enter the draw`,
          currentCount: scores.length,
          scores
        }
      });
    }

    const numbers = scores.map(s => s.score);

    res.json({
      success: true,
      data: {
        eligible: true,
        numbers,
        scores
      }
    });
  } catch (error) {
    next(error);
  }
};
