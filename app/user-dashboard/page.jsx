"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MobileHeader from "../../components/MobileHeader";
import BottomNavigation from "../../components/BottomNavigation";
import PWAInstall from "../../components/PWAInstall";
import PWARegistration from "../../components/PWARegistration";
import ManualInstallButton from "../../components/ManualInstallButton";
import {
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  RefreshCw,
  Clock,
  Gift,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { BrowserRouter } from "react-router-dom";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [giftCodeData, setGiftCodeData] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id;

      // Fetch all dashboard data in parallel
      const [
        dashboardResponse,
        earningsResponse,
        withdrawalResponse,
        giftCodeResponse,
        referralResponse,
      ] = await Promise.all([
        fetch(`/api/user/dashboard?userId=${userId}`),
        fetch(`/api/user/dashboard/earnings-today?userId=${userId}`),
        fetch(`/api/user/dashboard/withdrawal-requests?userId=${userId}`),
        fetch(`/api/user/dashboard/gift-code-history?userId=${userId}`),
        fetch(`/api/user/dashboard/referral-commissions?userId=${userId}`),
      ]);

      const [
        dashboardResult,
        earningsResult,
        withdrawalResult,
        giftCodeResult,
        referralResult,
      ] = await Promise.all([
        dashboardResponse.json(),
        earningsResponse.json(),
        withdrawalResponse.json(),
        giftCodeResponse.json(),
        referralResponse.json(),
      ]);

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        setError(null);
      } else {
        setError(dashboardResult.error || "Failed to fetch dashboard data");
      }

      if (earningsResult.success) {
        setEarningsData(earningsResult.data);
      }

      if (withdrawalResult.success) {
        setWithdrawalData(withdrawalResult.data);
      }

      if (giftCodeResult.success) {
        setGiftCodeData(giftCodeResult.data);
      }

      if (referralResult.success) {
        setReferralData(referralResult.data);
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
      <div className="min-h-screen bg-[#ffff00] pb-20">
        <PWARegistration />
        <MobileHeader title="Dashboard" />

        <main className="px-4 py-6 max-w-md mx-auto">
          {/* PWA Install Prompt */}
          <PWAInstall />
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

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 mb-3">
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
              <ManualInstallButton />
            </CardContent>
          </Card>

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

          {/* Earnings Generated Today */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Earnings Generated Today
                </CardTitle>
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
              <div className="mb-4">
                <p className="text-2xl font-bold text-green-600">
                  Ksh{earningsData?.totalEarnings || "0.00"}
                </p>
                <p className="text-sm text-gray-600">Total earnings today</p>
              </div>
              {earningsData?.earnings && earningsData.earnings.length > 0 ? (
                <div className="space-y-3">
                  {earningsData.earnings.slice(0, 5).map((earning) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {earning.description || "Earning"}
                        </p>
                        <p className="text-xs text-gray-500">{earning.timeAgo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {earning.formattedAmount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No earnings today</p>
                  <p className="text-xs">Complete tasks to earn rewards</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Records of Withdrawal Requests */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Withdrawal Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending: {withdrawalData?.pendingRequests || 0}</span>
                  <span className="text-gray-600">Total: {withdrawalData?.totalRequests || 0}</span>
                </div>
              </div>
              {withdrawalData?.requests && withdrawalData.requests.length > 0 ? (
                <div className="space-y-3">
                  {withdrawalData.requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {request.description || "Withdrawal Request"}
                        </p>
                        <p className="text-xs text-gray-500">{request.timeAgo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {request.formattedAmount}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${request.statusColor}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No withdrawal requests</p>
                  <p className="text-xs">Your withdrawal history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claimed Gift Code History */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4 text-purple-600" />
                Gift Code History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <p className="text-lg font-bold text-purple-600">
                  Ksh{giftCodeData?.totalValue || "0.00"}
                </p>
                <p className="text-sm text-gray-600">Total value claimed</p>
              </div>
              {giftCodeData?.redemptions && giftCodeData.redemptions.length > 0 ? (
                <div className="space-y-3">
                  {giftCodeData.redemptions.slice(0, 5).map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {redemption.description || "Gift Code Redemption"}
                        </p>
                        <p className="text-xs text-gray-500">{redemption.timeAgo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">
                          {redemption.formattedAmount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No gift codes claimed</p>
                  <p className="text-xs">Your gift code history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Commissions Earned Today */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Referral Commissions Today
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <p className="text-2xl font-bold text-orange-600">
                  Ksh{referralData?.todayCommissions || "0.00"}
                </p>
                <p className="text-sm text-gray-600">Total today • Ksh{referralData?.totalCommissions || "0.00"} all time</p>
              </div>
              {referralData?.commissions && referralData.commissions.length > 0 ? (
                <div className="space-y-3">
                  {referralData.commissions.slice(0, 5).map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {commission.description || "Referral Commission"}
                        </p>
                        <p className="text-xs text-gray-500">{commission.timeAgo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          {commission.formattedAmount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No referral commissions today</p>
                  <p className="text-xs">Invite friends to earn commissions</p>
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
