"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileHeader from "../../../components/MobileHeader";
import BottomNavigation from "../../../components/BottomNavigation";
import { Package, Star, CheckCircle, RefreshCw } from "lucide-react";

export default function PackagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("available");
  const [packagesData, setPackagesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackagesData = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id;

      const response = await fetch(`/api/user/packages?userId=${userId}`);
      const result = await response.json();
      console.log(result.data);
      if (result.success) {
        setPackagesData(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch packages data");
      }
    } catch (err) {
      console.error("Error fetching packages data:", err);
      setError("Failed to load packages data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
      return;
    }

    if (user && user.role === "user") {
      fetchPackagesData();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
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
        <MobileHeader title="Packages" />
        <main className="px-4 py-6 max-w-md mx-auto">
          <Card className="text-center p-6">
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPackagesData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const availablePackages = packagesData?.availablePackages || [];
  const myPackages = packagesData?.myPackages || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Packages" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {myPackages.length}
              </p>
              <p className="text-xs text-gray-600">My Packages</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${packagesData?.totalInvested?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-600">Total Invested</p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "available"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available ({availablePackages.length})
          </button>
          <button
            onClick={() => setActiveTab("my-packages")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "my-packages"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Packages ({myPackages.length})
          </button>
        </div>

        {/* Available Packages */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {availablePackages.length > 0 ? (
              availablePackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative ${
                    pkg.popular ? "border-blue-500 border-2" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-4">
                      <Badge className="bg-blue-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {pkg.price}
                        </p>
                      </div>
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>Duration: {pkg.duration}</span>
                      <span className="text-green-600 font-medium">
                        {pkg.returns}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {pkg.description}
                      </p>
                    )}
                    <div className="space-y-2 mb-4">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() =>
                        router.push(
                          `/user-dashboard/checkout?packageId=${pkg.id}`
                        )
                      }
                    >
                      Purchase Package
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center p-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No packages available</p>
                <p className="text-sm text-gray-500">
                  Check back later for new investment opportunities
                </p>
              </Card>
            )}
          </div>
        )}

        {/* My Packages */}
        {activeTab === "my-packages" && (
          <div className="space-y-4">
            {myPackages.length > 0 ? (
              myPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{pkg.name}</CardTitle>
                        <Badge
                          variant={
                            pkg.status === "Active" ? "default" : "secondary"
                          }
                          className="mt-1"
                        >
                          {pkg.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Current Value</p>
                        <p className="text-lg font-bold text-green-600">
                          {pkg.currentValue}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {pkg.status === "Active" && (
                      <>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{pkg.daysLeft} days left</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pkg.progress}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Invested: {pkg.invested}
                      </span>
                      <span className="text-green-600 font-medium">
                        +$
                        {(
                          Number.parseFloat(pkg.currentValue.replace("$", "")) -
                          Number.parseFloat(pkg.invested.replace("$", ""))
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Start: {pkg.startDate}</span>
                      <span>End: {pkg.endDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center p-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No active packages</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start investing to see your packages here
                </p>
                <Button
                  onClick={() => setActiveTab("available")}
                  variant="outline"
                >
                  Browse Packages
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
