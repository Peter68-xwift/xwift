import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "../../../../lib/database";

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

export async function POST(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { type, amount, description } = await request.json();

    // Validate input
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

    // Get user from database
    const user = await UserModel.findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For withdrawals, check if user has sufficient balance
    if (
      type === "withdrawal" &&
      (user.wallet?.availableBalance || 0) < amount
    ) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update wallet based on transaction type
    const transactionAmount = type === "withdrawal" ? -amount : amount;

    const result = await UserModel.updateUserWallet(
      decoded.userId,
      transactionAmount,
      type,
      description
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update wallet" },
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
