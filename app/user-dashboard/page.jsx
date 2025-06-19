"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MobileHeader from "../../components/MobileHeader"
import BottomNavigation from "../../components/BottomNavigation"
import { TrendingUp, DollarSign, Package, Activity } from "lucide-react"

export default function UserDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  const stats = [
    {
      title: "Total Balance",
      value: "$2,450.00",
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Active Packages",
      value: "3",
      icon: Package,
      change: "+2 this month",
      changeType: "neutral",
    },
    {
      title: "Monthly Growth",
      value: "18.2%",
      icon: TrendingUp,
      change: "+4.1% from last month",
      changeType: "positive",
    },
    {
      title: "Activities",
      value: "24",
      icon: Activity,
      change: "Last 7 days",
      changeType: "neutral",
    },
  ]

  const recentActivities = [
    { id: 1, action: "Package purchased", amount: "+$150.00", time: "2 hours ago", type: "income" },
    { id: 2, action: "Withdrawal processed", amount: "-$75.00", time: "5 hours ago", type: "expense" },
    { id: 3, action: "Referral bonus", amount: "+$25.00", time: "1 day ago", type: "income" },
    { id: 4, action: "Package activated", amount: "+$200.00", time: "2 days ago", type: "income" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Dashboard" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      stat.changeType === "positive" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-12 flex-col space-y-1" onClick={() => router.push("/user-dashboard/packages")}>
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
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        activity.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {activity.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  )
}
