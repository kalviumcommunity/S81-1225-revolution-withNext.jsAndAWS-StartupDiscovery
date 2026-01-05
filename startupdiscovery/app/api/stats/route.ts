import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalStartups, publishedStartups, totalUsers, totalVotes] =
      await Promise.all([
        prisma.startup.count(),
        prisma.startup.count({ where: { status: "PUBLISHED" } }),
        prisma.user.count(),
        prisma.vote.count(),
      ]);

    const topStartups = await prisma.startup.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { voteCount: "desc" },
      take: 5,
      select: {
        title: true,
        slug: true,
        voteCount: true,
        viewCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalStartups,
          publishedStartups,
          totalUsers,
          totalVotes,
        },
        topStartups,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
