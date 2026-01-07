"use client";

/**
 * Error boundary for the posts page
 * Catches and displays errors that occur during data fetching
 * Provides user-friendly error message and retry functionality
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PostsError({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900 px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-6xl mb-6 text-center">❌</div>

        {/* Error Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Oops! Something Went Wrong
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            We encountered an error while loading the posts. This is usually
            temporary.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <p className="text-xs font-mono text-red-700 dark:text-red-300 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Helpful Tips */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
              💡 What You Can Try:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
              <li>• Click &quot;Try Again&quot; to retry the request</li>
              <li>• Check your internet connection</li>
              <li>• Refresh the page manually</li>
              <li>• Try again in a few moments</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🔄 Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-semibold"
          >
            ← Go Home
          </button>
        </div>

        {/* Support Message */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-6">
          If the problem persists, please contact support or try again later.
        </p>
      </div>
    </main>
  );
}
