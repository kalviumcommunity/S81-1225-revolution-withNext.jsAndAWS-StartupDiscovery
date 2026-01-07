"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  followers: number;
  startups: number;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Founder",
    followers: 342,
    startups: 2,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Investor",
    followers: 521,
    startups: 0,
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol@example.com",
    role: "Founder",
    followers: 187,
    startups: 1,
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david@example.com",
    role: "Advisor",
    followers: 892,
    startups: 0,
  },
  {
    id: 5,
    name: "Emma White",
    email: "emma@example.com",
    role: "Founder",
    followers: 456,
    startups: 3,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching users
    const loadUsers = async () => {
      setUsers(mockUsers);
      setIsLoading(false);
    };
    loadUsers();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[{ label: "Users", href: "/users" }]} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Users
          </h1>
          <p className="text-gray-600">
            Explore {users.length} members of the Startup Discovery community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h2>
                  <p className="text-blue-600 text-sm">{user.role}</p>
                </div>
                <div className="text-3xl">👤</div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{user.email}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Followers</span>
                  <span className="font-semibold text-gray-900">
                    {user.followers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Startups</span>
                  <span className="font-semibold text-gray-900">
                    {user.startups}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View Profile →
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
