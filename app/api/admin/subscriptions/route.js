import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/mongodb";
// import { UserModel } from "../../../../../lib/database";

import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const admin = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") || "all";

    const query = {};
    if (status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get subscriptions with pagination
    const [subscriptions, total] = await Promise.all([
      db
        .collection("purchaseRequests")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("purchaseRequests").countDocuments(query),
    ]);

    // Calculate statistics
    const [totalSubs, pendingSubs, activeSubs, completedSubs, rejectedSubs] =
      await Promise.all([
        db.collection("purchaseRequests").countDocuments({}),
        db.collection("purchaseRequests").countDocuments({
          status: { $in: ["pending_payment", "pending_verification", "pending"] },
        }),
        db.collection("purchaseRequests").countDocuments({ status: "active" }),
        db
          .collection("purchaseRequests")
          .countDocuments({ status: "completed" }),
        db
          .collection("purchaseRequests")
          .countDocuments({ status: "rejected" }),
      ]);

    const totalRevenue = await db
      .collection("purchaseRequests")
      .aggregate([
        { $match: { status: { $in: ["active", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$packagePrice" } } },
      ])
      .toArray();

    const stats = {
      totalSubscriptions: totalSubs,
      pendingSubscriptions: pendingSubs,
      activeSubscriptions: activeSubs,
      completedSubscriptions: completedSubs,
      rejectedSubscriptions: rejectedSubs,
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        stats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get admin subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
