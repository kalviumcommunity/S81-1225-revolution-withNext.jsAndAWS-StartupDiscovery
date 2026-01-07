"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      // Mock user data (in real app, would fetch from API)
      setUser({
        name: "John Doe",
        email: "john@example.com",
        role: "Founder",
      });
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }]} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm">Total Views</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">2,543</div>
            <div className="text-green-600 text-sm mt-2">
              +12% from last week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm">Total Votes</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">1,284</div>
            <div className="text-green-600 text-sm mt-2">
              +8% from last week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm">Followers</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">342</div>
            <div className="text-green-600 text-sm mt-2">
              +5% from last week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm">Featured</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">Yes</div>
            <div className="text-blue-600 text-sm mt-2">
              You&apos;re featured! 🌟
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/startups/create"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold text-gray-900">Create Startup</div>
            </Link>
            <Link
              href="/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-gray-900">Browse Users</div>
            </Link>
            <Link
              href="/profile"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold text-gray-900">Edit Profile</div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            User Profile
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Name</span>
              <span className="font-semibold text-gray-900">{user?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Role</span>
              <span className="font-semibold text-gray-900">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
