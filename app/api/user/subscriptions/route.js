import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/database";

import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active subscriptions
    const subscriptions = await db
      .collection("purchaseRequests")
      .find({
        userId: new ObjectId(userId),
        status: "active",
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Get today's feeds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFeeds = await db
      .collection("dailyFeeds")
      .find({
        userId: new ObjectId(userId),
        feedDate: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .toArray();

    // Format subscriptions with feed status
    const formattedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        // Fetch full package details
        const packageData = await db.collection("packages").findOne({
          _id: new ObjectId(sub.packageId),
        });

        if (!packageData) return null; // Skip if package is missing

        const startDate = new Date(sub.startDate);
        const endDate = new Date(
          startDate.getTime() + packageData.duration * 24 * 60 * 60 * 1000
        );
        const now = new Date();

        const totalDuration = endDate - startDate;
        const elapsed = now - startDate;
        const progress = Math.min(
          100,
          Math.max(0, (elapsed / totalDuration) * 100)
        );
        const daysLeft = Math.max(
          0,
          Math.ceil((endDate - now) / (24 * 60 * 60 * 1000))
        );

        const dailyIncome =
          (sub.amount * packageData.roi) / 100 / packageData.duration;

        const fedToday = todayFeeds.some(
          (feed) => feed.subscriptionId.toString() === sub._id.toString()
        );

        const nextFeedTime = new Date(tomorrow);

        return {
          id: sub._id.toString(),
          packageName: packageData.name,
          packagePrice: sub.amount,
          packageDuration: packageData.duration,
          packageROI: packageData.roi,
          dailyIncome: dailyIncome.toFixed(2),
          totalEarnings: (sub.totalEarnings || 0).toFixed(2),
          progress: Math.round(progress),
          daysLeft,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
          canFeed: !fedToday && daysLeft > 0,
          fedToday,
          nextFeedTime: nextFeedTime.toISOString(),
          lastFeedDate: sub.lastFeedDate
            ? new Date(sub.lastFeedDate).toLocaleDateString()
            : null,
        };
      })
    );

    // Filter out any nulls if packages were missing
    const validSubscriptions = formattedSubscriptions.filter(Boolean);
    

    // Calculate statistics
    const stats = {
      totalSubscriptions: validSubscriptions.length,
      totalDailyIncome: validSubscriptions
        .reduce((sum, s) => sum + Number.parseFloat(s.dailyIncome), 0)
        .toFixed(2),
      totalEarnings: validSubscriptions
        .reduce((sum, s) => sum + Number.parseFloat(s.totalEarnings), 0)
        .toFixed(2),
      availableFeeds: validSubscriptions.filter((s) => s.canFeed).length,
      fedToday: validSubscriptions.filter((s) => s.fedToday).length,
    };
    
    return NextResponse.json({
      success: true,
      data: {
        subscriptions: validSubscriptions,
        stats,
      },
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
