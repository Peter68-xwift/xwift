"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Search,
  Eye,
  Check,
  X,
  RefreshCw,
  Phone,
  CreditCard,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
export default function AdminSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      //   const token = localStorage.getItem("token");
      const userId = user.id;
      // console.log(user)

      const response = await fetch(
        `/api/admin/subscriptions?userId=${userId}`,
        {
          headers: {
            //   Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.data.subscriptions);
        setStats(data.data.stats);
      } else {
        setError("Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Error fetching subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const processSubscription = async (subscriptionId, action) => {
    try {
      setProcessing(subscriptionId);
      setError("");
      setSuccess("");

      // const token = localStorage.getItem("token");
      const userId = user.id;
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            adminNotes:
              adminNotes ||
              (action === "approve"
                ? "Subscription approved"
                : "Subscription rejected"),
          }),
        }
      );

      if (response.ok) {
        setSuccess(`Subscription ${action}d successfully`);
        setAdminNotes("");
        setSelectedSubscription(null);
        fetchSubscriptions();
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action}ing subscription:`, error);
      setError(`Error ${action}ing subscription`);
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending Approval",
      },
      pending_verification: {
        color: "bg-orange-100 text-orange-800",
        text: "Pending Payment",
      },
      active: { color: "bg-green-100 text-green-800", text: "Active" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completed" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getPaymentMethodBadge = (method) => {
    return method === "wallet" ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        <CreditCard className="w-3 h-3 mr-1" />
        Wallet
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        <Phone className="w-3 h-3 mr-1" />
        M-Pesa
      </Badge>
    );
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.userFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.packageName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-[#ffff00]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Package Subscriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage user package subscriptions and approvals
            </p>
          </div>
          <Button onClick={fetchSubscriptions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSubscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approval
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingSubscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeSubscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Ksh{(stats.totalRevenue || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by user name, username, or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Approval</option>
            <option value="pending_verification">Pending Payment</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No subscriptions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {searchTerm || statusFilter !== "all"
                    ? "No subscriptions match your current filters."
                    : "No package subscriptions have been created yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSubscriptions.map((subscription) => (
              <Card
                key={subscription._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {subscription.packageName}
                        </h3>
                        {getStatusBadge(subscription.status)}
                        {getPaymentMethodBadge(subscription.paymentMethod)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User:</span>
                          <p className="font-medium">
                            {subscription.userFullName}
                          </p>
                          <p className="text-gray-600">
                            @{subscription.username}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium text-green-600">
                            Ksh{subscription.amount}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">
                            {subscription.packageDuration} days
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <p className="font-medium">
                            {new Date(
                              subscription.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {subscription.transactionMessage && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <span className="text-sm text-gray-500">
                            M-Pesa Transaction:
                          </span>
                          <p className="text-sm font-mono mt-1">
                            {subscription.transactionMessage}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedSubscription(subscription)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Subscription Details</DialogTitle>
                            <DialogDescription>
                              Review subscription information and take action
                            </DialogDescription>
                          </DialogHeader>

                          {selectedSubscription && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Package
                                  </label>
                                  <p className="font-medium">
                                    {selectedSubscription.packageName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    User
                                  </label>
                                  <p className="font-medium">
                                    {selectedSubscription.userFullName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Amount
                                  </label>
                                  <p className="font-medium text-green-600">
                                    Ksh{selectedSubscription.amount}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Payment Method
                                  </label>
                                  <p className="font-medium">
                                    {selectedSubscription.paymentMethod}
                                  </p>
                                </div>
                              </div>

                              {selectedSubscription.transactionMessage && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Transaction Message
                                  </label>
                                  <div className="bg-gray-50 p-3 rounded-md mt-1">
                                    <p className="text-sm font-mono">
                                      {selectedSubscription.transactionMessage}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Admin Notes
                                </label>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) =>
                                    setAdminNotes(e.target.value)
                                  }
                                  placeholder="Add notes for this action..."
                                  className="mt-1"
                                />
                              </div>

                              {[
                                "pending_payment",
                                "pending",
                                "pending_verification",
                              ].includes(selectedSubscription.status) && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() =>
                                      processSubscription(
                                        selectedSubscription._id,
                                        "approve"
                                      )
                                    }
                                    disabled={
                                      processing === selectedSubscription._id
                                    }
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    {processing === selectedSubscription._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <Check className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      processSubscription(
                                        selectedSubscription._id,
                                        "reject"
                                      )
                                    }
                                    disabled={
                                      processing === selectedSubscription._id
                                    }
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    {processing === selectedSubscription._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <X className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {[
                        "pending_payment",
                        "pending",
                        "pending_verification",
                      ].includes(subscription.status) && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              processSubscription(subscription._id, "approve");
                            }}
                            disabled={processing === subscription._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === subscription._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              processSubscription(subscription._id, "reject");
                            }}
                            disabled={processing === subscription._id}
                            size="sm"
                            variant="destructive"
                          >
                            {processing === subscription._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
