import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type ClientStatus = "ACTIVE" | "REVIEW" | "SUSPENDED" | "CLOSED";

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

const allowedStatuses: ClientStatus[] = [
  "ACTIVE",
  "REVIEW",
  "SUSPENDED",
  "CLOSED",
];

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const user = session.user as SessionUser;

  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        accounts: {
          orderBy: {
            createdAt: "desc",
          },
        },
        investments: {
          include: {
            investment: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        subscriptions: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        deposits: {
          orderBy: {
            createdAt: "desc",
          },
        },
        withdrawals: {
          orderBy: {
            createdAt: "desc",
          },
        },
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
        invites: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("GET_CLIENT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load client." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { user: adminUser } = authorization;
    const { id } = await params;
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : undefined;

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : undefined;

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : undefined;

    const country =
      typeof body.country === "string" ? body.country.trim() : undefined;

    const status =
      typeof body.status === "string"
        ? (body.status.toUpperCase() as ClientStatus)
        : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json(
        { error: "Client name cannot be empty." },
        { status: 400 }
      );
    }

    if (email !== undefined && !email) {
      return NextResponse.json(
        { error: "Client email cannot be empty." },
        { status: 400 }
      );
    }

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid client status." },
        { status: 400 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    const updatedClient = await prisma.$transaction(async (transaction) => {
      if (name !== undefined || email !== undefined) {
        await transaction.user.update({
          where: {
            id: existingClient.userId,
          },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(email !== undefined ? { email } : {}),
          },
        });
      }

      const client = await transaction.client.update({
        where: { id },
        data: {
          ...(phone !== undefined ? { phone: phone || null } : {}),
          ...(country !== undefined ? { country: country || null } : {}),
          ...(status !== undefined ? { status } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          accounts: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          actor:
            adminUser.id ||
            adminUser.email ||
            adminUser.name ||
            "PrimeLedger Administrator",
          action: "CLIENT_UPDATED",
          target: existingClient.id,
          details: JSON.stringify({
            clientName: client.user.name,
            clientEmail: client.user.email,
            previousStatus: existingClient.status,
            newStatus: client.status,
            updatedFields: {
              name: name !== undefined,
              email: email !== undefined,
              phone: phone !== undefined,
              country: country !== undefined,
              status: status !== undefined,
            },
          }),
        },
      });

      return client;
    });

    return NextResponse.json({
      client: updatedClient,
      message: "Client updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE_CLIENT_ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email address is already being used." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update client.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { user: adminUser } = authorization;
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        accounts: true,
        investments: true,
        subscriptions: true,
        deposits: true,
        withdrawals: true,
        transactions: true,
        invites: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.auditLog.create({
        data: {
          actor:
            adminUser.id ||
            adminUser.email ||
            adminUser.name ||
            "PrimeLedger Administrator",
          action: "CLIENT_DELETED",
          target: client.id,
          details: JSON.stringify({
            clientName: client.user.name,
            clientEmail: client.user.email,
            username: client.user.username,
            accounts: client.accounts.length,
            investments: client.investments.length,
            subscriptions: client.subscriptions.length,
            deposits: client.deposits.length,
            withdrawals: client.withdrawals.length,
            transactions: client.transactions.length,
            invites: client.invites.length,
          }),
        },
      });

      /*
       * Deleting the User also deletes the related Client because the
       * Client.user relation uses onDelete: Cascade. Client-owned records
       * are then removed through their existing cascade relations.
       */
      await transaction.user.delete({
        where: {
          id: client.userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE_CLIENT_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete client.",
      },
      { status: 500 }
    );
  }
}