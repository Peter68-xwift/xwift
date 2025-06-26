"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import AdminSidebar from "../../../components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminwithdrawalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [withdrawalRequests, setwithdrawalRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    } else if (user && user.role === "admin") {
      fetchwithdrawalRequests();
    }
  }, [user, loading, router]);

  const fetchwithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id;

      const response = await fetch(
        `/api/admin/Withdrawals-request?userId=${userId}`,
        {}
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setwithdrawalRequests(data.withdrawalRequests);
          setStats(data.stats);
        } else {
          console.error("Failed to fetch withdrawal requests:", data.error);
        }
      } else {
        console.error("Failed to fetch withdrawal requests");
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processwithdrawalRequest = async (requestId, action) => {
    setIsProcessing(true);
    try {
      const userId = user?.id;
      console.log(user);
      const response = await fetch(
        `/api/admin/Withdrawals-request/${requestId}?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            adminNotes,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`withdrawal request ${action}d successfully!`);
        setSelectedRequest(null);
        setAdminNotes("");
        fetchwithdrawalRequests();
      } else {
        alert(data.error || `Failed to ${action} withdrawal request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      alert(`Failed to ${action} withdrawal request`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              withdrawal Requests
            </h1>
            <p className="text-gray-600">
              Manage user withdrawal requests and verifications
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.approved}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.rejected}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      Ksh{stats.totalAmount}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* withdrawal Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  withdrawal Requests ({withdrawalRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {withdrawalRequests.map((request) => (
                    <div
                      key={request._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRequest?._id === request._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className="font-medium">
                            {request.userFullName}
                          </span>
                          <span className="text-sm text-gray-500">
                            @{request.username}
                          </span>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          Ksh{request.amount}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.phoneNumber}
                      </p>
                    </div>
                  ))}

                  {withdrawalRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No withdrawal requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRequest ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          User
                        </Label>
                        <p className="font-medium">
                          {selectedRequest.userFullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{selectedRequest.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRequest.userEmail}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Amount
                        </Label>
                        <p className="text-xl font-bold text-green-600">
                          Ksh{selectedRequest.amount}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Phone Number
                        </Label>
                        <p className="font-medium">
                          {selectedRequest.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          Status
                        </Label>
                        <Badge
                          className={getStatusColor(selectedRequest.status)}
                        >
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Submitted
                      </Label>
                      <p className="text-sm">
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {selectedRequest.status === "pending" && (
                      <>
                        <div>
                          <Label htmlFor="admin-notes">
                            Admin Notes (Optional)
                          </Label>
                          <Textarea
                            id="admin-notes"
                            placeholder="Add notes about this withdrawal request..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={() =>
                              processwithdrawalRequest(
                                selectedRequest._id,
                                "approve"
                              )
                            }
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve</span>
                              </div>
                            )}
                          </Button>
                          <Button
                            onClick={() =>
                              processwithdrawalRequest(
                                selectedRequest._id,
                                "reject"
                              )
                            }
                            disabled={isProcessing}
                            variant="destructive"
                            className="flex-1"
                          >
                            {isProcessing ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </>
                    )}

                    {selectedRequest.status !== "pending" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(selectedRequest.status)}
                          <span className="font-medium">
                            {selectedRequest.status === "approved"
                              ? "Approved & Added to Wallet"
                              : "Rejected"}
                          </span>
                        </div>
                        {selectedRequest.processedAt && (
                          <p className="text-sm text-gray-600">
                            Processed on{" "}
                            {new Date(
                              selectedRequest.processedAt
                            ).toLocaleString()}
                          </p>
                        )}
                        {selectedRequest.adminNotes && (
                          <div className="mt-2">
                            <Label className="text-sm font-medium text-gray-600">
                              Admin Notes
                            </Label>
                            <p className="text-sm mt-1">
                              {selectedRequest.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a withdrawal request to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
