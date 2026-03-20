import prisma from '../config/database.js';

// Generate random winning numbers (5 numbers between 1-45)
function generateWinningNumbers() {
  const numbers = [];
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// Count matching numbers between entry and winning numbers
function countMatches(entryNumbers, winningNumbers) {
  const winningSet = new Set(winningNumbers);
  return entryNumbers.filter(num => winningSet.has(num)).length;
}

// Calculate prize pool distribution
export async function calculatePrizePool(drawId) {
  const config = await prisma.prizePoolConfig.findFirst({
    where: { active: true }
  });

  if (!config) {
    throw new Error('Prize pool config not found');
  }

  // Get active subscribers count
  const activeSubscribers = await prisma.subscription.count({
    where: { status: 'ACTIVE' }
  });

  // Calculate total pool (simplified - in production, track actual payments)
  const monthlySubscribers = await prisma.subscription.count({
    where: { status: 'ACTIVE', plan: 'MONTHLY' }
  });
  const yearlySubscribers = await prisma.subscription.count({
    where: { status: 'ACTIVE', plan: 'YEARLY' }
  });

  const monthlyRevenue = monthlySubscribers * Number(config.monthlyPrice);
  const yearlyMonthlyRevenue = yearlySubscribers * (Number(config.yearlyPrice) / 12);
  const totalPool = monthlyRevenue + yearlyMonthlyRevenue;

  return {
    totalPool,
    charityAmount: totalPool * (config.charityPercentage / 100),
    operationalAmount: totalPool * (config.operationalPercentage / 100),
    fiveMatchPrize: totalPool * (config.fiveMatchPercentage / 100),
    fourMatchPrize: totalPool * (config.fourMatchPercentage / 100),
    threeMatchPrize: totalPool * (config.threeMatchPercentage / 100)
  };
}

// Run the draw for a given month
export async function runDraw(drawId) {
  const draw = await prisma.draw.findUnique({
    where: { id: drawId },
    include: { entries: true }
  });

  if (!draw) {
    throw new Error('Draw not found');
  }

  if (draw.status === 'COMPLETED') {
    throw new Error('Draw already completed');
  }

  // Generate winning numbers
  const winningNumbers = generateWinningNumbers();

  // Calculate prize pool
  const prizeDistribution = await calculatePrizePool(drawId);

  // Find winners
  const winners = [];
  const fiveMatchWinners = [];
  const fourMatchWinners = [];
  const threeMatchWinners = [];

  for (const entry of draw.entries) {
    const matches = countMatches(entry.numbers, winningNumbers);
    const matchedNumbers = entry.numbers.filter(n => winningNumbers.includes(n));

    if (matches >= 3) {
      if (matches === 5) {
        fiveMatchWinners.push({ entry, matchedNumbers });
      } else if (matches === 4) {
        fourMatchWinners.push({ entry, matchedNumbers });
      } else {
        threeMatchWinners.push({ entry, matchedNumbers });
      }
    }
  }

  // Calculate prize per winner (split among winners of same tier)
  const fiveMatchPrizeEach = fiveMatchWinners.length > 0
    ? prizeDistribution.fiveMatchPrize / fiveMatchWinners.length
    : 0;
  const fourMatchPrizeEach = fourMatchWinners.length > 0
    ? prizeDistribution.fourMatchPrize / fourMatchWinners.length
    : 0;
  const threeMatchPrizeEach = threeMatchWinners.length > 0
    ? prizeDistribution.threeMatchPrize / threeMatchWinners.length
    : 0;

  // Create winner records
  const createWinners = async (winnerList, matchCount, prizeAmount) => {
    for (const { entry, matchedNumbers } of winnerList) {
      winners.push(
        await prisma.winner.create({
          data: {
            userId: entry.userId,
            drawId: draw.id,
            matchCount,
            matchedNumbers,
            prizeAmount,
            status: 'PENDING_VERIFICATION'
          }
        })
      );
    }
  };

  await createWinners(fiveMatchWinners, 5, fiveMatchPrizeEach);
  await createWinners(fourMatchWinners, 4, fourMatchPrizeEach);
  await createWinners(threeMatchWinners, 3, threeMatchPrizeEach);

  // Create charity contributions
  const charities = await prisma.charity.findMany({
    where: { active: true },
    include: {
      _count: { select: { userCharities: true } }
    }
  });

  const totalSupporters = charities.reduce((sum, c) => sum + c._count.userCharities, 0);

  if (totalSupporters > 0) {
    for (const charity of charities) {
      const proportion = charity._count.userCharities / totalSupporters;
      const amount = prizeDistribution.charityAmount * proportion;

      if (amount > 0) {
        await prisma.charityContribution.create({
          data: {
            charityId: charity.id,
            amount,
            source: 'prize_pool',
            month: draw.month
          }
        });

        await prisma.charity.update({
          where: { id: charity.id },
          data: {
            totalContributions: {
              increment: amount
            }
          }
        });
      }
    }
  }

  // Update draw with results
  const updatedDraw = await prisma.draw.update({
    where: { id: drawId },
    data: {
      status: 'COMPLETED',
      winningNumbers,
      prizePool: prizeDistribution.totalPool,
      charityAmount: prizeDistribution.charityAmount,
      operationalAmount: prizeDistribution.operationalAmount,
      fiveMatchPrize: prizeDistribution.fiveMatchPrize,
      fourMatchPrize: prizeDistribution.fourMatchPrize,
      threeMatchPrize: prizeDistribution.threeMatchPrize,
      drawDate: new Date()
    },
    include: {
      winners: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } }
        }
      }
    }
  });

  return {
    draw: updatedDraw,
    winningNumbers,
    prizeDistribution,
    winnersCount: {
      fiveMatch: fiveMatchWinners.length,
      fourMatch: fourMatchWinners.length,
      threeMatch: threeMatchWinners.length
    }
  };
}
