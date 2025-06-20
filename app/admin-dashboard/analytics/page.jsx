"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Gift,
} from "lucide-react";

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/analytics`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  if (loading || isLoading) {
    return (
      <AdminSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading real analytics data...
            </p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-medium">
              Error Loading Analytics
            </h3>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            <Button onClick={fetchAnalytics} className="mt-3" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!analytics) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            No analytics data available.
          </p>
        </div>
      </AdminSidebar>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time platform analytics from MongoDB
              {lastUpdated && (
                <span className="block text-sm mt-1">
                  Last updated: {formatDate(lastUpdated)}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {[
                { value: "7d", label: "7D" },
                { value: "30d", label: "30D" },
                { value: "90d", label: "90D" },
                { value: "1y", label: "1Y" },
              ].map((range) => (
                <Button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  variant={timeRange === range.value ? "default" : "outline"}
                  size="sm"
                >
                  {range.label}
                </Button>
              ))}
            </div>

            {/* Refresh Button */}
            <Button onClick={fetchAnalytics} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totalUsers)}
                  </p>
                  <p className="text-xs text-blue-600">
                    {analytics.activeUsers} active users
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                  <p className="text-xs text-green-600">
                    +{analytics.revenueGrowthPercentage}% from last period
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Packages
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.activePackages)}
                  </p>
                  <p className="text-xs text-blue-600">
                    {analytics.totalPackages} total packages
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Invested
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(analytics.totalInvested)}
                  </p>
                  <p className="text-xs text-green-600">
                    Wallet: {formatCurrency(analytics.totalWalletBalance)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gift Code Statistics */}
        {analytics.giftCodeStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Gift Code Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.giftCodeStats.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Codes
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.giftCodeStats.redeemed}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Redeemed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analytics.giftCodeStats.totalValue)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Value
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(analytics.giftCodeStats.redeemedValue)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Redeemed Value
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                User Growth (Real Data)
              </CardTitle>
              <CardDescription>
                Monthly user registration from MongoDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.userGrowth.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                      style={{
                        height: `${Math.max(
                          (data.users /
                            Math.max(
                              ...analytics.userGrowth.map((d) => d.users)
                            )) *
                            200,
                          10
                        )}px`,
                      }}
                      title={`${data.month}: ${data.users} new users`}
                    ></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {data.month}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {data.users}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Distribution
              </CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.revenueData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 cursor-pointer"
                      style={{
                        height: `${Math.max(
                          (data.revenue /
                            Math.max(
                              ...analytics.revenueData.map((d) => d.revenue)
                            )) *
                            200,
                          10
                        )}px`,
                      }}
                      title={`${data.month}: ${formatCurrency(data.revenue)}`}
                    ></div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Packages (Real Data)</CardTitle>
              <CardDescription>
                Actual package performance from database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingPackages.length > 0 ? (
                  analytics.topPerformingPackages.map((pkg, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {pkg.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {pkg.subscribers} subscribers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(pkg.revenue)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {pkg.roi}% ROI
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No packages found. Create some packages to see performance
                    data.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activities</CardTitle>
              <CardDescription>
                Latest user activities and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentTransactions.length > 0 ? (
                  analytics.recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "registration"
                              ? "bg-blue-500"
                              : transaction.type === "gift_redemption"
                              ? "bg-purple-500"
                              : transaction.type === "withdrawal"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {transaction.user}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {transaction.amount > 0 && (
                          <div className="font-semibold text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activities found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}
