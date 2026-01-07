"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";
import AddUser from "./AddUser";

interface User {
  id: string | number;
  name: string;
  email: string;
}

export default function UsersPage() {
  const { data, error, isLoading, mutate } = useSWR<User[]>(
    "/api/users",
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 2000);
      },
    }
  );

  const [cacheStatus, setCacheStatus] = useState<string>("");

  const checkCacheStatus = () => {
    if (data) {
      setCacheStatus("✅ Cache HIT - Data served from cache");
    } else if (isLoading) {
      setCacheStatus("⏳ Cache MISS - Fetching from server...");
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">User List</h1>
      <p className="text-gray-600 mb-4">
        Client-side data fetching with SWR caching and revalidation
      </p>

      {/* Cache Status Indicator */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">
          <strong>SWR Config:</strong> Auto-revalidate on focus + every 10s
        </p>
        {cacheStatus && (
          <p className="text-sm text-blue-900 mt-2">{cacheStatus}</p>
        )}
        <button
          onClick={checkCacheStatus}
          className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Check Cache Status
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">
            ❌ Failed to load users: {error.message}
          </p>
          <button
            onClick={() => mutate()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">⏳ Loading users...</p>
        </div>
      )}

      {/* Users List */}
      {data && (
        <>
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700">
              ✅ Loaded {data.length} user(s) from cache/server
            </p>
          </div>

          {data.length === 0 ? (
            <p className="text-gray-500">No users found. Add one below!</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {data.map((user) => (
                <li
                  key={user.id}
                  className="p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Add User Component */}
      <AddUser onUserAdded={() => mutate()} />

      {/* Documentation */}
      <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
        <h2 className="font-bold mb-2">SWR Behavior:</h2>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>
            • <strong>Cache Hit:</strong> Returns data instantly from cache
          </li>
          <li>
            • <strong>Cache Miss:</strong> First load, fetches from server
          </li>
          <li>
            • <strong>Revalidation:</strong> Auto-refresh on focus & every 10s
          </li>
          <li>
            • <strong>Optimistic Update:</strong> Instant UI update before API
            response
          </li>
        </ul>
      </div>
    </main>
  );
}
