import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            client: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET_PRODUCT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load product." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        type,
        currency,
        minimumAmount:
          minimumAmount !== undefined ? String(minimumAmount) : undefined,
        maximumAmount:
          maximumAmount !== undefined && maximumAmount !== ""
            ? String(maximumAmount)
            : null,
        interestRate:
          interestRate !== undefined ? String(interestRate) : undefined,
        durationDays:
          durationDays !== undefined ? Number(durationDays) : undefined,
        totalCapacity:
          totalCapacity !== undefined && totalCapacity !== ""
            ? String(totalCapacity)
            : null,
        allowEarlyExit:
          allowEarlyExit !== undefined ? Boolean(allowEarlyExit) : undefined,
        status,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}