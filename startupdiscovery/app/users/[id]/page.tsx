"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  bio: string;
  followers: number;
  following: number;
  startups: number;
  joinDate: string;
  location: string;
}

const mockUserProfiles: Record<string, UserProfile> = {
  "1": {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Founder",
    bio: "Building innovative solutions for the modern world. Passionate about startups and technology.",
    followers: 342,
    following: 89,
    startups: 2,
    joinDate: "2023-01-15",
    location: "San Francisco, CA",
  },
  "2": {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Investor",
    bio: "Investing in early-stage startups with great potential. Always looking for the next big thing.",
    followers: 521,
    following: 156,
    startups: 0,
    joinDate: "2022-06-20",
    location: "New York, NY",
  },
  "3": {
    id: 3,
    name: "Carol Davis",
    email: "carol@example.com",
    role: "Founder",
    bio: "Entrepreneur and tech enthusiast. Building startups that make a difference.",
    followers: 187,
    following: 42,
    startups: 1,
    joinDate: "2023-09-10",
    location: "Austin, TX",
  },
  "4": {
    id: 4,
    name: "David Wilson",
    email: "david@example.com",
    role: "Advisor",
    bio: "Experienced advisor helping startups navigate growth and scaling challenges.",
    followers: 892,
    following: 234,
    startups: 0,
    joinDate: "2022-01-05",
    location: "Boston, MA",
  },
  "5": {
    id: 5,
    name: "Emma White",
    email: "emma@example.com",
    role: "Founder",
    bio: "Multi-startup founder with expertise in product development and user experience.",
    followers: 456,
    following: 123,
    startups: 3,
    joinDate: "2022-11-30",
    location: "Seattle, WA",
  },
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Simulate fetching user data
    const loadUser = async () => {
      const userData = mockUserProfiles[userId];
      if (userData) {
        setUser(userData);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };
    loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </main>
    );
  }

  if (notFound || !user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Breadcrumbs
          items={[
            { label: "Users", href: "/users" },
            { label: "Not Found", href: "#" },
          ]}
        />

        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              User Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The user with ID {userId} does not exist.
            </p>
            <Link
              href="/users"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const joinDateFormatted = new Date(user.joinDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Breadcrumbs
        items={[
          { label: "Users", href: "/users" },
          { label: user.name, href: `/users/${userId}` },
        ]}
      />

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="text-6xl">👤</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user.name}
              </h1>
              <div className="flex gap-4 mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {user.role}
                </span>
                <span className="text-gray-600">📍 {user.location}</span>
              </div>
              <p className="text-gray-700 text-lg mb-4">{user.bio}</p>
              <p className="text-gray-600 text-sm">
                Joined {joinDateFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {user.followers.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Followers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {user.following.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">Following</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {user.startups}
            </div>
            <div className="text-gray-600 text-sm">Startups</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">★ 4.8</div>
            <div className="text-gray-600 text-sm">Rating</div>
          </div>
        </div>

        {/* Contact and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 min-w-[100px]">Email:</span>
              <span className="text-gray-900 font-semibold">{user.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 min-w-[100px]">Location:</span>
              <span className="text-gray-900 font-semibold">
                {user.location}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Follow
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition">
              Message
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/users"
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
          >
            ← Back to Users
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
