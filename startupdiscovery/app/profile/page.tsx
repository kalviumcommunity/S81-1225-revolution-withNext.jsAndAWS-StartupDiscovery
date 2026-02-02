import { auth } from "@/auth";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Author from "@/models/author";
import Playlist from "@/models/playlist";
import Startup from "@/models/startup";

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

const formatDate = (date?: Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type StartupRecord = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  views?: number;
  createdAt?: Date;
  image?: string;
  author?: {
    name?: string;
  };
};

type AuthorRecord = {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  bio?: string;
};

type PlaylistRecord = {
  select?: StartupRecord[];
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  await connectToDatabase();
  const author = (user?.email
    ? await Author.findOne({ email: user.email }).lean()
    : null) as AuthorRecord | null;

  const displayName = author?.name ?? user?.name ?? "Nathan Smith";
  const displayEmail = author?.email ?? user?.email ?? "@nathansmith";
  const displayImage = author?.image ?? user?.image ?? "";
  const displayUsername = author?.username ? `@${author.username}` : "";
  const displayBio = author?.bio ?? "";

  const startups = (author
    ? await Startup.find({ author: author._id })
        .populate("author")
        .sort({ createdAt: -1 })
        .lean()
    : []) as unknown as StartupRecord[];

  const playlist = (author
    ? await Playlist.findOne({ author: author._id, slug: `visited-${author._id}` })
        .populate({ path: "select", populate: { path: "author" } })
        .lean()
    : null) as PlaylistRecord | null;

  const visitedStartups = playlist?.select ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="card-shadow rounded-3xl border border-zinc-200 bg-pink-600 p-6 text-white">
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-900">
              {displayName}
            </div>
            <div className="mt-6 flex items-center justify-center">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImage}
                  alt={displayName}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white text-3xl font-black text-pink-600">
                  {displayName.charAt(0)}
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-sm font-semibold">
              {displayEmail}
            </p>
            <p className="mt-1 text-center text-xs text-white/80">
              {displayUsername || displayBio || "Profile"}
            </p>
            {displayBio ? (
              <p className="mt-3 text-center text-xs text-white/80">
                {displayBio}
              </p>
            ) : null}
          </div>

          <div>
            {startups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
                No startups yet. Submit a pitch to get started.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {startups.map((startup, index) => {
                  const authorName = startup.author?.name ?? displayName;
                  const initials = authorName.charAt(0).toUpperCase();
                  const hrefSlug = startup.slug ?? startup._id;
                  const accent = accents[index % accents.length];

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
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-zinc-500">{authorName}</p>
                          <h3 className="text-lg font-bold text-zinc-900">
                            {startup.title}
                          </h3>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-zinc-900 text-center text-xs font-bold leading-9 text-white">
                          {initials}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        {startup.description}
                      </p>
                      <div className={`mt-4 h-28 rounded-xl overflow-hidden ${!startup.image ? accent : ""}`}>
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
                              className="w-full h-full"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={startup.image}
                              alt={startup.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
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

            <div className="mt-10">
              <h3 className="text-sm font-semibold text-zinc-900">
                Visited startups
              </h3>
              {visitedStartups.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
                  No visited startups yet.
                </div>
              ) : (
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visitedStartups.map((startup, index) => {
                    const authorName = startup.author?.name ?? displayName;
                    const initials = authorName.charAt(0).toUpperCase();
                    const hrefSlug = startup.slug ?? startup._id;
                    const accent = accents[index % accents.length];

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
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-500">{authorName}</p>
                            <h3 className="text-lg font-bold text-zinc-900">
                              {startup.title}
                            </h3>
                          </div>
                          <div className="h-9 w-9 rounded-full bg-zinc-900 text-center text-xs font-bold leading-9 text-white">
                            {initials}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                          {startup.description}
                        </p>
                        <div className={`mt-4 h-28 rounded-xl overflow-hidden ${!startup.image ? accent : ""}`}>
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
                                className="w-full h-full"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={startup.image}
                                alt={startup.title}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
