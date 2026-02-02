import { connectToDatabase } from "@/lib/mongodb";
import Startup from "@/models/startup";
import HomeClient from "@/app/components/home-client";

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

export default async function Home() {
  await connectToDatabase();
  const startups = (await Startup.find()
    .populate("author")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()) as unknown as StartupRecord[];

  const plainStartups = JSON.parse(
    JSON.stringify(startups)
  ) as StartupRecord[];

  return <HomeClient startups={plainStartups} />;
}
