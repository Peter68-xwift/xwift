import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    // Get current date for time-based queries
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total users
    const totalUsers = await db.collection("users").countDocuments();

    // Get active users (logged in within last 30 days)
    const activeUsers = await db.collection("users").countDocuments({
      "stats.lastLogin": { $gte: thirtyDaysAgo },
    });

    // Get new users this month
    const newUsersThisMonth = await db.collection("users").countDocuments({
      createdAt: { $gte: currentMonth },
    });

    // Get new users last month
    const newUsersLastMonth = await db.collection("users").countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth },
    });

    // Calculate user growth percentage
    const userGrowthPercentage =
      newUsersLastMonth > 0
        ? (
            ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) *
            100
          ).toFixed(1)
        : 100;

    // Get total packages
    const totalPackages = await db
      .collection("packages")
      .countDocuments({ status: "active" });

    // Get total revenue from all packages
    const revenueResult = await db
      .collection("packages")
      .aggregate([
        { $match: { status: "active" } },
        {
          $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" } },
        },
      ])
      .toArray();
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get total wallet balance across all users
    const walletResult = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            totalWalletBalance: { $sum: "$wallet.balance" },
          },
        },
      ])
      .toArray();
    const totalWalletBalance = walletResult[0]?.totalWalletBalance || 0;

    // Get total invested amount
    const investedResult = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            totalInvested: { $sum: "$wallet.totalInvested" },
          },
        },
      ])
      .toArray();
    const totalInvested = investedResult[0]?.totalInvested || 0;

    // Get recent activities (new users, recent logins, etc.)
    const recentUsers = await db
      .collection("users")
      .find(
        {},
        { projection: { fullName: 1, createdAt: 1, "stats.lastLogin": 1 } }
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const recentActivities = recentUsers.map((user) => ({
      id: user._id.toString(),
      type: "user_joined",
      message: `New user ${user.fullName} registered`,
      time: getTimeAgo(user.createdAt),
      timestamp: user.createdAt,
    }));

    // Get top performing packages
    const topPackages = await db
      .collection("packages")
      .find({ status: "active" })
      .sort({ totalRevenue: -1, subscribers: -1 })
      .limit(5)
      .toArray();

    // Get monthly user growth data (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthUsers = await db.collection("users").countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      monthlyGrowth.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        users: monthUsers,
        cumulative: await db.collection("users").countDocuments({
          createdAt: { $lte: monthEnd },
        }),
      });
    }

    // Calculate monthly growth percentage
    const lastMonthUsers = monthlyGrowth[4]?.users || 0;
    const currentMonthUsers = monthlyGrowth[5]?.users || 0;
    const monthlyGrowthPercentage =
      lastMonthUsers > 0
        ? (
            ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) *
            100
          ).toFixed(1)
        : 100;

    // Get system health metrics
    const systemStats = {
      uptime: "99.9%", // This would come from your monitoring system
      avgResponseTime: "1.2s", // This would come from your monitoring system
      storageUsed: "45GB", // This would come from your database monitoring
      totalTransactions: await db
        .collection("users")
        .aggregate([
          {
            $project: {
              transactionCount: {
                $size: { $ifNull: ["$walletHistory", []] },
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$transactionCount" } } },
        ])
        .toArray()
        .then((result) => result[0]?.total || 0),
    };

    const dashboardStats = {
      totalUsers,
      activeUsers,
      totalPackages,
      totalRevenue,
      totalWalletBalance,
      totalInvested,
      userGrowthPercentage: Number.parseFloat(userGrowthPercentage),
      monthlyGrowthPercentage: Number.parseFloat(monthlyGrowthPercentage),
      recentActivities,
      topPackages: topPackages.map((pkg) => ({
        id: pkg._id.toString(),
        name: pkg.name,
        subscribers: pkg.subscribers || 0,
        revenue: pkg.totalRevenue || 0,
        roi: pkg.roi,
      })),
      monthlyGrowth,
      systemStats,
      pendingApprovals: 0, // This would come from a pending approvals collection
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
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
