import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const activities = [];

    // Get recent user registrations
    const recentUsers = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user._id}`,
        type: "user_joined",
        message: `New user ${user.fullName} registered`,
        time: getTimeAgo(user.createdAt),
        timestamp: user.createdAt,
      });
    });

    // Get recent package activities
    const recentPackages = await db
      .collection("packages")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    recentPackages.forEach((pkg) => {
      activities.push({
        id: `package_${pkg._id}`,
        type: "package_created",
        message: `New package "${pkg.name}" created`,
        time: getTimeAgo(pkg.createdAt),
        timestamp: pkg.createdAt,
      });
    });

    // Get recent wallet activities
    const usersWithWalletHistory = await db
      .collection("users")
      .find({ "walletHistory.0": { $exists: true } })
      .limit(10)
      .toArray();

    usersWithWalletHistory.forEach((user) => {
      if (user.walletHistory && user.walletHistory.length > 0) {
        const latestTransaction =
          user.walletHistory[user.walletHistory.length - 1];
        activities.push({
          id: `wallet_${user._id}_${latestTransaction.timestamp}`,
          type: latestTransaction.type === "credit" ? "deposit" : "withdrawal",
          message: `${user.fullName} ${
            latestTransaction.type === "credit" ? "deposited" : "withdrew"
          } $${latestTransaction.amount}`,
          time: getTimeAgo(latestTransaction.timestamp),
          timestamp: latestTransaction.timestamp,
        });
      }
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json(activities.slice(0, 15));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
