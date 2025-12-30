import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

/**
 * Seed Script for StartupDiscovery Database
 *
 * This script:
 * ✅ Is idempotent - safe to run multiple times
 * ✅ Uses upsert operations - checks before creating
 * ✅ Provides sample data for development
 * ✅ Handles errors gracefully
 *
 * Usage:
 *   npx prisma db seed
 *   npm run prisma:seed
 */

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ============================================
    // 1. CREATE CATEGORIES (Idempotent)
    // ============================================
    console.log('📁 Creating categories...');

    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'saas' },
        update: {},
        create: {
          name: 'SaaS',
          slug: 'saas',
          description: 'Software as a Service businesses',
          color: '#3B82F6',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'ecommerce' },
        update: {},
        create: {
          name: 'E-commerce',
          slug: 'ecommerce',
          description: 'Online retail and marketplace platforms',
          color: '#10B981',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'fintech' },
        update: {},
        create: {
          name: 'FinTech',
          slug: 'fintech',
          description: 'Financial technology solutions',
          color: '#8B5CF6',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'healthtech' },
        update: {},
        create: {
          name: 'HealthTech',
          slug: 'healthtech',
          description: 'Healthcare and medical technology',
          color: '#EF4444',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'edtech' },
        update: {},
        create: {
          name: 'EdTech',
          slug: 'edtech',
          description: 'Educational technology platforms',
          color: '#F59E0B',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'ai-ml' },
        update: {},
        create: {
          name: 'AI/ML',
          slug: 'ai-ml',
          description: 'Artificial Intelligence and Machine Learning',
          color: '#EC4899',
        },
      }),
    ]);

    console.log(`✅ Created/verified ${categories.length} categories\n`);

    // ============================================
    // 2. CREATE TAGS (Idempotent)
    // ============================================
    console.log('🏷️  Creating tags...');

    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { slug: 'b2b' },
        update: {},
        create: { name: 'B2B', slug: 'b2b' },
      }),
      prisma.tag.upsert({
        where: { slug: 'b2c' },
        update: {},
        create: { name: 'B2C', slug: 'b2c' },
      }),
      prisma.tag.upsert({
        where: { slug: 'mobile-app' },
        update: {},
        create: { name: 'Mobile App', slug: 'mobile-app' },
      }),
      prisma.tag.upsert({
        where: { slug: 'web-app' },
        update: {},
        create: { name: 'Web App', slug: 'web-app' },
      }),
      prisma.tag.upsert({
        where: { slug: 'api' },
        update: {},
        create: { name: 'API', slug: 'api' },
      }),
      prisma.tag.upsert({
        where: { slug: 'blockchain' },
        update: {},
        create: { name: 'Blockchain', slug: 'blockchain' },
      }),
      prisma.tag.upsert({
        where: { slug: 'cloud' },
        update: {},
        create: { name: 'Cloud', slug: 'cloud' },
      }),
      prisma.tag.upsert({
        where: { slug: 'open-source' },
        update: {},
        create: { name: 'Open Source', slug: 'open-source' },
      }),
    ]);

    console.log(`✅ Created/verified ${tags.length} tags\n`);

    // ============================================
    // 3. CREATE USERS (Idempotent)
    // ============================================
    console.log('👥 Creating users...');

    const passwordHash = await hash('password123', 10);

    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
          email: 'alice@example.com',
          username: 'alice_tech',
          passwordHash,
          name: 'Alice Johnson',
          bio: 'Serial entrepreneur passionate about SaaS products',
          role: 'USER',
          isVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
          email: 'bob@example.com',
          username: 'bob_founder',
          passwordHash,
          name: 'Bob Smith',
          bio: 'Fintech enthusiast and startup advisor',
          role: 'USER',
          isVerified: true,
        },
      }),
      prisma.user.upsert({
        where: { email: 'admin@startupdiscovery.com' },
        update: {},
        create: {
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

    console.log(`✅ Created/verified ${users.length} users\n`);

    // ============================================
    // 4. CREATE STARTUPS (Idempotent)
    // ============================================
    console.log('🚀 Creating startups...');

    const startup1 = await prisma.startup.upsert({
      where: { slug: 'cloudsync-pro' },
      update: {
        // Update fields if it exists
        title: 'CloudSync Pro',
        tagline: 'Seamless file synchronization for distributed teams',
        viewCount: 1250,
        voteCount: 84,
      },
      create: {
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
        fundingGoal: new Decimal(500000),
        location: 'San Francisco, CA',
        userId: users[0].id,
        publishedAt: new Date(),
        categories: {
          create: [{ categoryId: categories[0].id }], // SaaS
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

    const startup2 = await prisma.startup.upsert({
      where: { slug: 'healthtrack-ai' },
      update: {
        title: 'HealthTrack AI',
        tagline: 'AI-powered personal health monitoring',
        viewCount: 820,
        voteCount: 52,
      },
      create: {
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
        fundingGoal: new Decimal(250000),
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

    console.log(`✅ Created/verified 2 startups\n`);

    // ============================================
    // 5. CREATE COMMENTS (Idempotent)
    // ============================================
    console.log('💬 Creating comments...');

    // Delete existing comments for this demo (safer than trying to upsert without unique constraint)
    const existingComments = await prisma.comment.findMany({
      where: {
        OR: [
          {
            content: 'This looks amazing! Really excited to try it out.',
          },
          {
            content: 'Great use of AI in healthcare. How do you handle data privacy?',
          },
        ],
      },
    });

    if (existingComments.length === 0) {
      await prisma.comment.createMany({
        data: [
          {
            content: 'This looks amazing! Really excited to try it out.',
            userId: users[1].id,
            startupId: startup1.id,
          },
          {
            content:
              'Great use of AI in healthcare. How do you handle data privacy?',
            userId: users[0].id,
            startupId: startup2.id,
          },
        ],
      });
      console.log(`✅ Created 2 comments\n`);
    } else {
      console.log(`✅ Comments already exist, skipping\n`);
    }

    // ============================================
    // 6. CREATE VOTES (Idempotent)
    // ============================================
    console.log('⬆️  Creating votes...');

    // Delete and recreate (safer for unique constraints)
    await prisma.vote.deleteMany({
      where: {
        OR: [
          { userId: users[1].id, startupId: startup1.id },
          { userId: users[2].id, startupId: startup1.id },
          { userId: users[0].id, startupId: startup2.id },
        ],
      },
    });

    await prisma.vote.createMany({
      data: [
        { userId: users[1].id, startupId: startup1.id, value: 1 },
        { userId: users[2].id, startupId: startup1.id, value: 1 },
        { userId: users[0].id, startupId: startup2.id, value: 1 },
      ],
    });

    console.log(`✅ Created/verified 3 votes\n`);

    // ============================================
    // 7. CREATE BOOKMARKS (Idempotent)
    // ============================================
    console.log('🔖 Creating bookmarks...');

    // Delete and recreate
    await prisma.bookmark.deleteMany({
      where: {
        OR: [
          { userId: users[1].id, startupId: startup1.id },
          { userId: users[2].id, startupId: startup1.id },
          { userId: users[2].id, startupId: startup2.id },
        ],
      },
    });

    await prisma.bookmark.createMany({
      data: [
        { userId: users[1].id, startupId: startup1.id },
        { userId: users[2].id, startupId: startup1.id },
        { userId: users[2].id, startupId: startup2.id },
      ],
    });

    console.log(`✅ Created/verified 3 bookmarks\n`);

    // ============================================
    // 8. CREATE FOLLOWS (Idempotent)
    // ============================================
    console.log('👣 Creating follows...');

    // Delete and recreate
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: users[1].id, followingId: users[0].id },
          { followerId: users[2].id, followingId: users[0].id },
          { followerId: users[0].id, followingId: users[1].id },
        ],
      },
    });

    await prisma.follow.createMany({
      data: [
        { followerId: users[1].id, followingId: users[0].id },
        { followerId: users[2].id, followingId: users[0].id },
        { followerId: users[0].id, followingId: users[1].id },
      ],
    });

    console.log(`✅ Created/verified 3 follows\n`);

    // ============================================
    // SUCCESS
    // ============================================
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📊 Seed Data Summary:');
    console.log(`   ├─ Categories: 6`);
    console.log(`   ├─ Tags: 8`);
    console.log(`   ├─ Users: 3`);
    console.log(`   ├─ Startups: 2`);
    console.log(`   ├─ Comments: 2`);
    console.log(`   ├─ Votes: 3`);
    console.log(`   ├─ Bookmarks: 3`);
    console.log(`   └─ Follows: 3\n`);

    console.log('💡 Next steps:');
    console.log(`   1. View data: npx prisma studio`);
    console.log(`   2. Run tests: npm run db:test`);
    console.log(`   3. Start dev: npm run dev\n`);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
