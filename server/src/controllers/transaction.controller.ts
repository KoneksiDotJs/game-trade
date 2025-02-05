import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";
import { StripeService } from "../service/stripe.service";

const stripeService = new StripeService();

export const createTransaction: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { listingId, quantity = 1 } = req.body;
    const buyerId = req.user?.id;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) },
      include: { user: true },
    });

    if (!buyerId) {
      throw new Error("User not authenticated");
    }

    if (!listing) {
      throw new Error("Listing not found");
    }

    switch (true) {
      case listing.status !== "ACTIVE":
        throw new Error("Listing is not available");
      case listing.userId === buyerId:
        throw new Error("Cannot buy your own listing");
      case !listing.quantity || listing.quantity < 1:
        throw new Error("Item out of stock");
      default:
        break;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(listing?.price) * quantity,
        quantity: parseInt(quantity),
        buyerId: buyerId,
        sellerId: listing?.userId,
        listingId: listingId,
      },
    });

    // create stripe payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      transaction.id,
      Number(transaction.amount)
    );

    // Update transaction with payment intent ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
    });

    await prisma.listing.update({
      where: { id: parseInt(listingId) },
      data: { status: "PENDING" },
    });

    res.status(201).json(
      sendSuccess({
        updatedTransaction,
        clientSecret: paymentIntent.client_secret,
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getTransactionById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        buyer: true,
        seller: true,
        listing: true,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    // check if user is involved in the transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      res.status(403).json(sendError("Unauthorized"));
    }

    res.status(200).json(sendSuccess(transaction));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getUserTransactions: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            reputationScore: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            reputationScore: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        listing: true,
      },
    });

    res.status(200).json(sendSuccess(transactions));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const updateTransactionStatus: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        listing: true,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    // verify user is involved in the transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      res.status(403).json(sendError("Unauthorized"));
    }

    // start transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // handle payment cancellation first
      if (status === "CANCELLED" && transaction.stripePaymentIntentId) {
        await stripeService.cancelPaymentIntent(
          transaction.stripePaymentIntentId
        );
      }

      // update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: parseInt(id) },
        data: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null,
          paymentStatus:
            status === "CANCELLED"
              ? "cancelled"
              : status === "COMPLETED"
              ? "paid"
              : "pending",
        },
      });

      // handle listing updates based on status
      if (status === "COMPLETED") {
        if (transaction.listing.quantity < 1) {
          throw new Error("Item out of stock");
        }

        await prisma.listing.update({
          where: { id: transaction.listingId },
          data: {
            quantity: {
              decrement: 1,
            },
            status: transaction.listing.quantity <= 1 ? "SOLD" : "ACTIVE",
          },
        });
      } else if (status === "CANCELLED") {
        await prisma.listing.update({
          where: { id: transaction.listingId },
          data: {
            status: "ACTIVE",
          },
        });
      }

      return updatedTransaction;
    });

    res.status(200).json(sendSuccess(result));
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};

export const getTransactionStats: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { start, end, period = "daily" } = req.query;
    const startDate = start ? new Date(start as string) : new Date(new Date().setDate(new Date().getDate() - 7));
    const endDate = end ? new Date(end as string) : new Date();

    // Generate date points
    const datePoints = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      datePoints.push(new Date(currentDate));
      if (period === "yearly") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else if (period === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Get stats for each period
    const periodStats = await Promise.all(
      datePoints.map(async (date) => {
        const nextDate = new Date(date);
        if (period === "yearly") nextDate.setFullYear(date.getFullYear() + 1);
        else if (period === "monthly") nextDate.setMonth(date.getMonth() + 1);
        else nextDate.setDate(date.getDate() + 1);

        const stats = await prisma.transaction.aggregate({
          where: {
            status: "COMPLETED",
            completedAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _count: true,
          _sum: {
            amount: true,
          },
        });

        return {
          date: period === "yearly" 
            ? date.getFullYear().toString()
            : period === "monthly"
            ? date.toLocaleDateString("default", { month: "short", year: "numeric" })
            : date.toLocaleDateString(),
          transactions: stats._count,
          revenue: stats._sum.amount || 0,
        };
      })
    );

    // Calculate period comparison
    const previousPeriodStart = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodLength);

    const previousPeriodStats = await prisma.transaction.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentPeriodRevenue = periodStats.reduce((sum, stat) => sum + Number(stat.revenue), 0);
    const previousPeriodRevenue = Number(previousPeriodStats._sum.amount) || 0;
    const percentageChange = previousPeriodRevenue === 0 ? 100 :
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

    res.status(200).json(
      sendSuccess({
        period: {
          stats: periodStats,
          comparison: {
            current: currentPeriodRevenue,
            previous: previousPeriodRevenue,
            percentage: Math.round(percentageChange * 100) / 100,
            trend: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "stable",
          },
        },
      })
    );
  } catch (error) {
    res.status(500).json(sendError((error as Error).message));
  }
};