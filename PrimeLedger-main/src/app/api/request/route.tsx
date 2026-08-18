import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id?: string };
    const { investmentId, amount } = await request.json();

    if (!investmentId || !amount) {
      return NextResponse.json(
        { error: "Investment ID and amount are required." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.id },
      include: { accounts: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found." },
        { status: 404 }
      );
    }

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment || investment.status !== "OPEN") {
      return NextResponse.json(
        { error: "Investment is not available." },
        { status: 400 }
      );
    }

    const investAmount = Number(amount);
    const minimumAmount = Number(investment.minimumAmount);
    const totalCapacity = Number(investment.totalCapacity);
    const investedTotal = Number(investment.investedTotal);

    if (investAmount < minimumAmount) {
      return NextResponse.json(
        { error: `Minimum investment is $${minimumAmount.toLocaleString()}.` },
        { status: 400 }
      );
    }

    if (investedTotal + investAmount > totalCapacity) {
      return NextResponse.json(
        { error: "Investment capacity exceeded." },
        { status: 400 }
      );
    }

    const expectedValue =
      investAmount + investAmount * (Number(investment.expectedROI) / 100);

    const clientInvestment = await prisma.clientInvestment.create({
      data: {
        clientId: client.id,
        investmentId,
        amount: String(investAmount),
        expectedValue: String(expectedValue),
      },
    });

    await prisma.investment.update({
      where: { id: investmentId },
      data: {
        investedTotal: String(investedTotal + investAmount),
      },
    });

    await prisma.transaction.create({
      data: {
        clientId: client.id,
        type: "ADJUSTMENT",
        amount: String(investAmount),
        status: "APPROVED",
        note: `Investment request created for ${investment.title}`,
      },
    });

    return NextResponse.json({ clientInvestment }, { status: 201 });
  } catch (error) {
    console.error("REQUEST_INVESTMENT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to request investment." },
      { status: 500 }
    );
  }
}