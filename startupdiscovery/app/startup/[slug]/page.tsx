import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/auth";
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
  pitch?: string;
  image?: string;
  author?: {
    name?: string;
    username?: string;
  };
};

type PageProps = {
  params: { slug: string };
};

export default async function StartupDetailsPage({ params }: PageProps) {
  await connectToDatabase();
  const { slug } = await params;
  const session = await auth();
  const sessionEmail = session?.user?.email ?? "";

  const startup = (await Startup.findOne({ slug })
    .populate("author")
    .lean()) as unknown as StartupRecord | null;

  if (!startup) {
    notFound();
  }

  if (sessionEmail) {
    const author = await Author.findOne({ email: sessionEmail });

    if (author) {
      await Playlist.findOneAndUpdate(
        { author: author._id, slug: `visited-${author._id}` },
        {
          author: author._id,
          title: "Visited",
          slug: `visited-${author._id}`,
          $addToSet: { select: startup._id },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  const similar = (await Startup.find({
    _id: { $ne: startup._id },
    category: startup.category,
  })
    .populate("author")
    .limit(3)
    .lean()) as unknown as StartupRecord[];

  const authorName = startup.author?.name ?? "Unknown";
  const authorHandle = startup.author?.username
    ? `@${startup.author.username}`
    : "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="hero-stripes">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-12 text-center text-white">
          <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
            {formatDate(startup.createdAt)}
          </span>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            {startup.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/80 sm:text-base">
            {startup.description}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-10">
        {startup.image ? (
          <div className="card-shadow overflow-hidden rounded-3xl border border-zinc-200">
            {startup.image.includes("youtube.com") ||
            startup.image.includes("youtu.be") ? (
              <iframe
                width="100%"
                height="400"
                src={
                  startup.image.includes("youtu.be")
                    ? `https://www.youtube.com/embed/${startup.image.split("/").pop()}`
                    : startup.image.replace("watch?v=", "embed/")
                }
                title={startup.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={startup.image}
                alt={startup.title}
                className="w-full h-96 object-cover"
              />
            )}
          </div>
        ) : (
          <div className="card-shadow overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900">
            <div className="flex flex-col items-center justify-between gap-6 p-8 text-white md:flex-row">
              <div>
                <p className="text-sm text-white/70">
                  {startup.title}
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {startup.description || "Project Demo"}
                </h2>
                <p className="mt-4 text-xs text-white/60">
                  No image provided
                </p>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-lg font-black text-zinc-900">
                {startup.title.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-900 text-center text-xs font-bold leading-10 text-white">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {authorName}
              </p>
              <p className="text-xs text-zinc-500">{authorHandle}</p>
            </div>
          </div>
          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
            {startup.category}
          </span>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-zinc-900">Pitch details</h3>
          <div className="mt-4 space-y-4 text-sm text-zinc-600">
            {startup.pitch ? (
              <p>{startup.pitch}</p>
            ) : (
              <p>
                Add a pitch to tell the full story behind this startup.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-semibold text-zinc-900">Similar startups</h3>
          {similar.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
              No similar startups yet.
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item, index) => {
                const name = item.author?.name ?? "Unknown";
                const initials = name.charAt(0).toUpperCase();
                const hrefSlug = item.slug ?? item._id;
                const accent = accents[index % accents.length];

                return (
                  <div
                    key={item._id}
                    className="card-shadow flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="rounded-full bg-pink-50 px-2 py-1 font-semibold text-pink-500">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-pink-500">
                        <span className="text-base">◦</span> {item.views ?? 0}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-500">{name}</p>
                        <h3 className="text-lg font-bold text-zinc-900">
                          {item.title}
                        </h3>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-zinc-900 text-center text-xs font-bold leading-9 text-white">
                        {initials}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      {item.description}
                    </p>
                    <div className={`mt-4 h-28 rounded-xl overflow-hidden ${!item.image ? accent : ""}`}>
                      {item.image ? (
                        item.image.includes("youtube.com") ||
                        item.image.includes("youtu.be") ? (
                          <iframe
                            width="100%"
                            height="112"
                            src={
                              item.image.includes("youtu.be")
                                ? `https://www.youtube.com/embed/${item.image.split("/").pop()}`
                                : item.image.replace("watch?v=", "embed/")
                            }
                            title={item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            className="w-full h-full"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
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
                      <span>{item.category}</span>
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
      </main>
    </div>
  );
}
