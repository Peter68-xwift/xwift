import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../../lib/mongodb";

import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, adminNotes } = await request.json();
    const requestId = params.id;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the deposit request
    const depositRequest = await db.collection("depositRequests").findOne({
      _id: new ObjectId(requestId),
    });

    if (!depositRequest) {
      return NextResponse.json(
        { error: "Deposit request not found" },
        { status: 404 }
      );
    }

    if (depositRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Deposit request already processed" },
        { status: 400 }
      );
    }

    // Update deposit request status
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      processedAt: new Date(),
      processedBy: admin._id,
      adminNotes: adminNotes || "",
    };

    await db
      .collection("depositRequests")
      .updateOne({ _id: new ObjectId(requestId) }, { $set: updateData });

    // If approved, add money to user's wallet
    if (action === "approve") {
      const user = await db
        .collection("users")
        .findOne({ _id: depositRequest.userId });

      if (user) {
        const newBalance = (user.wallet?.balance || 0) + depositRequest.amount;

        // Update user wallet
        await db.collection("users").updateOne(
          { _id: depositRequest.userId },
          {
            $set: {
              "wallet.balance": newBalance,
              "wallet.totalDeposited":
                (user.wallet?.totalDeposited || 0) + depositRequest.amount,
            },
            $push: {
              "wallet.history": {
                type: "deposit",
                amount: depositRequest.amount,
                description: `Deposit approved - ${depositRequest.transactionMessage.substring(
                  0,
                  50
                )}...`,
                timestamp: new Date(),
                status: "completed",
              },
            },
          }
        );

        // Create notification for user
        await db.collection("userNotifications").insertOne({
          userId: depositRequest.userId,
          type: "deposit_approved",
          title: "Deposit Approved",
          message: `Your deposit of Ksh${depositRequest.amount} has been approved and added to your wallet.`,
          isRead: false,
          createdAt: new Date(),
        });
      }
    } else {
      // Create notification for rejected deposit
      await db.collection("userNotifications").insertOne({
        userId: depositRequest.userId,
        type: "deposit_rejected",
        title: "Deposit Rejected",
        message: `Your deposit request of Ksh${
          depositRequest.amount
        } has been rejected. ${adminNotes ? "Reason: " + adminNotes : ""}`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Deposit request ${action}d successfully`,
    });
  } catch (error) {
    console.error("Process deposit request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
