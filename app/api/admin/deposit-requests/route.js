import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../../../lib/mongodb";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { db } = await connectToDatabase();

    const admin = await db.collection("users").findOne({ _id: decoded.userId });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all deposit requests
    const depositRequests = await db
      .collection("depositRequests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate stats
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

    return NextResponse.json({ depositRequests, stats });
  } catch (error) {
    console.error("Get deposit requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
