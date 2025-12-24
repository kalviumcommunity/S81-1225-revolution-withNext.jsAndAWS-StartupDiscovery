import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'SaaS',
        slug: 'saas',
        description: 'Software as a Service businesses',
        color: '#3B82F6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'E-commerce',
        slug: 'ecommerce',
        description: 'Online retail and marketplace platforms',
        color: '#10B981',
      },
    }),
    prisma.category.create({
      data: {
        name: 'FinTech',
        slug: 'fintech',
        description: 'Financial technology solutions',
        color: '#8B5CF6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'HealthTech',
        slug: 'healthtech',
        description: 'Healthcare and medical technology',
        color: '#EF4444',
      },
    }),
    prisma.category.create({
      data: {
        name: 'EdTech',
        slug: 'edtech',
        description: 'Educational technology platforms',
        color: '#F59E0B',
      },
    }),
    prisma.category.create({
      data: {
        name: 'AI/ML',
        slug: 'ai-ml',
        description: 'Artificial Intelligence and Machine Learning',
        color: '#EC4899',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'B2B', slug: 'b2b' } }),
    prisma.tag.create({ data: { name: 'B2C', slug: 'b2c' } }),
    prisma.tag.create({ data: { name: 'Mobile App', slug: 'mobile-app' } }),
    prisma.tag.create({ data: { name: 'Web App', slug: 'web-app' } }),
    prisma.tag.create({ data: { name: 'API', slug: 'api' } }),
    prisma.tag.create({ data: { name: 'Blockchain', slug: 'blockchain' } }),
    prisma.tag.create({ data: { name: 'Cloud', slug: 'cloud' } }),
    prisma.tag.create({ data: { name: 'Open Source', slug: 'open-source' } }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create demo users
  const passwordHash = await hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice_tech',
        passwordHash,
        name: 'Alice Johnson',
        bio: 'Serial entrepreneur passionate about SaaS products',
        role: 'USER',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob_founder',
        passwordHash,
        name: 'Bob Smith',
        bio: 'Fintech enthusiast and startup advisor',
        role: 'USER',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@startupdiscovery.com',
        username: 'admin',
        passwordHash,
        name: 'Admin User',
        bio: 'Platform administrator',
        role: 'ADMIN',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create demo startups
  const startup1 = await prisma.startup.create({
    data: {
      title: 'CloudSync Pro',
      slug: 'cloudsync-pro',
      tagline: 'Seamless file synchronization for distributed teams',
      description: `CloudSync Pro is a revolutionary cloud storage solution that makes file synchronization effortless for remote teams. 

Key Features:
- Real-time sync across all devices
- End-to-end encryption
- Advanced collaboration tools
- Unlimited storage options

Our platform has been trusted by over 10,000 teams worldwide.`,
      stage: 'LAUNCHED',
      industry: 'SaaS',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 1250,
      voteCount: 84,
      fundingGoal: 500000,
      location: 'San Francisco, CA',
      userId: users[0].id,
      publishedAt: new Date(),
      categories: {
        create: [
          { categoryId: categories[0].id }, // SaaS
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // B2B
          { tagId: tags[3].id }, // Web App
          { tagId: tags[6].id }, // Cloud
        ],
      },
      team: {
        create: [
          {
            name: 'Alice Johnson',
            role: 'CEO & Founder',
            bio: 'Former Google engineer with 10 years of experience',
          },
          {
            name: 'John Doe',
            role: 'CTO',
            bio: 'MIT graduate, full-stack developer',
          },
        ],
      },
      milestones: {
        create: [
          {
            title: 'Launched Beta Version',
            achievedAt: new Date('2024-06-01'),
            order: 1,
          },
          {
            title: 'Reached 1,000 Users',
            achievedAt: new Date('2024-09-15'),
            order: 2,
          },
          {
            title: 'Series A Funding',
            order: 3,
          },
        ],
      },
    },
  });

  const startup2 = await prisma.startup.create({
    data: {
      title: 'HealthTrack AI',
      slug: 'healthtrack-ai',
      tagline: 'AI-powered personal health monitoring',
      description: `HealthTrack AI uses cutting-edge machine learning to help you monitor and improve your health.

Features:
- Smart health predictions
- Personalized wellness plans
- Integration with wearable devices
- HIPAA compliant and secure`,
      stage: 'MVP',
      industry: 'HealthTech',
      status: 'PUBLISHED',
      viewCount: 820,
      voteCount: 52,
      fundingGoal: 250000,
      location: 'Boston, MA',
      userId: users[1].id,
      publishedAt: new Date(),
      categories: {
        create: [
          { categoryId: categories[3].id }, // HealthTech
          { categoryId: categories[5].id }, // AI/ML
        ],
      },
      tags: {
        create: [
          { tagId: tags[1].id }, // B2C
          { tagId: tags[2].id }, // Mobile App
        ],
      },
    },
  });

  console.log(`✅ Created 2 demo startups`);

  // Create some votes
  await prisma.vote.createMany({
    data: [
      { userId: users[1].id, startupId: startup1.id, value: 1 },
      { userId: users[2].id, startupId: startup1.id, value: 1 },
      { userId: users[0].id, startupId: startup2.id, value: 1 },
    ],
  });

  // Create some comments
  await prisma.comment.create({
    data: {
      content: 'This looks amazing! Really excited to try it out.',
      userId: users[1].id,
      startupId: startup1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great use of AI in healthcare. How do you handle data privacy?',
      userId: users[0].id,
      startupId: startup2.id,
    },
  });

  console.log('✅ Created demo votes and comments');

  // Create bookmarks
  await prisma.bookmark.createMany({
    data: [
      { userId: users[1].id, startupId: startup1.id },
      { userId: users[2].id, startupId: startup1.id },
      { userId: users[2].id, startupId: startup2.id },
    ],
  });

  console.log('✅ Created demo bookmarks');

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: users[1].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[0].id },
      { followerId: users[0].id, followingId: users[1].id },
    ],
  });

  console.log('✅ Created demo follows');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
