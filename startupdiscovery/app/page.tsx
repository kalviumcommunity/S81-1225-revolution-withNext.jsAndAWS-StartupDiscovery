import Link from 'next/link';
// import prisma from '@/lib/prisma';

// ✅ Hybrid Rendering (ISR) - Revalidate every 60 seconds
export const revalidate = 60;

interface Startup {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  voteCount: number;
  viewCount: number;
  industry: string;
  stage: string;
  featured: boolean;
  publishedAt: Date | null;
  user: {
    name: string | null;
    username: string;
  };
}

async function getStartups(): Promise<Startup[]> {
  // Temporarily return empty array to avoid database requirement
  // Database configuration needed for full functionality
  return [];
  
  /* Uncomment when DATABASE_URL is configured
  try {
    const startups = await prisma.startup.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: [{ featured: 'desc' }, { voteCount: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        voteCount: true,
        viewCount: true,
        industry: true,
        stage: true,
        featured: true,
        publishedAt: true,
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });
    return startups;
  } catch (error) {
    console.error('Failed to fetch startups:', error);
    return [];
  }
  */
}

export default async function Home() {
  const startups = await getStartups();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            🚀 StartupDiscovery
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Discover innovative startups, connect with founders, and explore the next big ideas
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/about"
              className="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Learn More
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Startup Listings */}
        {startups.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">
              No startups available yet. Start Docker and run database migrations to see data.
            </p>
            <code className="mt-4 block text-sm text-zinc-600 dark:text-zinc-400">
              docker-compose up -d &amp;&amp; npm run prisma:migrate &amp;&amp; npm run prisma:seed
            </code>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {startups.map((startup) => (
              <Link
                key={startup.id}
                href={`/startups/${startup.slug}`}
                className="block p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {startup.title}
                      </h2>
                      {startup.featured && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {startup.tagline}
                    </p>
                  </div>
                  <div className="flex flex-col items-center ml-4">
                    <div className="text-2xl">▲</div>
                    <div className="text-sm font-semibold">{startup.voteCount}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {startup.industry}
                    </span>
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {startup.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>👁 {startup.viewCount}</span>
                    <span>by @{startup.user.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ISR Indicator */}
        <div className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            ⚡ This page uses <strong>Incremental Static Regeneration (ISR)</strong>
          </p>
          <p className="mt-1">Data refreshes every 60 seconds automatically</p>
        </div>
      </main>
    </div>
  );
}
