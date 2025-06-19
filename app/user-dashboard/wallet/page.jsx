"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MobileHeader from "../../../components/MobileHeader"
import BottomNavigation from "../../../components/BottomNavigation"
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign } from "lucide-react"

export default function WalletPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "user") {
    return null
  }

  const walletData = {
    balance: 2450.75,
    pendingBalance: 125.5,
    totalEarnings: 1875.25,
    totalWithdrawals: 950.0,
  }

  const transactions = [
    { id: 1, type: "deposit", amount: 500.0, description: "Bank Transfer", date: "2024-01-15", status: "completed" },
    {
      id: 2,
      type: "withdrawal",
      amount: -150.0,
      description: "Withdrawal to Bank",
      date: "2024-01-14",
      status: "completed",
    },
    { id: 3, type: "earning", amount: 75.5, description: "Package ROI", date: "2024-01-13", status: "completed" },
    { id: 4, type: "deposit", amount: 200.0, description: "Credit Card", date: "2024-01-12", status: "pending" },
    { id: 5, type: "earning", amount: 45.25, description: "Referral Bonus", date: "2024-01-11", status: "completed" },
  ]

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "earning":
        return <DollarSign className="h-4 w-4 text-blue-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case "deposit":
      case "earning":
        return "text-green-600"
      case "withdrawal":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Wallet" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Wallet Balance Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Total Balance</p>
                <p className="text-3xl font-bold">${walletData.balance.toFixed(2)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-200" />
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-blue-100">Pending</p>
                <p className="font-medium">${walletData.pendingBalance.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Available</p>
                <p className="font-medium">${(walletData.balance - walletData.pendingBalance).toFixed(2)}</p>
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
                <p className="text-lg font-bold text-green-600">${walletData.totalEarnings.toFixed(2)}</p>
              </div>
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Withdrawals</p>
                <p className="text-lg font-bold text-red-600">${walletData.totalWithdrawals.toFixed(2)}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button className="h-12 flex-col space-y-1" onClick={() => setActiveTab("deposit")}>
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Funds</span>
          </Button>
          <Button variant="outline" className="h-12 flex-col space-y-1" onClick={() => setActiveTab("withdraw")}>
            <Minus className="h-4 w-4" />
            <span className="text-xs">Withdraw</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "deposit" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "withdraw" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
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
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${
                          transaction.status === "completed" ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "deposit" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => setAmount("100")}>
                  $100
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAmount("500")}>
                  $500
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAmount("1000")}>
                  $1000
                </Button>
              </div>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit/Debit Card
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bank Transfer
                </Button>
              </div>
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
                  Available for withdrawal: ${(walletData.balance - walletData.pendingBalance).toFixed(2)}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account">Bank Account</Label>
                <Input id="bank-account" placeholder="Select bank account" value="****1234 - Chase Bank" disabled />
              </div>
              <Button className="w-full">Request Withdrawal</Button>
              <p className="text-xs text-gray-500 text-center">Withdrawals are processed within 1-3 business days</p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
