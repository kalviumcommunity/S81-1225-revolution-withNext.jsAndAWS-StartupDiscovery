/**
 * Database Connection Test Script
 *
 * This script verifies that Prisma is correctly configured and can connect
 * to the PostgreSQL database. It performs several test queries to validate
 * the setup.
 *
 * Usage:
 *   npx tsx scripts/test-db.ts
 */

import prisma from "../lib/prisma";

type SampleUser = {
  id: string | number;
  username: string | null;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: {
    startups: number;
    comments: number;
  };
};

type StartupWithRelations = {
  title: string;
  stage: string;
  slug: string;
  user: {
    id: string | number;
    username: string | null;
    name: string | null;
  };
  categories: { category: { name: string; slug: string } }[];
  tags: { tag: { name: string } }[];
  _count: {
    comments: number;
    votes: number;
    bookmarks: number;
  };
  viewCount: number;
};

type CategoryWithCount = {
  name: string;
  slug: string;
  _count: {
    startups: number;
  };
};

type RecentComment = {
  content: string;
  user: {
    username: string;
  };
  startup: {
    title: string;
  };
};

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...\n");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    // ============================================
    // Test 1: Check Connection
    // ============================================
    console.log("Test 1: Connecting to database...");
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL database\n");

    // ============================================
    // Test 2: Database Statistics
    // ============================================
    console.log("Test 2: Fetching database statistics...");

    const [
      userCount,
      startupCount,
      categoryCount,
      tagCount,
      commentCount,
      voteCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.startup.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.comment.count(),
      prisma.vote.count(),
    ]);

    console.log("📊 Database Statistics:");
    console.log("   ├─ Users:      ", userCount.toString().padStart(3));
    console.log("   ├─ Startups:   ", startupCount.toString().padStart(3));
    console.log("   ├─ Categories: ", categoryCount.toString().padStart(3));
    console.log("   ├─ Tags:       ", tagCount.toString().padStart(3));
    console.log("   ├─ Comments:   ", commentCount.toString().padStart(3));
    console.log("   └─ Votes:      ", voteCount.toString().padStart(3));
    console.log("");

    // ============================================
    // Test 3: Fetch Sample Users
    // ============================================
    console.log("Test 3: Fetching sample users...");

    const users: SampleUser[] = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            startups: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("👥 Sample Users:");
    if (users.length === 0) {
      console.log("   ⚠️  No users found in database");
    } else {
      users.forEach((user, index) => {
        const prefix = index === users.length - 1 ? "└─" : "├─";
        console.log(`   ${prefix} ${user.username} (${user.role})`);
        console.log(`      Email: ${user.email}`);
        console.log(
          `      Startups: ${user._count.startups}, Comments: ${user._count.comments}`
        );
      });
    }
    console.log("");

    // ============================================
    // Test 4: Fetch Startups with Relations
    // ============================================
    console.log("Test 4: Fetching startups with relations...");

    const startups: StartupWithRelations[] = await prisma.startup.findMany({
      take: 3,
      where: {
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
          take: 3,
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        voteCount: "desc",
      },
    });

    console.log("🚀 Sample Startups (Published):");
    if (startups.length === 0) {
      console.log("   ⚠️  No published startups found");
    } else {
      startups.forEach((startup, index) => {
        const prefix = index === startups.length - 1 ? "└─" : "├─";
        console.log(`   ${prefix} ${startup.title} (${startup.stage})`);
        console.log(`      By: ${startup.user.name || startup.user.username}`);
        console.log(`      Slug: ${startup.slug}`);

        const categories = startup.categories
          .map((sc) => sc.category.name)
          .join(", ");
        console.log(`      Categories: ${categories || "None"}`);

        const tags = startup.tags.map((st) => st.tag.name).join(", ");
        console.log(`      Tags: ${tags || "None"}`);

        console.log(
          `      Engagement: ${startup._count.votes} votes, ${startup._count.comments} comments, ${startup._count.bookmarks} bookmarks`
        );
        console.log(`      Views: ${startup.viewCount}`);
      });
    }
    console.log("");

    // ============================================
    // Test 5: Complex Aggregation Query
    // ============================================
    console.log("Test 5: Running aggregation queries...");

    const stats = await prisma.startup.aggregate({
      _avg: {
        voteCount: true,
        viewCount: true,
      },
      _max: {
        voteCount: true,
        viewCount: true,
      },
      _min: {
        voteCount: true,
      },
      _count: true,
    });

    console.log("📈 Startup Metrics:");
    console.log("   ├─ Total Startups:    ", stats._count);
    console.log(
      "   ├─ Avg Votes:         ",
      stats._avg.voteCount?.toFixed(1) || 0
    );
    console.log(
      "   ├─ Avg Views:         ",
      stats._avg.viewCount?.toFixed(1) || 0
    );
    console.log("   ├─ Max Votes:         ", stats._max.voteCount || 0);
    console.log("   └─ Max Views:         ", stats._max.viewCount || 0);
    console.log("");

    // ============================================
    // Test 6: Check Categories
    // ============================================
    console.log("Test 6: Fetching categories...");

    const categories: CategoryWithCount[] = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            startups: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("📁 Categories:");
    if (categories.length === 0) {
      console.log("   ⚠️  No categories found");
    } else {
      categories.forEach((category, index) => {
        const prefix = index === categories.length - 1 ? "└─" : "├─";
        console.log(`   ${prefix} ${category.name} (${category.slug})`);
        console.log(`      Startups: ${category._count.startups}`);
      });
    }
    console.log("");

    // ============================================
    // Test 7: Type-Safe Query Examples
    // ============================================
    console.log("Test 7: Demonstrating type-safe queries...");

    // Find user by unique field
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@startupdiscovery.com" },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (adminUser) {
      console.log("🔐 Admin User Found:");
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log("⚠️  Admin user not found");
    }
    console.log("");

    // ============================================
    // Test 8: Recent Activity
    // ============================================
    console.log("Test 8: Fetching recent activity...");

    const recentComments: RecentComment[] = await prisma.comment.findMany({
      take: 3,
      include: {
        user: {
          select: {
            username: true,
          },
        },
        startup: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("💬 Recent Comments:");
    if (recentComments.length === 0) {
      console.log("   ⚠️  No comments found");
    } else {
      recentComments.forEach((comment, index) => {
        const prefix = index === recentComments.length - 1 ? "└─" : "├─";
        const preview =
          comment.content.substring(0, 60) +
          (comment.content.length > 60 ? "..." : "");
        console.log(
          `   ${prefix} ${comment.user.username} on "${comment.startup.title}"`
        );
        console.log(`      "${preview}"`);
      });
    }
    console.log("");

    // ============================================
    // Success Summary
    // ============================================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ ALL TESTS PASSED!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("");
    console.log("Your Prisma setup is working correctly!");
    console.log("");
    console.log("Next steps:");
    console.log('  1. Run "npx prisma studio" to view data in browser');
    console.log("  2. Use Prisma Client in your API routes");
    console.log('  3. Add more seed data with "npx prisma db seed"');
    console.log("");
  } catch (error) {
    console.log("═══════════════════════════════════════════════════════════");
    console.error("❌ DATABASE CONNECTION FAILED");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("");

    if (error instanceof Error) {
      console.error("Error:", error.message);
      console.log("");

      // Provide helpful troubleshooting tips
      console.log("Troubleshooting tips:");
      console.log("  1. Check your DATABASE_URL in .env file");
      console.log("  2. Ensure PostgreSQL is running");
      console.log('  3. Run "npx prisma migrate dev" to create tables');
      console.log('  4. Run "npx prisma db seed" to populate data');
      console.log("  5. Verify database credentials are correct");
      console.log("");
    }

    process.exit(1);
  } finally {
    // Always disconnect from database
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
    console.log("");
  }
}

// Run the test
testDatabaseConnection();
