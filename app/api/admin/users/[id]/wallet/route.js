import { NextResponse } from "next/server";
import { UserModel } from "../../../../../../lib/database.js";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { action, amount, description } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    if (!action || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Action and valid amount are required",
        },
        { status: 400 }
      );
    }

    // Get current user
    const user = await UserModel.findUserById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const currentWallet = user.wallet || {
      balance: 0,
      totalInvested: 0,
      totalReturns: 0,
      availableBalance: 0,
    };

    const updatedWallet = { ...currentWallet };

    // Handle different wallet actions
    switch (action) {
      case "credit":
        updatedWallet.balance += amount;
        updatedWallet.availableBalance += amount;
        break;
      case "debit":
        if (currentWallet.availableBalance < amount) {
          return NextResponse.json(
            {
              success: false,
              message: "Insufficient balance",
            },
            { status: 400 }
          );
        }
        updatedWallet.balance -= amount;
        updatedWallet.availableBalance -= amount;
        break;
      case "set":
        updatedWallet.balance = amount;
        updatedWallet.availableBalance = amount;
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Use 'credit', 'debit', or 'set'",
          },
          { status: 400 }
        );
    }

    // Update user wallet
    const result = await UserModel.updateUser(id, {
      wallet: updatedWallet,
      $push: {
        walletHistory: {
          action,
          amount,
          description: description || `Wallet ${action} by admin`,
          previousBalance: currentWallet.balance,
          newBalance: updatedWallet.balance,
          timestamp: new Date(),
          adminAction: true,
        },
      },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update wallet",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Wallet ${action} successful`,
      data: {
        previousBalance: currentWallet.balance,
        newBalance: updatedWallet.balance,
        amount,
        action,
      },
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update wallet",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
