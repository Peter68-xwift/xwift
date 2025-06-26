"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MobileHeader from "../../components/MobileHeader";
import BottomNavigation from "../../components/BottomNavigation";
import {
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  RefreshCw,
} from "lucide-react";
import { BrowserRouter } from "react-router-dom";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // console.log(user)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const userId = user?.id; // ← replace this with the actual ID from auth context or state
      const response = await fetch(`/api/user/dashboard?userId=${userId}`);

      console.log(response);
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
      return;
    }

    if (user && user.role === "user") {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader title="Dashboard" />
        <main className="px-4 py-6 max-w-md mx-auto">
          <Card className="text-center p-6">
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const stats = dashboardData?.stats || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const wallet = dashboardData?.wallet || {};

  const getStatIcon = (title) => {
    switch (title) {
      case "Total Balance":
        return DollarSign;
      case "Active Packages":
        return Package;
      case "Monthly Growth":
        return TrendingUp;
      case "Activities":
        return Activity;
      default:
        return DollarSign;
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-blue-300 pb-20">
        <MobileHeader title="Dashboard" />

        <main className="px-4 py-6 max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {dashboardData?.user?.name?.split(" ")[0] || "User"}
              !
            </h1>
            <p className="text-sm text-gray-600">
              Here's your portfolio overview
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = getStatIcon(stat.title);
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === "positive"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">{stat.title}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Wallet Summary */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold">
                    Ksh{wallet.availableBalance?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-blue-100">Total Invested</p>
                  <p className="font-medium">
                    Ksh{wallet.totalInvested?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100">Total Returns</p>
                  <p className="font-medium">
                    Ksh{wallet.totalReturns?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="h-12 flex-col space-y-1"
                  onClick={() => router.push("/user-dashboard/packages")}
                >
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Buy Package</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-col space-y-1"
                  onClick={() => router.push("/user-dashboard/wallet")}
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Add Funds</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            activity.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {activity.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                  <p className="text-xs">
                    Start investing to see your activity here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
}
