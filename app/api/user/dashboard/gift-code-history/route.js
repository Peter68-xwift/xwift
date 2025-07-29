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

    // Get gift code redemptions from wallet history
    const giftCodeHistory = await db
      .collection("users")
      .aggregate([
        { $match: { _id: new ObjectId(userId) } },
        { $unwind: "$walletHistory" },
        {
          $match: {
            "walletHistory.type": "gift_code_redemption",
            "walletHistory.amount": { $gt: 0 },
          },
        },
        {
          $project: {
            id: "$walletHistory.id",
            amount: "$walletHistory.amount",
            description: "$walletHistory.description",
            timestamp: "$walletHistory.timestamp",
            giftCode: "$walletHistory.giftCode",
          },
        },
        { $sort: { timestamp: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    const formattedHistory = giftCodeHistory.map(redemption => ({
      id: redemption.id?.toString() || Math.random().toString(),
      amount: redemption.amount,
      description: redemption.description,
      timestamp: redemption.timestamp,
      giftCode: redemption.giftCode,
      formattedAmount: `Ksh${redemption.amount.toFixed(2)}`,
      timeAgo: getTimeAgo(redemption.timestamp),
    }));

    return NextResponse.json({
      success: true,
      data: {
        redemptions: formattedHistory,
        totalRedemptions: giftCodeHistory.length,
        totalValue: giftCodeHistory.reduce((sum, redemption) => sum + redemption.amount, 0).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Gift Code History API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gift code history" },
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
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return time.toLocaleDateString();
}