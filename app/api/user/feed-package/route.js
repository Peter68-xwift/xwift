import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/database";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    const { subscriptionId } = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the subscription
    const subscription = await db.collection("purchaseRequests").findOne({
      _id: new ObjectId(subscriptionId),
      userId: new ObjectId(userId),
      status: { $in: ["active", "completed"] },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found or not active" },
        { status: 404 }
      );
    }

    // ✅ Get the actual package data
    const packageData = await db.collection("packages").findOne({
      _id: new ObjectId(subscription.packageId),
    });

    if (!packageData) {
      return NextResponse.json(
        { error: "Associated package not found" },
        { status: 404 }
      );
    }

    // Check if already fed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFeed = await db.collection("dailyFeeds").findOne({
      subscriptionId: new ObjectId(subscriptionId),
      userId: new ObjectId(userId),
      feedDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (todayFeed) {
      return NextResponse.json(
        { error: "Already fed today. Come back tomorrow!" },
        { status: 400 }
      );
    }

    // ✅ Calculate daily income from up-to-date package data
    const dailyIncome =
      (packageData.price * packageData.roi) / 100 / packageData.duration;

    // Create feed record
    const feedRecord = {
      subscriptionId: new ObjectId(subscriptionId),
      userId: new ObjectId(userId),
      packageName: packageData.name,
      dailyAmount: dailyIncome,
      feedDate: new Date(),
      createdAt: new Date(),
    };

    await db.collection("dailyFeeds").insertOne(feedRecord);

    // Update user wallet
    const currentBalance = user.wallet?.balance || 0;
    const newBalance = currentBalance + dailyIncome;

    const walletTransaction = {
      id: new ObjectId(),
      type: "daily_income",
      amount: dailyIncome,
      description: `Daily income from ${packageData.name}`,
      timestamp: new Date(),
      status: "completed",
      packageName: packageData.name,
    };

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "wallet.balance": newBalance,
          "wallet.availableBalance": newBalance,
          updatedAt: new Date(),
        },
        $push: {
          walletHistory: walletTransaction,
        },
      }
    );

    // Update subscription earnings
    const totalEarnings = (subscription.totalEarnings || 0) + dailyIncome;

    await db.collection("purchaseRequests").updateOne(
      { _id: new ObjectId(subscriptionId) },
      {
        $set: {
          totalEarnings: totalEarnings,
          lastFeedDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (user.referrerId && dailyIncome > 0) {
      const subordinateCommission = dailyIncome * 0.05;

      await db.collection("users").updateOne(
        { _id: user.referrerId },
        {
          $inc: {
            "wallet.balance": subordinateCommission,
            "wallet.availableBalance": subordinateCommission,
          },
          $push: {
            walletHistory: {
              type: "subordinate_income",
              amount: subordinateCommission,
              description: `5% daily earnings from ${user.fullName}`,
              timestamp: new Date(),
              status: "completed",
            },
          },
        }
      );

      await db.collection("userNotifications").insertOne({
        userId: user.referrerId,
        title: "Team Earnings Bonus",
        message: `You earned KES ${subordinateCommission.toFixed(
          2
        )} (5%) from ${user.fullName}'s daily earnings.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Daily income claimed successfully!",
      data: {
        dailyAmount: dailyIncome.toFixed(2),
        newBalance: newBalance.toFixed(2),
        nextFeedTime: tomorrow.toISOString(),
      },
    });
  } catch (error) {
    console.error("Feed package error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
