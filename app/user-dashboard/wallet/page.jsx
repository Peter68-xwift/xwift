"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileHeader from "../../../components/MobileHeader";
import BottomNavigation from "../../../components/BottomNavigation";
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import GiftCodeRedemption from "../../../components/GiftCodeRedemption";

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [amount, setAmount] = useState("");
  const [walletData, setWalletData] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState(null);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      setError(null);

      const userId = user?.id;

      const response = await fetch(`/api/user/wallet?userId=${userId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const result = await response.json();
      if (result.success) {
        setWalletData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch wallet data");
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
      return;
    }

    if (user && user.role === "user") {
      fetchWalletData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    }
    fetchSettings();
  }, []);

  const handleWithdrawal = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (Number.parseFloat(amount) > walletData.availableBalance) {
      alert("Insufficient balance");
      return;
    }

    if (amount < settings.minWithdrawalAmount) {
      alert(`Minimum withdrawal is Ksh ${settings.minWithdrawalAmount}`);
      return;
    }

    if (amount > settings.maxWithdrawalAmount) {
      alert(`Maximum withdrawal is Ksh ${settings.maxWithdrawalAmount}`);
      return;
    }

    try {
      setProcessing(true);
      const userId = user?.id;

      const response = await fetch(`/api/user/wallet?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "withdrawal",
          amount: Number.parseFloat(amount),
          description: "Withdrawal request",
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Withdrawal request submitted successfully!");
        setAmount("");
        fetchWalletData(); // Refresh wallet data
      } else {
        alert(result.error || "Failed to process withdrawal");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || walletLoading) {
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
        <MobileHeader title="Wallet" />
        <main className="px-4 py-6 max-w-md mx-auto">
          <Card className="text-center p-6">
            <CardContent>
              <p className="text-red-600 mb-4">
                Error loading wallet data: {error}
              </p>
              <Button onClick={fetchWalletData} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
      case "credit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "withdrawal":
      case "debit":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "earning":
      case "roi":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "deposit":
      case "credit":
      case "earning":
      case "roi":
        return "text-green-600";
      case "withdrawal":
      case "debit":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-blue-300 pb-20">
      <MobileHeader title="Wallet" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWalletData}
            disabled={walletLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${walletLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Total Balance</p>
                <p className="text-3xl font-bold">
                  Ksh{walletData.balance.toFixed(2)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-200" />
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-blue-100">Pending</p>
                <p className="font-medium">
                  Ksh{walletData.pendingBalance.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Available</p>
                <p className="font-medium">
                  Ksh{walletData.availableBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Earnings</p>
                <p className="text-lg font-bold text-green-600">
                  Ksh{walletData.totalEarnings.toFixed(2)}
                </p>
              </div>
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Withdrawals</p>
                <p className="text-lg font-bold text-red-600">
                  Ksh{walletData.totalWithdrawals.toFixed(2)}
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            className="h-12 flex-col space-y-1"
            onClick={() => router.push("/user-dashboard/deposit")}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Funds</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-col space-y-1"
            onClick={() => setActiveTab("withdraw")}
          >
            <Minus className="h-4 w-4" />
            <span className="text-xs">Withdraw</span>
          </Button>
        </div>

        {/* Gift Code Redemption */}
        <GiftCodeRedemption />

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "withdraw"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {walletData.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {walletData.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p
                          className={`text-xs ${
                            transaction.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "withdraw" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Available for withdrawal: Ksh
                  {walletData.availableBalance.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={walletData.availableBalance}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleWithdrawal}
                disabled={
                  processing || !amount || Number.parseFloat(amount) <= 0
                }
              >
                {processing ? "Processing..." : "Request Withdrawal"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Withdrawals are processed within 1-3 business days
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
