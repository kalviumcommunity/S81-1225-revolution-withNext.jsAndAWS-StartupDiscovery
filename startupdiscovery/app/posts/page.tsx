/**
 * Posts page with data fetching
 * Demonstrates how loading.tsx and error.tsx integrate with page.tsx
 *
 * Error Simulation:
 * - Add ?error=true to URL to trigger error boundary
 * - Simulates 2-second delay by default to show loading skeleton
 */

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  timestamp: string;
}

async function fetchPosts(shouldError: boolean = false): Promise<Post[]> {
  // Simulate network delay to show loading skeleton
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate error condition
  if (shouldError) {
    throw new Error(
      "Failed to fetch posts. The server encountered an unexpected error. Please try again."
    );
  }

  // Return mock posts data
  return [
    {
      id: 1,
      title: "Getting Started with Next.js",
      body: "Learn how to build fast, scalable web applications with Next.js and React. This comprehensive guide covers everything from setup to deployment.",
      userId: 1,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "Building Error & Loading States",
      body: "Proper error and loading states are crucial for good user experience. Learn how to implement them using Next.js App Router's loading.js and error.js files.",
      userId: 2,
      timestamp: "4 hours ago",
    },
    {
      id: 3,
      title: "Responsive Design Best Practices",
      body: "Create applications that work beautifully on any device. Explore mobile-first design, flexible layouts, and accessible components.",
      userId: 3,
      timestamp: "1 day ago",
    },
    {
      id: 4,
      title: "Form Validation with Zod & React Hook Form",
      body: "Master client-side form validation with type-safe schemas. Learn how to provide real-time feedback and prevent invalid submissions.",
      userId: 1,
      timestamp: "2 days ago",
    },
  ];
}

export const metadata = {
  title: "Posts | Startup Discovery",
  description: "Browse posts about web development and startup tips",
};

interface PostsPageProps {
  searchParams: { error?: string };
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  // Check if error simulation is requested
  const shouldError = searchParams.error === "true";
  const posts = await fetchPosts(shouldError);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📚 Posts</h1>
          <p className="text-blue-100">
            Discover insights about web development and startup growth
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Info Banner */}
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✅ Posts loaded successfully! Try adding{" "}
              <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">
                ?error=true
              </code>{" "}
              to the URL to see the error state.
            </p>
          </div>

          {/* Posts Grid */}
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-lg dark:shadow-neutral-800 transition-shadow"
              >
                {/* Post Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Posted {post.timestamp}
                  </p>
                </div>

                {/* Post Body */}
                <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                  {post.body}
                </p>

                {/* Post Footer */}
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium">
                    👍 Like
                  </button>
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
                    💬 Comment
                  </button>
                  <button className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
                    🔖 Save
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Load More Posts
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
