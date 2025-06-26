import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("mern_auth_app");

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

    // Fetch withdrawal request
    const withdrawalRequest = await db
      .collection("withdrawalRequests")
      .findOne({
        _id: new ObjectId(requestId),
      });

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawalRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Withdrawal request already processed" },
        { status: 400 }
      );
    }

    // Update withdrawal request status
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      processedAt: new Date(),
      processedBy: admin._id,
      adminNotes: adminNotes || "",
    };

    await db
      .collection("withdrawalRequests")
      .updateOne({ _id: new ObjectId(requestId) }, { $set: updateData });

    // If approved, deduct from wallet
    if (action === "approve") {
      const user = await db.collection("users").findOne({
        _id: withdrawalRequest.userId,
      });

      if (user) {
        const currentBalance = user.wallet?.balance || 0;
        const availableBalance = user.wallet?.availableBalance || 0;

        const newBalance = currentBalance - withdrawalRequest.amount;
        const newAvailable = availableBalance - withdrawalRequest.amount;

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              "wallet.balance": newBalance,
              "wallet.availableBalance": newAvailable,
            },
            $push: {
              walletHistory: {
                type: "withdrawal",
                amount: -withdrawalRequest.amount,
                description: `Withdrawal approved`,
                timestamp: new Date(),
                status: "completed",
              },
            },
          }
        );

        await db.collection("userNotifications").insertOne({
          userId: user._id,
          type: "withdrawal_approved",
          title: "Withdrawal Approved",
          message: `Your withdrawal of Ksh${withdrawalRequest.amount} has been approved.`,
          isRead: false,
          createdAt: new Date(),
        });
      }
    } else {
      // Notify user of rejected withdrawal
      await db.collection("userNotifications").insertOne({
        userId: withdrawalRequest.userId,
        type: "withdrawal_rejected",
        title: "Withdrawal Rejected",
        message: `Your withdrawal request of Ksh${
          withdrawalRequest.amount
        } was rejected. ${adminNotes ? "Reason: " + adminNotes : ""}`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal request ${action}d successfully`,
    });
  } catch (error) {
    console.error("Process withdrawal request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
