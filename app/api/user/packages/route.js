import { NextResponse } from "next/server";
import { UserModel, PackageModel } from "../../../../lib/database";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const myPacks = await db
      .collection("purchaseRequests")
      .find({ userId: new ObjectId(userId), status: "active" }) // optional filter
      .toArray();

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all available packages
    const allPackages = await PackageModel.getAllPackages();

    // Filter active packages
    const availablePackages = allPackages
      .filter((pkg) => pkg.status === "active")
      .map((pkg) => ({
        id: pkg._id.toString(),
        name: pkg.name,
        price: `Ksh${pkg.price}`,
        duration: `${pkg.duration} days`,
        returns: `${pkg.roi}% ROI`,
        description: pkg.description,
        features: pkg.features || ["Basic support", "Mobile access"],
        popular: pkg.subscribers > 10, // Mark as popular if more than 10 subscribers
        image: pkg.image, // Mark as popular if more than 10 subscribers
      }));

    // Get user's packages (mock data for now - you can implement user investments later)
    const userPackages = user?.wallet?.history || [];
    const totalInvested = user?.wallet?.totalInvested || 0;

    const myPackages = myPacks
      .map((investment) => {
        const pkg = allPackages.find(
          (p) => p._id?.toString() === investment.packageId?.toString()
        );
        if (!pkg) return null;
        // console.log(pkg)
        const startDate = new Date(investment.startDate);
        const endDate = new Date(
          startDate.getTime() + pkg.duration * 24 * 60 * 60 * 1000
        );
        const now = new Date();

        const totalDays = pkg.duration;
        const daysElapsed = Math.floor(
          (now - startDate) / (24 * 60 * 60 * 1000)
        );
        const daysLeft = Math.max(0, totalDays - daysElapsed);
        const progress = Math.min(100, (daysElapsed / totalDays) * 100);

        const currentValue =
          investment.amount * (1 + (pkg.roi / 100) * (progress / 100));

        return {
          id: investment._id?.toString() || Math.random().toString(),
          name: pkg.name,
          status: daysLeft > 0 ? "Active" : "Completed",
          progress: Math.round(progress),
          daysLeft,
          invested: `Ksh${investment.amount.toFixed(2)}`,
          currentValue: `Ksh${currentValue.toFixed(2)}`,
          startDate: startDate.toLocaleDateString(),
          endDate: endDate.toLocaleDateString(),
        };
      })
      .filter(Boolean);
    // console.log(myPackages);

    return NextResponse.json({
      success: true,
      data: {
        availablePackages,
        myPackages,
        myPacks,
        totalInvested,
        activeInvestments: myPackages.filter((pkg) => pkg.status === "Active")
          .length,
      },
    });
  } catch (error) {
    console.error("Packages API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages data" },
      { status: 500 }
    );
  }
}
