import { NextResponse } from "next/server";
import { UserModel } from "../../../../../lib/database";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../../lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get earnings from wallet history for today
    const todayEarnings = await db
      .collection("users")
      .aggregate([
        { $match: { _id: new ObjectId(userId) } },
        { $unwind: "$walletHistory" },
        {
          $match: {
            "walletHistory.timestamp": {
              $gte: today,
              $lt: tomorrow,
            },
            "walletHistory.amount": { $gt: 0 },
            "walletHistory.type": {
              $in: ["earning", "roi", "commission", "referral_bonus", "subordinate_income"],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            totalEarnings: { $sum: "$walletHistory.amount" },
            earnings: {
              $push: {
                id: "$walletHistory.id",
                amount: "$walletHistory.amount",
                type: "$walletHistory.type",
                description: "$walletHistory.description",
                timestamp: "$walletHistory.timestamp",
              },
            },
          },
        },
      ])
      .toArray();

    const earningsData = todayEarnings[0] || { totalEarnings: 0, earnings: [] };

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: earningsData.totalEarnings.toFixed(2),
        earnings: earningsData.earnings.map(earning => ({
          ...earning,
          formattedAmount: `Ksh${earning.amount.toFixed(2)}`,
          timeAgo: getTimeAgo(earning.timestamp),
        })),
      },
    });
  } catch (error) {
    console.error("Earnings Today API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings data" },
      { status: 500 }
    );
  }
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return time.toLocaleTimeString();
}