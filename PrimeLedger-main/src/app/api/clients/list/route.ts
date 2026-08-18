import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      clients,
    });
  } catch (error) {
    console.error("GET_CLIENTS_ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load clients.",
      },
      {
        status: 500,
      }
    );
  }
}