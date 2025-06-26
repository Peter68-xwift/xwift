import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { UserModel, GiftCodeModel } from "../../../../lib/database";

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

    // DB connection
    const client = await clientPromise;
    const db = client.db("mern_auth_app"); // 🔁 use your actual DB name
    const packagesCollection = db.collection("packages");
    const giftCollection = db.collection("gift_codes");

    // Fetch packages directly from the database
    const packages = await packagesCollection.find({}).toArray();
    const gifts = await giftCollection.find({}).toArray();

    // Fetch other data from models
    const [totalUsers, activeUsers, allGiftCodes, recentUsers] =
      await Promise.all([
        UserModel.getAllUsers({ page: 1, limit: 1000000 }),
        UserModel.getAllUsers({ page: 1, limit: 1000000, status: "active" }),
        GiftCodeModel.getAllGiftCodes(),
        UserModel.getAllUsers({
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

    const totalUsersCount = totalUsers.users.length;
    const activeUsersCount = activeUsers.users.length;

    // 🟩 Package Stats
    const totalPackagesCount = packages.length;
    const activePackagesCount = packages.filter(
      (pkg) => pkg.status === "active"
    ).length;
    const totalRevenue = packages.reduce(
      (sum, pkg) => sum + (pkg.totalRevenue || 0),
      0
    );

    // 🟩 Wallet Stats
    const totalWalletBalance = totalUsers.users.reduce((sum, user) => {
      return sum + (user.wallet?.balance || 0);
    }, 0);

    const totalInvested = totalUsers.users.reduce((sum, user) => {
      return sum + (user.wallet?.totalInvested || 0);
    }, 0);

    // 🟩 Gift Code Stats
    const totalGiftCodes = gifts?.length || 0;
    const redeemedGiftCodes = gifts?.filter(
      (code) => code.isRedeemed
    ).length;
    const totalGiftValue = gifts?.reduce(
      (sum, code) => sum + code.amount,
      0
    );
    const redeemedGiftValue = gifts
      ?.filter((code) => code.isRedeemed)
      ?.reduce((sum, code) => sum + code.amount, 0);

    // 🟩 User Growth (Last 6 Months)
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

    const revenueData = userGrowth.map((month) => ({
      month: month.month,
      revenue: Math.floor(totalRevenue / 6) + Math.random() * 10000,
    }));

    // 🟩 Top Performing Packages
    const topPerformingPackages = packages
      .filter((pkg) => pkg.status === "active")
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 4)
      .map((pkg) => ({
        name: pkg.name,
        subscribers: pkg.subscribers || 0,
        revenue: pkg.totalRevenue || 0,
        roi: pkg.roi || 0,
      }));

    // 🟩 Recent Transactions
    const recentTransactions = [];

    recentUsers.users.slice(0, 3).forEach((user) => {
      recentTransactions.push({
        user: user.fullName,
        type: "registration",
        description: "New user registration",
        amount: 0,
        date: user.createdAt,
      });
    });

    const recentRedemptions = gifts
      ?.filter((code) => code.isRedeemed)
      ?.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt))
      ?.slice(0, 2);

    recentRedemptions?.forEach((code) => {
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

    recentTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 🟩 Final Analytics Object
    const analytics = {
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
      totalRevenue,
      totalWalletBalance,
      totalInvested,
      totalPackages: totalPackagesCount,
      activePackages: activePackagesCount,
      activeInvestments: totalInvested,
      giftCodeStats: {
        total: totalGiftCodes,
        redeemed: redeemedGiftCodes,
        totalValue: totalGiftValue,
        redeemedValue: redeemedGiftValue,
      },
      userGrowth,
      revenueData,
      topPerformingPackages,
      recentTransactions: recentTransactions.slice(0, 5),
      userGrowthPercentage:
        userGrowth.length > 1
          ? Math.round(
              ((userGrowth[userGrowth.length - 1].users -
                userGrowth[userGrowth.length - 2].users) /
                userGrowth[userGrowth.length - 2].users) *
                100
            )
          : 0,
      revenueGrowthPercentage: 15,
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
