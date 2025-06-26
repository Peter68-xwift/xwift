import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all withdrawal requests
    const withdrawalRequests = await db
      .collection("withdrawalRequests")
      .find()
      .sort({ createdAt: -1 }) // newest first
      .toArray();
// console.log(withdrawalRequests);
    // Compute statistics
    const stats = {
      total: withdrawalRequests.length,
      pending: withdrawalRequests.filter((req) => req.status === "pending")
        .length,
      approved: withdrawalRequests.filter((req) => req.status === "approved")
        .length,
      rejected: withdrawalRequests.filter((req) => req.status === "rejected")
        .length,
      totalWithdrawn: withdrawalRequests
        .filter((req) => req.status === "approved")
        .reduce((sum, req) => sum + req.amount, 0),
    };

    return NextResponse.json({
      success: true,
      withdrawalRequests,
      stats,
    });
  } catch (error) {
    console.error("Get withdrawal requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
