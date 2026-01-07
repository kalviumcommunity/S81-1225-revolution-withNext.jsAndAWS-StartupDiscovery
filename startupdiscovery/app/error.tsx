"use client";

/**
 * Global error boundary for the entire application
 * Catches unhandled errors that occur anywhere in the app
 * This is the root-level error.tsx file
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-neutral-900">
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-6">⚠️</div>

            {/* Error Content */}
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Application Error
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              A critical error occurred. The application team has been notified.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                <p className="text-xs font-mono text-red-700 dark:text-red-300 break-words">
                  {error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-semibold"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
