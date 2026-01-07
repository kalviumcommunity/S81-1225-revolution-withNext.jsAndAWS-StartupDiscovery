/**
 * Loading skeleton for the posts page
 * Displays while data is being fetched
 */

export default function PostsLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 animate-pulse" />
        </div>

        {/* Post Cards Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6"
            >
              {/* Card Header Skeleton */}
              <div className="mb-4">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-2 animate-pulse" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 animate-pulse" />
              </div>

              {/* Card Body Skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 animate-pulse" />
              </div>

              {/* Footer Skeleton */}
              <div className="mt-4 flex gap-2">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded px-3 w-20 animate-pulse" />
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded px-3 w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Message */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            ⏳ Loading posts...
          </p>
        </div>
      </div>
    </main>
  );
}
