import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";


export async function GET(request) {
  try {
    // Get user from token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // console.log(user);

    // Get user's wallet data
    const walletData = {
      balance: user.wallet?.balance || 0,
      totalInvested: user.wallet?.totalInvested || 0,
      totalReturns: user.wallet?.totalReturns || 0,
      availableBalance: user.wallet?.availableBalance || 0,
    };

    // Calculate growth percentage (mock calculation for now)
    const lastMonthBalance = user.wallet?.balance * 0.9 || 0;
    const growthPercentage =
      lastMonthBalance > 0
        ? (
            ((walletData.balance - lastMonthBalance) / lastMonthBalance) *
            100
          ).toFixed(1)
        : 0;

    // Get user's recent activities from wallet history
    const recentActivities = (user.walletHistory || [])
      .slice(-10)
      .reverse()
      .map((activity) => ({
        id: activity.id?.toString() || Math.random().toString(),
        action: activity.description || "Transaction",
        amount:
          activity.amount > 0
            ? `+$${activity.amount.toFixed(2)}`
            : `-$${Math.abs(activity.amount).toFixed(2)}`,
        time: getTimeAgo(activity.timestamp),
        type: activity.amount > 0 ? "income" : "expense",
      }));

    // Get user's package count (mock for now - you can implement user investments later)
    const activePackages = user.stats?.activeInvestments || 0;
    const totalPackages = user.stats?.totalPackages || 0;

    // Calculate activity count (transactions in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivityCount = (user.walletHistory || []).filter(
      (activity) => new Date(activity.timestamp) > sevenDaysAgo
    ).length;

    const stats = [
      {
        title: "Total Balance",
        value: `$${walletData.balance.toFixed(2)}`,
        change: `+${growthPercentage}%`,
        changeType:
          Number.parseFloat(growthPercentage) > 0 ? "positive" : "neutral",
      },
      {
        title: "Active Packages",
        value: activePackages.toString(),
        change: totalPackages > 0 ? `${totalPackages} total` : "No packages",
        changeType: "neutral",
      },
      {
        title: "Monthly Growth",
        value: `${growthPercentage}%`,
        change: growthPercentage > 0 ? "This month" : "No growth",
        changeType:
          Number.parseFloat(growthPercentage) > 0 ? "positive" : "neutral",
      },
      {
        title: "Activities",
        value: recentActivityCount.toString(),
        change: "Last 7 days",
        changeType: "neutral",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.fullName || user.name,
          email: user.email,
          username: user.username,
        },
        wallet: walletData,
        stats,
        recentActivities:
          recentActivities.length > 0
            ? recentActivities
            : [
                {
                  id: "1",
                  action: "Welcome bonus",
                  amount: "+$0.00",
                  time: "Just now",
                  type: "income",
                },
              ],
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return time.toLocaleDateString();
}
