"use client";

import { useState } from "react";
import { mutate } from "swr";

interface AddUserProps {
  onUserAdded?: () => void;
}

export default function AddUser({ onUserAdded }: AddUserProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimisticId, setOptimisticId] = useState<number | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const tempId = Date.now();
      setOptimisticId(tempId);

      // Optimistic update - show user immediately
      const newUser = { id: tempId, name, email };
      mutate(
        "/api/users",
        async (currentUsers) => {
          return [...(currentUsers || []), newUser];
        },
        false
      );

      // Actual API call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      // Revalidate data from server
      await mutate("/api/users");
      setName("");
      setEmail("");
      onUserAdded?.();

      console.log("✅ User added successfully (optimistic update confirmed)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
      // Revert optimistic update on error
      await mutate("/api/users");
      console.error("❌ Error adding user:", err);
    } finally {
      setIsLoading(false);
      setOptimisticId(null);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white border border-gray-200 rounded">
      <h2 className="font-bold mb-4">Add New User</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddUser} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user name"
            className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || !email}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? "Adding..." : "Add User"}
        </button>

        {optimisticId && (
          <p className="text-sm text-green-700">
            ✨ Optimistic update: User {name} shown instantly, syncing with
            server...
          </p>
        )}
      </form>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        <strong>Optimistic UI Demo:</strong> The new user appears immediately in
        the list while the request is being sent. This gives instant feedback
        without waiting for the server.
      </div>
    </div>
  );
}
