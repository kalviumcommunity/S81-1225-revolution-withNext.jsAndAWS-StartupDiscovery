import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { connectToDatabase } from "@/lib/mongodb";
import Author from "@/models/author";

type GitHubProfile = {
  id?: number | string;
  login?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }) {
      await connectToDatabase();

      const githubProfile = profile as GitHubProfile | undefined;
      const username = githubProfile?.login ?? user.name ?? "";
      const email = user.email ?? githubProfile?.email ?? "";
      const image = user.image ?? githubProfile?.avatar_url ?? "";

      const filter = email ? { email } : { username };

      await Author.findOneAndUpdate(
        filter,
        {
          id:
            typeof githubProfile?.id === "number"
              ? githubProfile.id
              : githubProfile?.id
              ? Number(githubProfile.id)
              : undefined,
          name: user.name ?? githubProfile?.name ?? username,
          username,
          email,
          image,
          bio: githubProfile?.bio ?? "",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return true;
    },
  },
});