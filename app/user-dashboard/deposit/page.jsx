"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileHeader from "../../../components/MobileHeader";
import BottomNavigation from "../../../components/BottomNavigation";
import {
  ArrowLeft,
  Smartphone,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";

export default function DepositPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    phoneNumber: "",
    transactionMessage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositRequests, setDepositRequests] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
    } else if (user) {
      fetchDepositRequests();
    }
  }, [user, loading, router]);

  const fetchDepositRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/deposit-request", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepositRequests(data.depositRequests);
      }
    } catch (error) {
      console.error("Error fetching deposit requests:", error);
    }
  };

  const handleSubmitDeposit = async () => {
    if (
      !formData.amount ||
      !formData.phoneNumber ||
      !formData.transactionMessage
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/deposit-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          "Deposit request submitted successfully! Admin will verify and process your deposit."
        );
        setFormData({ amount: "", phoneNumber: "", transactionMessage: "" });
        setStep(1);
        fetchDepositRequests();
      } else {
        alert(data.error || "Failed to submit deposit request");
      }
    } catch (error) {
      console.error("Error submitting deposit:", error);
      alert("Failed to submit deposit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
        return "text-yellow-600 bg-yellow-50";
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader
        title="Deposit Funds"
        showBack={true}
        onBack={() => router.back()}
      />

      <main className="px-4 py-6 max-w-md mx-auto">
        {step === 1 && (
          <>
            {/* Instructions Card */}
            {showInstructions && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-blue-800">
                      How to Deposit
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstructions(false)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        1
                      </span>
                      <p>Send money via M-Pesa to our business number</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        2
                      </span>
                      <p>Copy the M-Pesa confirmation message</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                        3
                      </span>
                      <p>Paste the message here and submit for verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* M-Pesa Details Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                  M-Pesa Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Business Number:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900">123456</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("123456")}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Business Name:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900">
                          InvestApp Ltd
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("InvestApp Ltd")}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-3">
                    Send your deposit amount to the above M-Pesa number, then
                    proceed to submit your transaction details below.
                  </p>
                  <Button onClick={() => setStep(2)} className="w-full">
                    I've Sent the Money - Submit Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deposit Requests */}
            {depositRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recent Deposit Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {depositRequests.slice(0, 3).map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <p className="text-sm font-medium">
                              ${request.amount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base">
                  Submit Transaction Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Sent (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount you sent"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +254712345678"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">M-Pesa Confirmation Message</Label>
                <Textarea
                  id="message"
                  placeholder="Paste your M-Pesa confirmation message here..."
                  rows={6}
                  value={formData.transactionMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionMessage: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Copy and paste the entire M-Pesa confirmation SMS you received
                  after sending the money.
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>
                      Make sure the amount and phone number match your M-Pesa
                      transaction. Our admin will verify this information before
                      processing your deposit.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitDeposit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Submit for Verification</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
