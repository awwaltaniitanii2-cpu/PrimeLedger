import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      username,
      password,
      phone,
      country,
      initialCapital,
      accountType,
      riskProfile,
    } = body;

    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: "Name, email, username, and password are required." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.client.create({
      data: {
        phone: phone || null,
        country: country || null,
        user: {
          create: {
            name,
            email,
            username,
            password: hashedPassword,
            role: "CLIENT",
          },
        },
        accounts: {
          create: {
            accountId: `PL-${Date.now()}`,
            accountType: accountType || "Standard",
            balance: String(initialCapital || 0),
            profitLoss: "0",
            riskProfile: riskProfile || "Moderate",
          },
        },
      },
      include: {
        user: true,
        accounts: true,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("CREATE_CLIENT_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error while creating client.",
      },
      { status: 500 }
    );
  }
}