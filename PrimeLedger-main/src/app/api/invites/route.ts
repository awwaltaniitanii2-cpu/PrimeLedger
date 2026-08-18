import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required." },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(24).toString("hex");

    const invite = await prisma.inviteLink.create({
      data: {
        clientId,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL || "http://localhost:3000";

    return NextResponse.json({
      invite,
      inviteUrl: `${baseUrl}/invite/${invite.token}`,
    });
  } catch (error) {
    console.error("CREATE_INVITE_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create invite link." },
      { status: 500 }
    );
  }
}