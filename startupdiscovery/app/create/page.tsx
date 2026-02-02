"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createStartup } from "@/app/actions/startup";

export default function CreatePitchPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createStartup(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create startup");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="hero-stripes">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-14 text-center text-white">
          <h1 className="text-2xl font-black sm:text-3xl">
            SUBMIT YOUR STARTUP PITCH
          </h1>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-10">
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-zinc-700">TITLE</label>
            <input
              name="title"
              required
              className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              placeholder="JSM Academy Masterclass"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">
              DESCRIPTION
            </label>
            <textarea
              name="description"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              rows={4}
              placeholder="Short description of your startup idea"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">CATEGORY</label>
            <input
              name="category"
              required
              className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              placeholder="Choose a category (e.g., Tech, Health, Education, etc.)"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">
              IMAGE/VIDEO LINK
            </label>
            <input
              name="image"
              type="url"
              className="mt-2 w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              placeholder="Paste a link to your demo or promotional media"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700">PITCH</label>
            <div className="mt-2 rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-2 text-xs text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-2 py-1 font-semibold">
                  Heading
                </span>
                <span className="font-semibold">B</span>
                <span className="italic">I</span>
                <span className="underline">U</span>
                <span>•</span>
                <span>≡</span>
                <span>☰</span>
                <span>🔗</span>
              </div>
              <textarea
                name="pitch"
                className="w-full rounded-b-2xl px-4 py-3 text-sm text-zinc-900 outline-none"
                rows={7}
                placeholder="Briefly describe your idea and what problem it solves"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? "SUBMITTING..." : "SUBMIT YOUR PITCH →"}
          </button>
        </form>
      </main>
    </div>
  );
}
