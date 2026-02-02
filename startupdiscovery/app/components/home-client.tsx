"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const accents = [
  "bg-pink-100",
  "bg-indigo-100",
  "bg-orange-100",
  "bg-emerald-100",
  "bg-sky-100",
  "bg-purple-100",
  "bg-yellow-100",
  "bg-rose-100",
];

type StartupRecord = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  views?: number;
  createdAt?: Date | string;
  image?: string;
  author?: {
    _id?: string;
    name?: string;
    username?: string;
  };
};

type HomeClientProps = {
  startups: StartupRecord[];
};

const formatDate = (date?: Date | string) => {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const matchesQuery = (startup: StartupRecord, query: string) => {
  if (!query) return true;
  const target = [
    startup.title,
    startup.description,
    startup.category,
    startup.author?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return target.includes(query);
};

export default function HomeClient({ startups }: HomeClientProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredStartups = useMemo(
    () => startups.filter((startup) => matchesQuery(startup, normalizedQuery)),
    [startups, normalizedQuery]
  );

  return (
    <div className="min-h-screen">
      <section className="hero-stripes">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-14 text-center text-white">
          <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
            Pitch, vote, and grow
          </span>
          <h1 className="mt-6 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
            PITCH YOUR STARTUP, CONNECT WITH ENTREPRENEURS
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Submit ideas, vote on pitches, and get noticed in virtual
            competitions.
          </p>
          <div className="mt-8 flex w-full max-w-xl items-center rounded-full bg-white px-4 py-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="FILTER STARTUPS"
              className="w-full bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              aria-label="Filter startups"
            />
            {query.trim().length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mr-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
              aria-hidden="true"
              tabIndex={-1}
            >
              <span className="text-lg">⌕</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            {normalizedQuery ? "Filtered startups" : "Recommended startups"}
          </h2>
          <Link
            href="/create"
            className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
          >
            Submit pitch
          </Link>
        </div>
        {filteredStartups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            {normalizedQuery
              ? `No startups match "${query.trim()}".`
              : "No startups yet. Submit the first pitch to get started."}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredStartups.map((startup, index) => {
              const authorName = startup.author?.name ?? "Unknown";
              const initials = authorName.charAt(0).toUpperCase();
              const hrefSlug = startup.slug ?? startup._id;
              const accent = accents[index % accents.length];
              const authorProfile = startup.author?._id
                ? `/profile/${startup.author._id}`
                : "/profile";

              return (
                <div
                  key={startup._id}
                  className="card-shadow flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="rounded-full bg-pink-50 px-2 py-1 font-semibold text-pink-500">
                      {formatDate(startup.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-pink-500">
                      <span className="text-base">◦</span> {startup.views ?? 0}
                    </span>
                  </div>
                  <Link
                    href={authorProfile}
                    className="mt-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">{authorName}</p>
                      <h3 className="text-lg font-bold text-zinc-900">
                        {startup.title}
                      </h3>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-zinc-900 text-center text-xs font-bold leading-9 text-white">
                      {initials}
                    </div>
                  </Link>
                  <p className="mt-2 text-xs text-zinc-500">
                    {startup.description}
                  </p>
                  <div
                    className={`mt-4 h-28 rounded-xl overflow-hidden ${!startup.image ? accent : ""}`}
                  >
                    {startup.image ? (
                      startup.image.includes("youtube.com") ||
                      startup.image.includes("youtu.be") ? (
                        <iframe
                          width="100%"
                          height="112"
                          src={
                            startup.image.includes("youtu.be")
                              ? `https://www.youtube.com/embed/${startup.image.split("/").pop()}`
                              : startup.image.replace("watch?v=", "embed/")
                          }
                          title={startup.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          className="h-full w-full"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={startup.image}
                          alt={startup.title}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs font-semibold text-zinc-600">
                          Preview
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>{startup.category}</span>
                    <Link
                      href={`/startup/${hrefSlug}`}
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
