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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Package,
} from "lucide-react";

export default function AdminReports() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState("financial");
  const [dateRange, setDateRange] = useState("30d");

  const reports = [
    {
      id: "financial",
      name: "Financial Report",
      description: "Revenue, investments, and financial metrics",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      id: "users",
      name: "User Report",
      description: "User registrations, activity, and demographics",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      id: "packages",
      name: "Package Performance",
      description: "Package subscriptions and performance metrics",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      id: "activity",
      name: "Activity Report",
      description: "Platform usage and user engagement",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  const financialData = [
    {
      metric: "Total Revenue",
      value: "Ksh485,000",
      change: "+23%",
      trend: "up",
    },
    {
      metric: "Active Investments",
      value: "Ksh325,000",
      change: "+15%",
      trend: "up",
    },
    {
      metric: "Monthly Recurring Revenue",
      value: "Ksh45,000",
      change: "+8%",
      trend: "up",
    },
    {
      metric: "Average Investment Size",
      value: "Ksh2,450",
      change: "-2%",
      trend: "down",
    },
  ];

  const userData = [
    { metric: "Total Users", value: "1,247", change: "+12%", trend: "up" },
    { metric: "Active Users", value: "892", change: "+5%", trend: "up" },
    { metric: "New Registrations", value: "156", change: "+18%", trend: "up" },
    { metric: "User Retention Rate", value: "78%", change: "+3%", trend: "up" },
  ];

  const packageData = [
    {
      name: "Premium Growth",
      subscribers: 245,
      revenue: "Ksh122,500",
      roi: "18.5%",
    },
    {
      name: "Stable Income",
      subscribers: 387,
      revenue: "Ksh96,750",
      roi: "12.3%",
    },
    {
      name: "High Yield",
      subscribers: 156,
      revenue: "Ksh78,000",
      roi: "25.7%",
    },
    {
      name: "Conservative",
      subscribers: 298,
      revenue: "Ksh59,600",
      roi: "8.9%",
    },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const renderReportContent = () => {
    switch (selectedReport) {
      case "financial":
        return (
          <div className="space-y-6 bg-blue-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {financialData.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.metric}
                        </p>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p
                          className={`text-xs ${
                            item.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.change}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6 bg-blue-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userData.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.metric}
                        </p>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p
                          className={`text-xs ${
                            item.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.change}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "packages":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Package Performance</CardTitle>
              <CardDescription>
                Detailed package metrics and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packageData.map((pkg, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.subscribers}</TableCell>
                      <TableCell>{pkg.revenue}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pkg.roi}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center ">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Activity Report
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Platform usage and engagement metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-blue-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and view detailed platform reports
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange === "30d"
                ? "Last 30 Days"
                : dateRange === "90d"
                ? "Last 90 Days"
                : "Last 7 Days"}
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedReport === report.id
                    ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-5 w-5 ${report.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Content */}
        {renderReportContent()}
      </div>
    </AdminSidebar>
  );
}
