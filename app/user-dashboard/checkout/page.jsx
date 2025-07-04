"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Clock,
  Package,
  CreditCard,
  Wallet,
  Send,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const [packageData, setPackageData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [step, setStep] = useState(1); // 1: Select payment, 2: M-Pesa instructions, 3: Confirm payment
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [settings, setSettings] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    phoneNumber: "",
    transactionMessage: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
      return;
    }

    if (!packageId) {
      router.push("/user-dashboard/packages");
      return;
    }

    if (user) {
      fetchPackageData();
      fetchWalletData();
    }
  }, [user, loading, router, packageId]);

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
  // console.log(settings)

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackageData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const userId = user.id;

      const response = await fetch(`/api/user/packages?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        const selectedPackage = data.data.availablePackages.find(
          (pkg) => pkg.id === packageId
        );

        if (selectedPackage) {
          setPackageData(selectedPackage);
        } else {
          alert("Package not found");
          router.push("/user-dashboard/packages");
        }
      }
    } catch (error) {
      console.error("Error fetching package:", error);
      alert("Failed to load package details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const userId = user?.id;

      const response = await fetch(
        `/api/user/purchase-package?userId=${userId}`,
        {
          method: "POST",

          body: JSON.stringify({
            packageId,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (paymentMethod === "wallet") {
          alert("Package purchased successfully with wallet balance!");
          router.push("/user-dashboard/packages");
        } else {
          setPurchaseRequest(data);
          setStep(2);
        }
      } else {
        alert(data.error || "Failed to purchase package");
      }
    } catch (error) {
      console.error("Error purchasing package:", error);
      alert("Failed to purchase package");
    } finally {
      setIsPurchasing(false);
    }
  };

  const submitPaymentConfirmation = async () => {
    if (!paymentForm.phoneNumber || !paymentForm.transactionMessage) {
      alert("Please fill in all payment details");
      return;
    }

    try {
      const userId = user.id;
      // console.log(purchaseRequest);
      const response = await fetch(
        `/api/user/confirm-package-payment?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            purchaseRequestId: purchaseRequest.purchaseRequestId,
            phoneNumber: paymentForm.phoneNumber,
            transactionMessage: paymentForm.transactionMessage,
          }),
        }
      );

      if (response.ok) {
        alert(
          "Payment confirmation submitted! Admin will verify and activate your package."
        );
        router.push("/user-dashboard/packages");
      } else {
        alert("Failed to submit payment confirmation");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment confirmation");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "user" || !packageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ffff00] pb-20">
      <MobileHeader
        title="Checkout"
        showBack={true}
        onBack={() => router.back()}
      />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Package Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Package Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{packageData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-blue-600">
                  {packageData.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{packageData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Returns:</span>
                <span className="text-green-600 font-medium">
                  {packageData.returns}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Payment Option */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "wallet"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("wallet")}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === "wallet"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "wallet" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Wallet Balance</p>
                    <p className="text-sm text-gray-600">
                      Available: Ksh{walletData?.balance.toFixed(2) || 0.0}
                    </p>
                  </div>
                </div>
                {(user.wallet?.balance || 0) <
                  Number.parseFloat(packageData.price.replace("$", "")) && (
                  <p className="text-sm text-red-600 mt-2 ml-7">
                    Insufficient balance
                  </p>
                )}
              </div>

              {/* M-Pesa Payment Option */}
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === "mpesa"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("mpesa")}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === "mpesa"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "mpesa" && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">M-Pesa Payment</p>
                    <p className="text-sm text-gray-600">
                      Pay via M-Pesa mobile money
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={
                  isPurchasing ||
                  (paymentMethod === "wallet" &&
                    (user.wallet?.balance || 0) <
                      Number.parseFloat(packageData.price.replace("$", "")))
                }
                className="w-full"
              >
                {isPurchasing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {paymentMethod === "wallet"
                        ? "Purchase with Wallet"
                        : "Proceed to M-Pesa Payment"}
                    </span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && purchaseRequest && (
          <>
            {/* M-Pesa Payment Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                  M-Pesa Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Mpesa Number:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900">
                          {settings.mpesaNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(settings.mpesaNumber)}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Mpesa Name:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900">
                          {settings.mpesaName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              purchaseRequest.paymentInstructions.businessName
                            )
                          }
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Amount:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900 text-lg">
                          Ksh{purchaseRequest.paymentInstructions.amount}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              purchaseRequest.paymentInstructions.amount.toString()
                            )
                          }
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Reference:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-green-900">
                          {purchaseRequest.paymentInstructions.reference}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              purchaseRequest.paymentInstructions.reference
                            )
                          }
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">
                        Payment expires in 30 minutes
                      </p>
                      <p>
                        Complete your M-Pesa payment and submit confirmation
                        below.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setStep(3)} className="w-full">
                  I've Sent the Payment - Submit Confirmation
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base">Confirm Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +254712345678"
                  value={paymentForm.phoneNumber}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">M-Pesa Confirmation Message</Label>
                <Textarea
                  id="message"
                  placeholder="Paste your M-Pesa confirmation message here..."
                  rows={6}
                  value={paymentForm.transactionMessage}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      transactionMessage: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Copy and paste the entire M-Pesa confirmation SMS you received
                  after sending the money.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Package Activation:</p>
                    <p>
                      Your package will be activated once admin verifies your
                      payment. You'll receive a notification when it's ready.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={submitPaymentConfirmation} className="w-full">
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Submit Payment Confirmation</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
