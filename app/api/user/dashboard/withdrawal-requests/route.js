import { NextResponse } from "next/server";
import { UserModel } from "../../../../../lib/database";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../../lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    // Get withdrawal requests for this user
    const withdrawalRequests = await db
      .collection("withdrawalRequests")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const formattedRequests = withdrawalRequests.map(request => ({
      id: request._id.toString(),
      amount: request.amount,
      status: request.status,
      description: request.description,
      createdAt: request.createdAt,
      formattedAmount: `Ksh${request.amount.toFixed(2)}`,
      timeAgo: getTimeAgo(request.createdAt),
      statusColor: getStatusColor(request.status),
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: formattedRequests,
        totalRequests: withdrawalRequests.length,
        pendingRequests: withdrawalRequests.filter(req => req.status === "pending").length,
        approvedRequests: withdrawalRequests.filter(req => req.status === "approved").length,
        rejectedRequests: withdrawalRequests.filter(req => req.status === "rejected").length,
      },
    });
  } catch (error) {
    console.error("Withdrawal Requests API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    );
  }
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return time.toLocaleDateString();
}

function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "approved":
      return "text-green-600 bg-green-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}