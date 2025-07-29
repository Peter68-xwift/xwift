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

    // Get referral commissions from wallet history for today
    const todayReferralCommissions = await db
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
              $in: ["referral_bonus", "referral_commission"],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            totalCommissions: { $sum: "$walletHistory.amount" },
            commissions: {
              $push: {
                id: "$walletHistory.id",
                amount: "$walletHistory.amount",
                type: "$walletHistory.type",
                description: "$walletHistory.description",
                timestamp: "$walletHistory.timestamp",
                referredUser: "$walletHistory.referredUser",
              },
            },
          },
        },
      ])
      .toArray();

    const commissionsData = todayReferralCommissions[0] || { totalCommissions: 0, commissions: [] };

    // Get total referral commissions (all time)
    const totalReferralCommissions = await db
      .collection("users")
      .aggregate([
        { $match: { _id: new ObjectId(userId) } },
        { $unwind: "$walletHistory" },
        {
          $match: {
            "walletHistory.amount": { $gt: 0 },
            "walletHistory.type": {
              $in: ["referral_bonus", "referral_commission"],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            totalCommissions: { $sum: "$walletHistory.amount" },
          },
        },
      ])
      .toArray();

    const totalCommissions = totalReferralCommissions[0]?.totalCommissions || 0;

    return NextResponse.json({
      success: true,
      data: {
        todayCommissions: commissionsData.totalCommissions.toFixed(2),
        totalCommissions: totalCommissions.toFixed(2),
        commissions: commissionsData.commissions.map(commission => ({
          ...commission,
          formattedAmount: `Ksh${commission.amount.toFixed(2)}`,
          timeAgo: getTimeAgo(commission.timestamp),
        })),
      },
    });
  } catch (error) {
    console.error("Referral Commissions API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral commissions" },
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