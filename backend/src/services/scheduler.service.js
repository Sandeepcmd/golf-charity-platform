import cron from 'node-cron';
import prisma from '../config/database.js';
import { runDraw } from './draw.service.js';

export function scheduledJobs() {
  // Create next month's draw on the 1st of each month at midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running scheduled job: Create new draw');
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const existingDraw = await prisma.draw.findUnique({
        where: { month: currentMonth }
      });

      if (!existingDraw) {
        await prisma.draw.create({
          data: {
            month: currentMonth,
            status: 'UPCOMING'
          }
        });
        console.log('New draw created for', currentMonth.toISOString());
      }
    } catch (error) {
      console.error('Error creating monthly draw:', error);
    }
  });

  // Auto-enter eligible subscribers on the 15th of each month
  cron.schedule('0 0 15 * *', async () => {
    console.log('Running scheduled job: Auto-enter subscribers');
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const draw = await prisma.draw.findUnique({
        where: { month: currentMonth }
      });

      if (!draw || draw.status !== 'UPCOMING') {
        console.log('No active draw to enter');
        return;
      }

      // Get active subscribers with 5 scores who haven't entered
      const eligibleUsers = await prisma.user.findMany({
        where: {
          subscription: { status: 'ACTIVE' },
          entries: {
            none: { drawId: draw.id }
          }
        },
        include: {
          scores: {
            orderBy: { playedAt: 'desc' },
            take: 5
          }
        }
      });

      for (const user of eligibleUsers) {
        if (user.scores.length >= 5) {
          await prisma.drawEntry.create({
            data: {
              userId: user.id,
              drawId: draw.id,
              numbers: user.scores.map(s => s.score)
            }
          });
          console.log(`Auto-entered user ${user.id} into draw`);
        }
      }
    } catch (error) {
      console.error('Error auto-entering subscribers:', error);
    }
  });

  // Run draw on last day of month at 11 PM
  cron.schedule('0 23 28-31 * *', async () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    if (now.getDate() !== lastDay) return;

    console.log('Running scheduled job: Execute monthly draw');
    try {
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const draw = await prisma.draw.findUnique({
        where: { month: currentMonth }
      });

      if (draw && draw.status === 'UPCOMING') {
        const result = await runDraw(draw.id);
        console.log('Draw completed:', result);
      }
    } catch (error) {
      console.error('Error executing draw:', error);
    }
  });

  // Check for expired subscriptions daily
  cron.schedule('0 1 * * *', async () => {
    console.log('Running scheduled job: Check expired subscriptions');
    try {
      const now = new Date();

      await prisma.subscription.updateMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: { lt: now }
        },
        data: { status: 'EXPIRED' }
      });
    } catch (error) {
      console.error('Error checking subscriptions:', error);
    }
  });

  console.log('Scheduled jobs initialized');
}
