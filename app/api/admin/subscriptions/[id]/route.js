export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../../lib/mongodb";
import { UserModel } from "../../../../../lib/database";

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

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, adminNotes } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get subscription details
    const subscription = await db
      .collection("purchaseRequests")
      .findOne({ _id: new ObjectId(id) });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (
      !["pending_approval", "pending", "pending_payment_verification"].includes(
        subscription.status
      )
    ) {
      return NextResponse.json(
        { error: "Subscription cannot be processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve subscription
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + subscription.packageDuration * 24 * 60 * 60 * 1000
      );

      await db.collection("purchaseRequests").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: "active",
            paymentStatus: "completed",
            startDate: startDate,
            endDate: endDate,
            approvedBy: user._id,
            approvedAt: new Date(),
            adminNotes: adminNotes || "Subscription approved",
            updatedAt: new Date(),
          },
        }
      );

      // Update package subscriber count
      await db.collection("packages").updateOne(
        { _id: subscription.packageId },
        {
          $inc: {
            subscribers: 1,
            totalRevenue:
              typeof subscription.amount === "number" ? subscription.amount : 0,
          },
          $set: {
            updatedAt: new Date(),
          },
        }
      );

      // Add to user's active investments
      await db.collection("users").updateOne(
        { _id: subscription.userId },
        {
          $push: {
            "wallet.history": {
              type: "investment",
              amount: -subscription.amount,
              description: `Investment activated - ${subscription.packageName}`,
              timestamp: new Date(),
              status: "completed",
            },
          },
          $inc: {
            "stats.activeInvestments": 1,
            "wallet.totalInvested":
              typeof subscription.amount === "number" ? subscription.amount : 0,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Subscription approved successfully",
      });
    } else if (action === "reject") {
      // Reject subscription
      await db.collection("purchaseRequests").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: "rejected",
            rejectedBy: user._id,
            rejectedAt: new Date(),
            adminNotes: adminNotes || "Subscription rejected",
            updatedAt: new Date(),
          },
        }
      );

      // Refund wallet if payment was made via wallet
      if (
        subscription.paymentMethod === "wallet" &&
        subscription.paymentStatus === "completed"
      ) {
        const user = await db
          .collection("users")
          .findOne({ _id: subscription.userId });
        const currentBalance = user.wallet?.balance || 0;
        const refundAmount = subscription.amount;

        await db.collection("users").updateOne(
          { _id: subscription.userId },
          {
            $set: { "wallet.balance": currentBalance + refundAmount },
            $push: {
              "wallet.history": {
                type: "refund",
                amount: refundAmount,
                description: `Refund for rejected subscription - ${subscription.packageName}`,
                timestamp: new Date(),
                status: "completed",
              },
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Subscription rejected successfully",
      });
    }
  } catch (error) {
    console.error("Process subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
