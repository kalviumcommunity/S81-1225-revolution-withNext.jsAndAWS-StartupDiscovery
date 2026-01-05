import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-6">
          Startup Not Found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          The startup you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          Browse All Startups →
        </Link>
      </div>
    </div>
  );
}
