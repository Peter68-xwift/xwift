import { NextResponse } from "next/server";
import {
  UserModel,
  PackageModel,
  GiftCodeModel,
} from "../../../../lib/database.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch real data from database
    const [totalUsers, activeUsers, allPackages, allGiftCodes, recentUsers] =
      await Promise.all([
        UserModel.getAllUsers({ page: 1, limit: 1000000 }),
        UserModel.getAllUsers({ page: 1, limit: 1000000, status: "active" }),
        PackageModel.getAllPackages(),
        GiftCodeModel.getAllGiftCodes(),
        UserModel.getAllUsers({
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

    // Calculate real statistics
    const totalUsersCount = totalUsers.users.length;
    const activeUsersCount = activeUsers.users.length;
    const totalPackagesCount = allPackages.packages.length;
    const activePackagesCount = allPackages.packages.filter(
      (pkg) => pkg.status === "active"
    ).length;

    // Calculate total revenue from packages
    const totalRevenue = allPackages.packages.reduce(
      (sum, pkg) => sum + (pkg.totalRevenue || 0),
      0
    );

    // Calculate total wallet balances
    const totalWalletBalance = totalUsers.users.reduce((sum, user) => {
      return sum + (user.wallet?.balance || 0);
    }, 0);

    // Calculate total invested amounts
    const totalInvested = totalUsers.users.reduce((sum, user) => {
      return sum + (user.wallet?.totalInvested || 0);
    }, 0);

    // Calculate gift code statistics
    const totalGiftCodes = allGiftCodes.giftCodes.length;
    const redeemedGiftCodes = allGiftCodes.giftCodes.filter(
      (code) => code.isRedeemed
    ).length;
    const totalGiftValue = allGiftCodes.giftCodes.reduce(
      (sum, code) => sum + code.amount,
      0
    );
    const redeemedGiftValue = allGiftCodes.giftCodes
      .filter((code) => code.isRedeemed)
      .reduce((sum, code) => sum + code.amount, 0);

    // Generate user growth data for last 6 months
    const userGrowth = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      monthDate.setDate(1);

      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const usersInMonth = totalUsers.users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate >= monthDate && userDate < nextMonth;
      }).length;

      userGrowth.push({
        month: monthNames[monthDate.getMonth()],
        users: usersInMonth,
      });
    }

    // Generate revenue data (mock for now, can be replaced with actual transaction data)
    const revenueData = userGrowth.map((month, index) => ({
      month: month.month,
      revenue: Math.floor(totalRevenue / 6) + Math.random() * 10000, // Distribute revenue across months
    }));

    // Get top performing packages
    const topPerformingPackages = allPackages.packages
      .filter((pkg) => pkg.status === "active")
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 4)
      .map((pkg) => ({
        name: pkg.name,
        subscribers: pkg.subscribers || 0,
        revenue: pkg.totalRevenue || 0,
        roi: pkg.roi || 0,
      }));

    // Get recent transactions (from recent users and gift code redemptions)
    const recentTransactions = [];

    // Add recent user registrations
    recentUsers.users.slice(0, 3).forEach((user) => {
      recentTransactions.push({
        user: user.fullName,
        type: "registration",
        description: "New user registration",
        amount: 0,
        date: user.createdAt,
      });
    });

    // Add recent gift code redemptions
    const recentRedemptions = allGiftCodes.giftCodes
      .filter((code) => code.isRedeemed)
      .sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt))
      .slice(0, 2);

    recentRedemptions.forEach((code) => {
      const user = totalUsers.users.find(
        (u) => u._id.toString() === code.redeemedBy?.toString()
      );
      recentTransactions.push({
        user: user?.fullName || "Unknown User",
        type: "gift_redemption",
        description: `Gift code redeemed: ${code.code}`,
        amount: code.amount,
        date: code.redeemedAt,
      });
    });

    // Sort transactions by date
    recentTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const analytics = {
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
      totalRevenue: totalRevenue,
      totalWalletBalance: totalWalletBalance,
      totalInvested: totalInvested,
      totalPackages: totalPackagesCount,
      activePackages: activePackagesCount,
      activeInvestments: totalInvested, // Same as total invested for now

      // Gift code statistics
      giftCodeStats: {
        total: totalGiftCodes,
        redeemed: redeemedGiftCodes,
        totalValue: totalGiftValue,
        redeemedValue: redeemedGiftValue,
      },

      // Growth data
      userGrowth: userGrowth,
      revenueData: revenueData,

      // Top packages
      topPerformingPackages: topPerformingPackages,

      // Recent activities
      recentTransactions: recentTransactions.slice(0, 5),

      // Additional metrics
      userGrowthPercentage:
        userGrowth.length > 1
          ? Math.round(
              ((userGrowth[userGrowth.length - 1].users -
                userGrowth[userGrowth.length - 2].users) /
                userGrowth[userGrowth.length - 2].users) *
                100
            )
          : 0,

      revenueGrowthPercentage: 15, // Can be calculated from actual revenue data

      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
