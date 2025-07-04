"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import MobileHeader from "@/components/MobileHeader";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedingId, setFeedingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const router = useRouter();

  const fetchSubscriptions = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        router.push("/");
        return;
      }

      const response = await fetch(`/api/user/subscriptions?userId=${userId}`);

      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data.subscriptions);
        // console.log(data.data.subscriptions);
        setStats(data.data.stats);
        // console.log(data.data.stats);
      } else {
        setMessage(data.error || "Failed to fetch subscriptions");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setMessage("Failed to fetch subscriptions");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleFeed = async (subscriptionId) => {
    try {
      setFeedingId(subscriptionId);
      const userId = user?.id;

      const response = await fetch(`/api/user/feed-package?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `🎉 ${data.message} +Ksh${data.data.dailyAmount} added to your wallet!`
        );
        setMessageType("success");
        fetchSubscriptions(); // Refresh data
      } else {
        setMessage(data.error || "Failed to claim daily income");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error feeding package:", error);
      setMessage("Failed to claim daily income");
      setMessageType("error");
    } finally {
      setFeedingId(null);
    }
  };

  const formatTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffff00] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    // <BottomNavigation>
    <div className="min-h-screen bg-gray-50 p-4">
      <MobileHeader title="Subscriptions" />
      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Subscriptions
            </h1>
            <p className="text-gray-600">
              Manage your active products and claim daily income
            </p>
          </div>
          <Button onClick={fetchSubscriptions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Message */}
        {message && (
          <Alert
            className={
              messageType === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }
          >
            <AlertDescription
              className={
                messageType === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2  gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <p className="text-xl font-bold">
                    {stats.totalSubscriptions || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Daily Income</p>
                  <p className="text-xl font-bold">
                    Ksh{stats.totalDailyIncome || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold">
                    Ksh{stats.totalEarnings || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Available Claims</p>
                  <p className="text-xl font-bold">
                    {stats.availableFeeds || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Subscriptions
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have any active products subscriptions yet.
              </p>
              <Button onClick={() => router.push("/user-dashboard/packages")}>
                Browse products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {subscription.packageName}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Package Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Investment</p>
                      <p className="font-semibold">
                        Ksh{subscription.packagePrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Daily Income</p>
                      <p className="font-semibold text-green-600">
                        Ksh{subscription.dailyIncome}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Earned</p>
                      <p className="font-semibold text-blue-600">
                        Ksh{subscription.totalEarnings}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Left</p>
                      <p className="font-semibold">{subscription.daysLeft}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {subscription.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subscription.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Feed Section */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <Zap className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Claims</p>
                        <p className="text-sm text-gray-600">
                          {subscription.fedToday
                            ? `Claim today! Next Claim in ${formatTimeUntilTomorrow()}`
                            : `Claim your daily Ksh${subscription.dailyIncome}`}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleFeed(subscription.id)}
                      disabled={
                        !subscription.canFeed || feedingId === subscription.id
                      }
                      className={
                        subscription.canFeed
                          ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          : "bg-gray-300"
                      }
                    >
                      {feedingId === subscription.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : subscription.fedToday ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {subscription.fedToday ? "Claimed" : "Claim"}
                    </Button>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Started: {subscription.startDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Ends: {subscription.endDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
