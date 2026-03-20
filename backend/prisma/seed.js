import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@golfcharity.com' },
    update: {},
    create: {
      email: 'admin@golfcharity.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.email);

  // Create sample charities
  const charities = [
    {
      name: 'Golf for Good Foundation',
      description: 'Bringing golf to underprivileged youth and communities worldwide.',
      website: 'https://golfforgood.org',
      logoUrl: 'https://placehold.co/200x200/22c55e/ffffff?text=GFG'
    },
    {
      name: 'First Tee',
      description: 'Using golf to teach life skills to young people.',
      website: 'https://firsttee.org',
      logoUrl: 'https://placehold.co/200x200/3b82f6/ffffff?text=FT'
    },
    {
      name: 'PGA HOPE',
      description: 'Golf rehabilitation program for military veterans.',
      website: 'https://pgahope.org',
      logoUrl: 'https://placehold.co/200x200/ef4444/ffffff?text=PGA'
    },
    {
      name: 'Links for Life',
      description: 'Supporting cancer research through golf events.',
      website: 'https://linksforlife.org',
      logoUrl: 'https://placehold.co/200x200/8b5cf6/ffffff?text=L4L'
    },
    {
      name: 'Environmental Golf Foundation',
      description: 'Promoting sustainable golf courses and environmental conservation.',
      website: 'https://egf.org',
      logoUrl: 'https://placehold.co/200x200/10b981/ffffff?text=EGF'
    }
  ];

  for (const charity of charities) {
    await prisma.charity.upsert({
      where: { name: charity.name },
      update: charity,
      create: charity
    });
  }
  console.log('Charities created');

  // Create prize pool config
  await prisma.prizePoolConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: {
      id: 'default-config',
      charityPercentage: 10,
      operationalPercentage: 20,
      fiveMatchPercentage: 40,
      fourMatchPercentage: 20,
      threeMatchPercentage: 10,
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      active: true
    }
  });
  console.log('Prize pool config created');

  // Create current month's draw
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.draw.upsert({
    where: { month: currentMonth },
    update: {},
    create: {
      month: currentMonth,
      status: 'UPCOMING'
    }
  });
  console.log('Current draw created');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
