import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

// ISR with 5 minute revalidation for startup details
export const revalidate = 300;

interface StartupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getStartup(slug: string) {
  try {
    const startup = await prisma.startup.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        team: true,
        milestones: {
          orderBy: { order: "asc" },
        },
        comments: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    // Increment view count (in production, this would be handled better)
    if (startup) {
      await prisma.startup.update({
        where: { id: startup.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return startup;
  } catch (error) {
    console.error("Failed to fetch startup:", error);
    return null;
  }
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { slug } = await params;
  const startup = await getStartup(slug);

  if (!startup) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Back to Startups
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                {startup.title}
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                {startup.tagline}
              </p>
            </div>
            <div className="flex flex-col items-center ml-8 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="text-3xl mb-1">▲</div>
              <div className="text-2xl font-bold">{startup.voteCount}</div>
              <div className="text-xs text-zinc-500">votes</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {startup.featured && (
              <span className="px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                ⭐ Featured
              </span>
            )}
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {startup.industry}
            </span>
            <span className="px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              {startup.stage}
            </span>
            {startup.location && (
              <span className="px-3 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                📍 {startup.location}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span>👁 {startup.viewCount} views</span>
            <span>💬 {startup._count.comments} comments</span>
            <span>🔖 {startup._count.bookmarks} bookmarks</span>
            {startup.publishedAt && (
              <span>
                Published {new Date(startup.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-12 p-8 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            About {startup.title}
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {startup.description}
            </p>
          </div>
          {startup.websiteUrl && (
            <a
              href={startup.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Visit Website →
            </a>
          )}
        </div>

        {/* Team */}
        {startup.team.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Team
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {startup.team.map(
                (
                  member: {
                    id: number;
                    name: string;
                    role: string;
                    bio: string | null;
                  },
                  index: number
                ) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {member.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {member.bio}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Milestones */}
        {startup.milestones.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Milestones
            </h2>
            <div className="space-y-4">
              {startup.milestones.map(
                (milestone: {
                  id: number;
                  title: string;
                  achievedAt: Date | null;
                }) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="text-2xl">
                      {milestone.achievedAt ? "✅" : "⏳"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {milestone.title}
                      </h3>
                      {milestone.achievedAt && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Achieved{" "}
                          {new Date(milestone.achievedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Founder Info */}
        <div className="mb-12 p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            About the Founder
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-2xl relative overflow-hidden">
              {startup.user.avatarUrl ? (
                <Image
                  src={startup.user.avatarUrl}
                  alt={startup.user.name || startup.user.username}
                  fill
                  className="object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {startup.user.name || startup.user.username}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                @{startup.user.username}
              </p>
              {startup.user.bio && (
                <p className="text-zinc-700 dark:text-zinc-300">
                  {startup.user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
            Comments ({startup._count.comments})
          </h2>
          {startup.comments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-zinc-500 dark:text-zinc-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {startup.comments.map(
                (comment: {
                  id: number;
                  content: string;
                  createdAt: Date;
                  user: { name: string | null; username: string };
                }) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {comment.user.name || comment.user.username}
                          </span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            @{comment.user.username}
                          </span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            • {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ISR Notice */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-12 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p>
            ⚡ This page uses{" "}
            <strong>Incremental Static Regeneration (ISR)</strong>
          </p>
          <p className="mt-1">Revalidates every 5 minutes for fresh content</p>
        </div>
      </main>
    </div>
  );
}
