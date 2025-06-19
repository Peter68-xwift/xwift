"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminSidebar from "../../components/AdminSidebar"
import { Users, Package, DollarSign, TrendingUp, Activity, UserPlus, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalPackages: 12,
    totalRevenue: 125430,
    monthlyGrowth: 12.5,
    pendingApprovals: 23,
  })

  const [recentActivities] = useState([
    { id: 1, type: "user_joined", message: "New user John Doe registered", time: "2 minutes ago" },
    { id: 2, type: "package_purchased", message: "Premium package purchased by Jane Smith", time: "15 minutes ago" },
    { id: 3, type: "withdrawal", message: "Withdrawal request from Bob Johnson", time: "1 hour ago" },
    { id: 4, type: "package_created", message: "New VIP package created", time: "2 hours ago" },
    { id: 5, type: "user_verified", message: "User Alice Brown verified", time: "3 hours ago" },
  ])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_joined":
        return <UserPlus className="h-4 w-4 text-green-600" />
      case "package_purchased":
        return <Package className="h-4 w-4 text-blue-600" />
      case "withdrawal":
        return <DollarSign className="h-4 w-4 text-orange-600" />
      case "package_created":
        return <Package className="h-4 w-4 text-purple-600" />
      case "user_verified":
        return <Users className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">+23% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.monthlyGrowth}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push("/admin-dashboard/users")}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Users className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                </button>
                <button
                  onClick={() => router.push("/admin-dashboard/packages")}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Package className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Package</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <DollarSign className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">View Revenue</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Pending ({stats.pendingApprovals})
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Activities</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Latest system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">System Status</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Current system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">45GB</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}
