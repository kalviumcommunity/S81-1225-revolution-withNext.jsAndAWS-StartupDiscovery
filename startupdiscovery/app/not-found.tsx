import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you&apos;re looking for doesn&apos;t exist.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-red-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          Sorry, the page you&apos;re looking for doesn&apos;t exist. It might
          have been moved or deleted.
        </p>

        <div className="space-y-4">
          <p className="text-gray-600">Here are some helpful links instead:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go Home
            </Link>
            <Link
              href="/users"
              className="px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition"
            >
              Browse Users
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Error Code: 404 | Resource Not Found
          </p>
        </div>
      </div>
    </main>
  );
}
