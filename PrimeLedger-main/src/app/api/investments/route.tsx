import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ investments });
  } catch (error) {
    console.error("GET_INVESTMENTS_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load investments." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      minimumAmount,
      expectedROI,
      durationDays,
      totalCapacity,
      status,
    } = body;

    if (
      !title ||
      !description ||
      !minimumAmount ||
      !expectedROI ||
      !durationDays ||
      !totalCapacity
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const investment = await prisma.investment.create({
      data: {
        title,
        description,
        minimumAmount: String(minimumAmount),
        expectedROI: String(expectedROI),
        durationDays: Number(durationDays),
        totalCapacity: String(totalCapacity),
        status: status || "OPEN",
      },
    });

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    console.error("CREATE_INVESTMENT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create investment." },
      { status: 500 }
    );
  }
}