"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MobileHeader from "../../../components/MobileHeader"
import BottomNavigation from "../../../components/BottomNavigation"
import { Package, Star, CheckCircle } from "lucide-react"

export default function PackagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("available")

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

  const availablePackages = [
    {
      id: 1,
      name: "Starter Package",
      price: "$99",
      duration: "30 days",
      returns: "15% ROI",
      features: ["Basic support", "Daily updates", "Mobile access"],
      popular: false,
    },
    {
      id: 2,
      name: "Premium Package",
      price: "$299",
      duration: "60 days",
      returns: "25% ROI",
      features: ["Priority support", "Real-time updates", "Advanced analytics", "Mobile access"],
      popular: true,
    },
    {
      id: 3,
      name: "VIP Package",
      price: "$599",
      duration: "90 days",
      returns: "35% ROI",
      features: ["24/7 support", "Instant updates", "Premium analytics", "Personal advisor"],
      popular: false,
    },
  ]

  const myPackages = [
    {
      id: 1,
      name: "Premium Package",
      status: "Active",
      progress: 65,
      daysLeft: 21,
      invested: "$299",
      currentValue: "$374",
    },
    {
      id: 2,
      name: "Starter Package",
      status: "Completed",
      progress: 100,
      daysLeft: 0,
      invested: "$99",
      currentValue: "$114",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Packages" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "available" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setActiveTab("my-packages")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "my-packages" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Packages
          </button>
        </div>

        {/* Available Packages */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {availablePackages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${pkg.popular ? "border-blue-500 border-2" : ""}`}>
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
                      <p className="text-2xl font-bold text-blue-600 mt-1">{pkg.price}</p>
                    </div>
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Duration: {pkg.duration}</span>
                    <span className="text-green-600 font-medium">{pkg.returns}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant={pkg.popular ? "default" : "outline"}>
                    Purchase Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Packages */}
        {activeTab === "my-packages" && (
          <div className="space-y-4">
            {myPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      <Badge variant={pkg.status === "Active" ? "default" : "secondary"} className="mt-1">
                        {pkg.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Value</p>
                      <p className="text-lg font-bold text-green-600">{pkg.currentValue}</p>
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
                    <span className="text-gray-600">Invested: {pkg.invested}</span>
                    <span className="text-green-600 font-medium">
                      +$
                      {(
                        Number.parseFloat(pkg.currentValue.replace("$", "")) -
                        Number.parseFloat(pkg.invested.replace("$", ""))
                      ).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
