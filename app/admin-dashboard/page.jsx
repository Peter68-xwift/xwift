"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  UserPlus,
  AlertCircle,
  Wallet,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    } else if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/activities"),
      ]);

      if (statsResponse.ok && activitiesResponse.ok) {
        const stats = await statsResponse.json();
        const activities = await activitiesResponse.json();

        setDashboardData({
          ...stats,
          recentActivities: activities,
        });
        setLastUpdated(new Date());
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <AdminSidebar>
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-100 dark:bg-gray-800 rounded-lg p-6 h-32"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (!dashboardData) {
    return (
      <AdminSidebar>
        <div className="p-6 flex items-center justify-center min-h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to load dashboard data
            </h3>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case "package_created":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "deposit":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "withdrawal":
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-[#ffff00] dark:bg-gray-900 min-h-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.name || user.fullName}
              {lastUpdated && (
                <span className="text-sm ml-2">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-green-600">
                +{dashboardData.userGrowthPercentage}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.activeUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-blue-600">
                {(
                  (dashboardData.activeUsers / dashboardData.totalUsers) *
                  100
                ).toFixed(1)}
                % of total users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalRevenue)}
              </div>
              <p className="text-xs text-green-600">
                From package subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Total Invested
              </CardTitle>
              <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalInvested)}
              </div>
              <p className="text-xs text-purple-600">Active investments</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Active Packages
              </CardTitle>
              <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.totalPackages}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Available for investment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalWalletBalance)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total user balances
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                Monthly Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.monthlyGrowthPercentage}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                User growth this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                User Growth (Last 6 Months)
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Monthly user registration trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {dashboardData.monthlyGrowth.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${Math.max(
                          (data.users /
                            Math.max(
                              ...dashboardData.monthlyGrowth.map((d) => d.users)
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

          {/* Recent Activities */}
          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Recent Activities
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Latest platform activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {dashboardData.recentActivities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/admin-dashboard/users")}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Users
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {dashboardData.totalUsers} total
                </p>
              </button>
              <button
                onClick={() => router.push("/admin-dashboard/packages")}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Package className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Packages
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {dashboardData.totalPackages} active
                </p>
              </button>
              <button
                onClick={() => router.push("/admin-dashboard/analytics")}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View Analytics
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Detailed reports
                </p>
              </button>
              <button
                onClick={() => router.push("/admin-dashboard/settings")}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Settings
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Platform config
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Packages */}
        {dashboardData.topPackages.length > 0 && (
          <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Top Performing Packages
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Highest revenue generating packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topPackages.slice(0, 5).map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card className="bg-blue-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              System Status
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Current system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.systemStats.uptime}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uptime
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.systemStats.avgResponseTime}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.systemStats.storageUsed}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Storage Used
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.systemStats.totalTransactions}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
