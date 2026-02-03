"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

const navLinkClasses =
  "text-sm font-semibold text-zinc-700 transition hover:text-zinc-950";

type HeaderProps = {
  session: Session | null;
};

export default function Header({ session }: HeaderProps) {
  const user = session?.user;
  const displayName = user?.name ?? "Guest";
  const displayEmail = user?.email ?? "Sign in to personalize";
  const imageUrl = user?.image ?? "";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-zinc-950">
            StartupDiscovery
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/create" className={navLinkClasses}>
            Create
          </Link>
          {session ? (
            <>
              <button
                onClick={() => signOut()}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
              >
                Logout
              </button>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-1.5 hover:border-zinc-300 cursor-pointer"
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-zinc-900">
                    {displayName}
                  </p>
                </div>
              </Link>
            </>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              aria-label="Sign in with GitHub"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.486 2 12.02c0 4.43 2.865 8.19 6.839 9.52.5.093.683-.217.683-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.607.069-.607 1.004.07 1.532 1.033 1.532 1.033.892 1.53 2.341 1.088 2.91.832.09-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.952 0-1.094.39-1.989 1.03-2.689-.104-.254-.447-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.52 9.52 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.748-1.026 2.748-1.026.546 1.377.203 2.393.1 2.647.64.7 1.028 1.595 1.028 2.689 0 3.848-2.338 4.696-4.566 4.944.359.31.678.92.678 1.855 0 1.338-.012 2.418-.012 2.747 0 .268.18.58.688.482A10.022 10.022 0 0 0 22 12.02C22 6.486 17.523 2 12 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
