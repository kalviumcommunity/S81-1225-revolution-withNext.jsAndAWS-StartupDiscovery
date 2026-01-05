/**
 * Quick Setup Verification Script
 *
 * This script provides a simple way to verify your Prisma setup
 * and see basic query examples.
 *
 * Usage:
 *   npx tsx scripts/quick-test.ts
 */

import prisma from "../lib/prisma";

async function quickTest() {
  console.log("🚀 Prisma Quick Test\n");

  try {
    // Simple connection test
    await prisma.$connect();
    console.log("✅ Database connection successful!\n");

    // Count records
    const userCount = await prisma.user.count();
    const startupCount = await prisma.startup.count();

    console.log(`Found ${userCount} users and ${startupCount} startups\n`);

    // Fetch first user
    const firstUser = await prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (firstUser) {
      console.log("Sample User:");
      console.log(firstUser);
      console.log("");
    }

    // Fetch first startup with relations
    const firstStartup = await prisma.startup.findFirst({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (firstStartup) {
      console.log("Sample Startup:");
      console.log({
        id: firstStartup.id,
        title: firstStartup.title,
        slug: firstStartup.slug,
        author: firstStartup.user.username,
        comments: firstStartup._count.comments,
        votes: firstStartup._count.votes,
      });
      console.log("");
    }

    console.log("✅ All queries executed successfully!");
    console.log("\nPrisma is working correctly! 🎉\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
