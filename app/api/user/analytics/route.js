import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // Mock data - replace with actual database queries
    const mockAnalytics = {
      totalInvestment: 15000,
      totalReturns: 2250,
      activePackages: 3,
      portfolioGrowth: 15.5,
      monthlyData: [
        { month: "Jan", value: 1200 },
        { month: "Feb", value: 1800 },
        { month: "Mar", value: 2400 },
        { month: "Apr", value: 2100 },
        { month: "May", value: 2800 },
        { month: "Jun", value: 3200 },
      ],
      packagePerformance: [
        {
          name: "Premium Growth",
          invested: 5000,
          currentValue: 5750,
          roi: 15.0,
        },
        {
          name: "Stable Returns",
          invested: 7000,
          currentValue: 7560,
          roi: 8.0,
        },
        {
          name: "High Risk High Reward",
          invested: 3000,
          currentValue: 3690,
          roi: 23.0,
        },
      ],
      recentTransactions: [
        {
          type: "return",
          description: "Monthly return from Premium Growth",
          amount: 187.5,
          date: new Date().toISOString(),
        },
        {
          type: "investment",
          description: "Investment in Stable Returns",
          amount: 2000,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          type: "return",
          description: "Quarterly bonus from High Risk package",
          amount: 345.0,
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ],
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
