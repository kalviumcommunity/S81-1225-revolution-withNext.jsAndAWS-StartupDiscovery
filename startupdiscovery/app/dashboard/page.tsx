import Link from 'next/link';
import prisma from '@/lib/prisma';

// ✅ Server-Side Rendering (SSR) - Always dynamic, no caching
export const dynamic = 'force-dynamic';

async function getUserStats() {
  try {
    // In a real app, this would use authentication to get the current user
    // For demo purposes, we'll fetch stats for all users
    const [totalStartups, totalUsers, totalVotes, recentStartups] = await Promise.all([
      prisma.startup.count(),
      prisma.user.count(),
      prisma.vote.count(),
      prisma.startup.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          voteCount: true,
          viewCount: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalStartups,
      totalUsers,
      totalVotes,
      recentStartups,
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return {
      totalStartups: 0,
      totalUsers: 0,
      totalVotes: 0,
      recentStartups: [],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getUserStats();
  const currentTime = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Real-time platform statistics and activity
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Last updated: <strong>{currentTime}</strong>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Startups</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.totalStartups}
                </p>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Votes</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.totalVotes}
                </p>
              </div>
              <div className="text-4xl">▲</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
            Recent Startups
          </h2>
          {stats.recentStartups.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                No startups yet. Start Docker and seed the database to see data.
              </p>
              <code className="mt-4 block text-sm text-zinc-600 dark:text-zinc-400">
                docker-compose up -d &amp;&amp; npm run prisma:seed
              </code>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentStartups.map((startup: { id: number; title: string; slug: string; status: string; voteCount: number; viewCount: number; createdAt: Date }) => (
                <div
                  key={startup.id}
                  className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <Link
                      href={`/startups/${startup.slug}`}
                      className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {startup.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          startup.status === 'PUBLISHED'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {startup.status}
                      </span>
                      <span>👁 {startup.viewCount} views</span>
                      <span>▲ {startup.voteCount} votes</span>
                      <span>
                        Created: {new Date(startup.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SSR Info Panel */}
        <div className="p-8 bg-purple-50 dark:bg-purple-950 rounded-xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
            ⚡ Server-Side Rendering (SSR)
          </h3>
          <div className="space-y-2 text-purple-800 dark:text-purple-200">
            <p>
              <strong>This page uses SSR</strong> - rendered fresh on every request
            </p>
            <p>✅ Always shows the most up-to-date data</p>
            <p>✅ Perfect for user-specific dashboards and real-time data</p>
            <p>✅ No stale cache - you always see current statistics</p>
            <p className="pt-2 text-sm">
              Refresh this page to see the timestamp update - each request fetches fresh data
              from the database
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Browse Startups
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  );
}
