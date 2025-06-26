import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, context) {
  try {
    const { params } = await context;
    const id = params.id;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // const user = await UserModel.findUserById(userId);
    const { action, amount, description } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!action || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Action and valid amount are required" },
        { status: 400 }
      );
    }
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    // Verify admin
    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get current user
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentWallet = user.wallet || {
      balance: 0,
      totalInvested: 0,
      totalReturns: 0,
      availableBalance: 0,
      totalDeposited: 0,
    };

    let newBalance = currentWallet.balance;
    let newAvailable = currentWallet.availableBalance;

    // Handle different wallet actions
    switch (action) {
      case "credit":
        newBalance += amount;
        newAvailable += amount;
        break;
      case "debit":
        if (currentWallet.availableBalance < amount) {
          return NextResponse.json(
            { error: "Insufficient balance" },
            { status: 400 }
          );
        }
        newBalance -= amount;
        newAvailable -= amount;
        break;
      case "set":
        newBalance = amount;
        newAvailable = amount;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'credit', 'debit', or 'set'" },
          { status: 400 }
        );
    }

    // Create wallet transaction
    const walletTransaction = {
      id: new ObjectId(),
      type:
        action === "credit"
          ? "admin_credit"
          : action === "debit"
          ? "admin_debit"
          : "admin_set",
      amount: action === "debit" ? -amount : amount,
      description: description || `Wallet ${action} by admin`,
      timestamp: new Date(),
      status: "completed",
      adminAction: true,
      adminId: new ObjectId(userId),
    };

    // Update user wallet
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "wallet.balance": Math.max(0, newBalance),
          "wallet.availableBalance": Math.max(0, newAvailable),
          updatedAt: new Date(),
        },
        $push: {
          walletHistory: walletTransaction,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update wallet" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Wallet ${action} successful`,
      data: {
        previousBalance: currentWallet.balance,
        newBalance: Math.max(0, newBalance),
        amount,
        action,
      },
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
