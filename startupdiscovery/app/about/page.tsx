import Link from "next/link";

// ✅ Static Site Generation - Never revalidate
export const revalidate = false;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Back to Home
          </Link>
        </div>

        <article className="prose dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            About StartupDiscovery
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Connecting innovators, investors, and entrepreneurs in one platform
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Our Mission
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              StartupDiscovery is a platform designed to bridge the gap between
              innovative startups and the resources they need to succeed. We
              believe every great idea deserves to be discovered, and every
              entrepreneur deserves a chance to shine.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold mb-2">
                  🚀 Startup Showcase
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Present your startup to a global audience of investors,
                  partners, and early adopters
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold mb-2">
                  💡 Discovery Feed
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Explore trending startups across various industries and stages
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold mb-2">
                  🤝 Community Engagement
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Connect with founders, vote on ideas, and participate in
                  discussions
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold mb-2">
                  📊 Analytics & Insights
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Track performance metrics and gain valuable feedback on your
                  startup
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Technology Stack
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              StartupDiscovery is built with modern, enterprise-grade
              technologies to ensure performance, scalability, and reliability:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Next.js 15 App Router</strong> - Hybrid rendering with
                SSG, SSR, and ISR
              </li>
              <li>
                <strong>React 19</strong> - Modern UI with server components
              </li>
              <li>
                <strong>TypeScript</strong> - Type-safe development
              </li>
              <li>
                <strong>Prisma</strong> - Type-safe database ORM
              </li>
              <li>
                <strong>PostgreSQL</strong> - Robust relational database
              </li>
              <li>
                <strong>Redis</strong> - High-performance caching
              </li>
              <li>
                <strong>Docker</strong> - Containerized deployment
              </li>
              <li>
                <strong>GitHub Actions</strong> - Automated CI/CD pipeline
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Rendering Strategy
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              This platform demonstrates advanced Next.js rendering techniques:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Static Generation (SSG) - This Page
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Pre-rendered at build time for maximum performance. Perfect
                  for content that rarely changes.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Incremental Static Regeneration (ISR) - Homepage
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Static with periodic updates (every 60 seconds). Balances
                  performance with freshness.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Server-Side Rendering (SSR) - Dashboard
                </h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Rendered on every request for real-time, user-specific data.
                  Always fresh.
                </p>
              </div>
            </div>
          </section>

          <section className="p-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Join Our Community
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
              Whether you&apos;re a founder looking to showcase your startup, an
              investor seeking the next big opportunity, or an enthusiast
              exploring innovation, StartupDiscovery is your platform.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Explore Startups →
            </Link>
          </section>

          <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              ⚡ This page uses <strong>Static Site Generation (SSG)</strong>
            </p>
            <p className="mt-1">
              Pre-rendered at build time • Zero server load • Lightning fast
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
