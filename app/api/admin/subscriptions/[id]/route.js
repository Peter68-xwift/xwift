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

      // Ensure availableBalance exists before subtracting
      const userDoc = await db
        .collection("users")
        .findOne({ _id: subscription.userId });
      const hasAvailableBalance =
        typeof userDoc?.wallet?.availableBalance === "number";

      if (!hasAvailableBalance) {
        await db.collection("users").updateOne(
          { _id: subscription.userId },
          {
            $set: { "wallet.availableBalance": userDoc.wallet?.balance || 0 },
          }
        );
      }

      // Add to user's active investments
      const updateUserFields = {
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
      };

      if (subscription.paymentMethod === "wallet") {
        updateUserFields.$inc["wallet.balance"] = -subscription.amount;
        updateUserFields.$inc["wallet.availableBalance"] = -subscription.amount;
      }

      await db
        .collection("users")
        .updateOne({ _id: subscription.userId }, updateUserFields);

      // ✅ Apply referral bonus after approval
      const subscribedUser = await db
        .collection("users")
        .findOne({ _id: subscription.userId });

      if (subscribedUser.referrerId) {
        // Ensure this is the user's first approved subscription
        const hasPreviousApproved = await db
          .collection("purchaseRequests")
          .findOne({
            userId: subscribedUser._id,
            status: { $in: ["active", "completed"] },
            _id: { $ne: new ObjectId(id) },
          });

        if (!hasPreviousApproved) {
          const commissionAmount = subscription.amount * 0.15;

          await db.collection("users").updateOne(
            { _id: subscribedUser.referrerId },
            {
              $inc: {
                "wallet.balance": commissionAmount,
                "wallet.availableBalance": commissionAmount,
              },
              $push: {
                walletHistory: {
                  type: "referral_bonus",
                  amount: commissionAmount,
                  description: `15% referral bonus from ${subscribedUser.fullName}`,
                  timestamp: new Date(),
                  status: "completed",
                },
              },
            }
          );

          // Optional notification
          await db.collection("userNotifications").insertOne({
            userId: subscribedUser.referrerId,
            title: "Referral Bonus Received",
            message: `You earned KES ${commissionAmount.toFixed(
              2
            )} from referring ${subscribedUser.fullName}.`,
            isRead: false,
            createdAt: new Date(),
          });
        }
      }

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
