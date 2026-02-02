"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Author from "@/models/author";
import Startup from "@/models/startup";
import { redirect } from "next/navigation";

export async function createStartup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const image = formData.get("image")?.toString().trim();
  const pitch = formData.get("pitch")?.toString().trim();

  if (!title || !category) {
    throw new Error("Title and category are required");
  }

  await connectToDatabase();

  // Find the author by email (GitHub data stored on sign-in)
  const author = await Author.findOne({ email: session.user.email });

  if (!author) {
    throw new Error("Author not found");
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Create the startup
  const startup = await Startup.create({
    title,
    slug,
    description,
    category,
    image: image || "",
    pitch,
    author: author._id,
    views: 0,
  });

  redirect(`/startup/${startup.slug}`);
}
