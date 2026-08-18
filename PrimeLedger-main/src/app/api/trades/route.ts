import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type AssetClass =
  | "CRYPTO"
  | "STOCK"
  | "FOREX"
  | "COMMODITY"
  | "INDEX"
  | "ETF"
  | "FUTURE"
  | "OTHER";

type TradeSide = "BUY" | "SELL";

type TradeOrderType = "MARKET" | "LIMIT" | "STOP";

type TradeStatus = "PENDING" | "OPEN";

type SessionUser = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

const allowedAssetClasses: AssetClass[] = [
  "CRYPTO",
  "STOCK",
  "FOREX",
  "COMMODITY",
  "INDEX",
  "ETF",
  "FUTURE",
  "OTHER",
];

const allowedSides: TradeSide[] = ["BUY", "SELL"];

const allowedOrderTypes: TradeOrderType[] = ["MARKET", "LIMIT", "STOP"];

const allowedCreationStatuses: TradeStatus[] = ["PENDING", "OPEN"];

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

  return { user };
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export async function GET(request: Request) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const accountId = searchParams.get("accountId");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const trades = await prisma.trade.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(clientId ? { clientId } : {}),
        ...(accountId ? { accountId } : {}),
        ...(!includeDeleted ? { deletedAt: null } : {}),
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        },
        account: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("GET_TRADES_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load trades." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdmin();

    if ("error" in authorization) {
      return authorization.error;
    }

    const { user: adminUser } = authorization;
    const body = await request.json();

    const clientId =
      typeof body.clientId === "string" ? body.clientId.trim() : "";

    const accountId =
      typeof body.accountId === "string" ? body.accountId.trim() : "";

    const symbol =
      typeof body.symbol === "string"
        ? body.symbol.trim().toUpperCase()
        : "";

    const assetClass =
      typeof body.assetClass === "string"
        ? (body.assetClass.toUpperCase() as AssetClass)
        : null;

    const side =
      typeof body.side === "string"
        ? (body.side.toUpperCase() as TradeSide)
        : null;

    const orderType =
      typeof body.orderType === "string"
        ? (body.orderType.toUpperCase() as TradeOrderType)
        : "MARKET";

    const requestedStatus =
      typeof body.status === "string"
        ? (body.status.toUpperCase() as TradeStatus)
        : orderType === "MARKET"
          ? "OPEN"
          : "PENDING";

    const quantity = Number(body.quantity);
    const entryPrice = parseOptionalNumber(body.entryPrice);
    const stopLoss = parseOptionalNumber(body.stopLoss);
    const takeProfit = parseOptionalNumber(body.takeProfit);
    const fees = parseOptionalNumber(body.fees) ?? 0;

    const note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim()
        : null;

    if (!clientId || !accountId || !symbol) {
      return NextResponse.json(
        {
          error:
            "Client, trading account, and symbol are required.",
        },
        { status: 400 }
      );
    }

    if (!assetClass || !allowedAssetClasses.includes(assetClass)) {
      return NextResponse.json(
        { error: "Invalid asset class." },
        { status: 400 }
      );
    }

    if (!side || !allowedSides.includes(side)) {
      return NextResponse.json(
        { error: "Invalid trade side." },
        { status: 400 }
      );
    }

    if (!allowedOrderTypes.includes(orderType)) {
      return NextResponse.json(
        { error: "Invalid order type." },
        { status: 400 }
      );
    }

    if (!allowedCreationStatuses.includes(requestedStatus)) {
      return NextResponse.json(
        { error: "New trades can only be pending or open." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than zero." },
        { status: 400 }
      );
    }

    if (
      requestedStatus === "OPEN" &&
      (entryPrice === null || entryPrice <= 0)
    ) {
      return NextResponse.json(
        { error: "An entry price is required for an open trade." },
        { status: 400 }
      );
    }

    if (entryPrice !== null && entryPrice <= 0) {
      return NextResponse.json(
        { error: "Entry price must be greater than zero." },
        { status: 400 }
      );
    }

    if (stopLoss !== null && stopLoss <= 0) {
      return NextResponse.json(
        { error: "Stop loss must be greater than zero." },
        { status: 400 }
      );
    }

    if (takeProfit !== null && takeProfit <= 0) {
      return NextResponse.json(
        { error: "Take profit must be greater than zero." },
        { status: 400 }
      );
    }

    if (fees < 0) {
      return NextResponse.json(
        { error: "Fees cannot be negative." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      );
    }

    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Trading account not found." },
        { status: 404 }
      );
    }

    if (account.clientId !== client.id) {
      return NextResponse.json(
        { error: "The selected account does not belong to this client." },
        { status: 400 }
      );
    }

    if (account.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Trades can only be created for active accounts." },
        { status: 400 }
      );
    }

    const actor =
      adminUser.id ||
      adminUser.email ||
      adminUser.name ||
      "PrimeLedger Administrator";

    const trade = await prisma.$transaction(async (transaction) => {
      const createdTrade = await transaction.trade.create({
        data: {
          clientId: client.id,
          accountId: account.id,
          symbol,
          assetClass,
          side,
          orderType,
          status: requestedStatus,
          quantity: String(quantity),
          entryPrice:
            entryPrice !== null ? String(entryPrice) : null,
          stopLoss: stopLoss !== null ? String(stopLoss) : null,
          takeProfit:
            takeProfit !== null ? String(takeProfit) : null,
          fees: String(fees),
          realizedProfitLoss: "0",
          openedAt:
            requestedStatus === "OPEN" ? new Date() : null,
          openedBy: actor,
          note,
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  username: true,
                },
              },
            },
          },
          account: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          actor,
          action: "TRADE_CREATED",
          target: createdTrade.id,
          details: JSON.stringify({
            clientId: client.id,
            clientName: client.user.name,
            accountId: account.id,
            accountReference: account.accountId,
            symbol,
            assetClass,
            side,
            orderType,
            status: requestedStatus,
            quantity,
            entryPrice,
            stopLoss,
            takeProfit,
            fees,
          }),
        },
      });

      return createdTrade;
    });

    return NextResponse.json(
      {
        trade,
        message:
          requestedStatus === "OPEN"
            ? "Trade opened successfully."
            : "Pending order created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_TRADE_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create trade.",
      },
      { status: 500 }
    );
  }
}