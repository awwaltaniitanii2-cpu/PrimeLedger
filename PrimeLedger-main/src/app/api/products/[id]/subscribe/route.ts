import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id?: string };
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid subscription amount." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found." },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Product is not available." },
        { status: 400 }
      );
    }

    const minimumAmount = Number(product.minimumAmount);
    const maximumAmount = product.maximumAmount
      ? Number(product.maximumAmount)
      : null;

    const totalCapacity = product.totalCapacity
      ? Number(product.totalCapacity)
      : null;

    const investedTotal = Number(product.investedTotal || 0);

    if (amount < minimumAmount) {
      return NextResponse.json(
        { error: `Minimum amount is ${product.currency} ${minimumAmount}.` },
        { status: 400 }
      );
    }

    if (maximumAmount && amount > maximumAmount) {
      return NextResponse.json(
        { error: `Maximum amount is ${product.currency} ${maximumAmount}.` },
        { status: 400 }
      );
    }

    if (totalCapacity && investedTotal + amount > totalCapacity) {
      return NextResponse.json(
        { error: "Product capacity exceeded." },
        { status: 400 }
      );
    }

    const interestRate = Number(product.interestRate);
    const expectedValue = amount + amount * (interestRate / 100);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.durationDays);

    const subscription = await prisma.productSubscription.create({
      data: {
        clientId: client.id,
        productId: product.id,
        amount: String(amount),
        expectedValue: String(expectedValue),
        endDate,
        status: "ACTIVE",
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        investedTotal: String(investedTotal + amount),
      },
    });

    await prisma.transaction.create({
      data: {
        clientId: client.id,
        type: "ADJUSTMENT",
        amount: String(amount),
        status: "APPROVED",
        note: `${product.type} subscription created for ${product.name}`,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("PRODUCT_SUBSCRIBE_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to subscribe to product." },
      { status: 500 }
    );
  }
}