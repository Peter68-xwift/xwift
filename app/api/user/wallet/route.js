import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";

export async function GET(request) {
  try {
    // Get token from Authorization header
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate wallet statistics
    const walletHistory = user.walletHistory || [];
    const deposits = walletHistory.filter(
      (t) => t.type === "deposit" || t.type === "credit"
    );
    const withdrawals = walletHistory.filter(
      (t) => t.type === "withdrawal" || t.type === "debit"
    );
    const earnings = walletHistory.filter(
      (t) => t.type === "earning" || t.type === "roi"
    );

    const totalDeposits = deposits.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
    const totalWithdrawals = withdrawals.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
    const totalEarnings = earnings.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Get recent transactions (last 10)
    const recentTransactions = walletHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map((transaction) => ({
        id: transaction.id || transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: new Date(transaction.timestamp).toLocaleDateString(),
        status: transaction.status || "completed",
      }));

    const walletData = {
      balance: user.wallet?.balance || 0,
      availableBalance:
        user.wallet?.availableBalance || user.wallet?.balance || 0,
      pendingBalance:
        (user.wallet?.balance || 0) -
        (user.wallet?.availableBalance || user.wallet?.balance || 0),
      totalDeposits,
      totalWithdrawals,
      totalEarnings,
      transactions: recentTransactions,
    };

    return NextResponse.json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    console.error("Wallet API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { UserModel } from "../../../../lib/database";
import clientPromise from "../../../../lib/mongodb";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { type, amount, description } = await request.json();

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const user = await UserModel.findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    // Handle withdrawal
    if (type === "withdrawal") {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = now.getHours();

      if (day === 0 || day === 6 || hour < 9 || hour >= 16) {
        return NextResponse.json(
          {
            error:
              "Withdrawals are only permitted Monday to Friday between 9:00 AM and 4:00 PM.",
          },
          { status: 403 }
        );
      }

      // 🛑 One withdrawal per day check
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const existingWithdrawal = await db
        .collection("withdrawalRequests")
        .findOne({
          userId: new ObjectId(userId),
          createdAt: { $gte: startOfDay },
        });

      if (existingWithdrawal) {
        return NextResponse.json(
          { error: "You have already made a withdrawal request today." },
          { status: 403 }
        );
      }

      const available = user.wallet?.availableBalance || 0;
      if (available < amount) {
        return NextResponse.json(
          { error: "Insufficient available balance" },
          { status: 400 }
        );
      }

      // Create withdrawal request
      const withdrawalRequest = {
        _id: new ObjectId(),
        userId: new ObjectId(userId),
        fullName: user.fullName,
        username: user.username,
        amount,
        description,
        status: "pending",
        type: "withdrawal",
        createdAt: new Date(),
      };

      await db.collection("withdrawalRequests").insertOne(withdrawalRequest);

      const logResult = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: {
            walletHistory: {
              id: new ObjectId(),
              type: "withdrawal",
              amount: -amount,
              description,
              status: "pending",
              timestamp: new Date(),
            },
          },
        }
      );

      if (!logResult || logResult.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Failed to log wallet transaction" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Withdrawal request submitted and is pending admin approval.",
      });
    }

    // Handle deposit or other types
    const transaction = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      type,
      amount,
      description,
      status: "completed",
      createdAt: new Date(),
    };

    const newBalance = (user.wallet?.balance || 0) + amount;

    const updateResult = await UserModel.updateUserWalletBalance(userId, {
      balance: newBalance,
      availableBalance: newBalance,
      transaction,
    });

    if (!updateResult || updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to process transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} processed successfully`,
    });
  } catch (error) {
    console.error("Wallet Transaction Error:", error);
    return NextResponse.json(
      { error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}

