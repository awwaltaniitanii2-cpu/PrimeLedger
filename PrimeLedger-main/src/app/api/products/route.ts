import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      type,
      currency,
      minimumAmount,
      maximumAmount,
      interestRate,
      durationDays,
      totalCapacity,
      allowEarlyExit,
      status,
    } = body;

    if (
      !name ||
      !description ||
      !type ||
      !minimumAmount ||
      !interestRate ||
      !durationDays
    ) {
      return NextResponse.json(
        { error: "Required product fields are missing." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type,
        currency: currency || "USD",
        minimumAmount: String(minimumAmount),
        maximumAmount: maximumAmount ? String(maximumAmount) : null,
        interestRate: String(interestRate),
        durationDays: Number(durationDays),
        totalCapacity: totalCapacity ? String(totalCapacity) : null,
        allowEarlyExit: Boolean(allowEarlyExit),
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}