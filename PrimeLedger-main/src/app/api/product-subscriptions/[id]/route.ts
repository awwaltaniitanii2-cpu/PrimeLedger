import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type SubscriptionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sessionUser = session.user as {
      id?: string;
      role?: string;
    };

    if (sessionUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status as SubscriptionStatus;

    const allowedStatuses: SubscriptionStatus[] = [
      "ACTIVE",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid subscription status." },
        { status: 400 }
      );
    }

    const existingSubscription =
      await prisma.productSubscription.findUnique({
        where: { id },
        include: {
          product: true,
          client: {
            include: {
              user: true,
            },
          },
        },
      });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      );
    }

    const currentStatus = existingSubscription.status;
    const amount = Number(existingSubscription.amount || 0);
    const investedTotal = Number(
      existingSubscription.product.investedTotal || 0
    );

    const result = await prisma.$transaction(async (transaction) => {
      const subscription = await transaction.productSubscription.update({
        where: { id },
        data: { status },
        include: {
          product: true,
          client: {
            include: {
              user: true,
            },
          },
        },
      });

      if (currentStatus !== "CANCELLED" && status === "CANCELLED") {
        await transaction.product.update({
          where: { id: existingSubscription.productId },
          data: {
            investedTotal: String(Math.max(investedTotal - amount, 0)),
          },
        });
      }

      if (currentStatus === "CANCELLED" && status === "ACTIVE") {
        const capacity = existingSubscription.product.totalCapacity
          ? Number(existingSubscription.product.totalCapacity)
          : null;

        if (capacity && investedTotal + amount > capacity) {
          throw new Error("Reactivation would exceed product capacity.");
        }

        await transaction.product.update({
          where: { id: existingSubscription.productId },
          data: {
            investedTotal: String(investedTotal + amount),
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          actor:
            sessionUser.id ||
            session.user?.email ||
            "PrimeLedger Administrator",
          action: "PRODUCT_SUBSCRIPTION_STATUS_UPDATED",
          target: existingSubscription.id,
          details: JSON.stringify({
            productId: existingSubscription.productId,
            productName: existingSubscription.product.name,
            clientId: existingSubscription.clientId,
            clientName: existingSubscription.client.user.name,
            previousStatus: currentStatus,
            newStatus: status,
            amount,
          }),
        },
      });

      return subscription;
    });

    return NextResponse.json({ subscription: result });
  } catch (error) {
    console.error("UPDATE_PRODUCT_SUBSCRIPTION_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subscription.",
      },
      { status: 500 }
    );
  }
}