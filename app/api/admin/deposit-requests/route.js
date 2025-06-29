import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
2;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    //  const user = await UserModel.findUserById(userId);

    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all deposit requests with user information
    const depositRequests = await db
      .collection("depositRequests")
      .find()
      .toArray();
    // console.log(depositRequests); // now this will log actual data

    // Calculate statistics
    const stats = {
      total: depositRequests.length,
      pending: depositRequests.filter((req) => req.status === "pending").length,
      approved: depositRequests.filter((req) => req.status === "approved")
        .length,
      rejected: depositRequests.filter((req) => req.status === "rejected")
        .length,
      totalAmount: depositRequests
        .filter((req) => req.status === "approved")
        .reduce((sum, req) => sum + req.amount, 0),
    };

    return NextResponse.json({
      success: true,
      depositRequests,
      stats,
    });
  } catch (error) {
    console.error("Get deposit requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
