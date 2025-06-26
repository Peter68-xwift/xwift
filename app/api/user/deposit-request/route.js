import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/database";

export async function POST(request) {
  try {
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, transactionMessage, phoneNumber } = await request.json();

    if (!amount || !transactionMessage || !phoneNumber) {
      return NextResponse.json(
        {
          error: "Amount, transaction message, and phone number are required",
        },
        { status: 400 }
      );
    }

    // Create deposit request
    const depositRequest = {
      userId: user._id,
      userFullName: user.fullName,
      username: user.username,
      phoneNumber,
      amount: Number.parseFloat(amount),
      transactionMessage,
      status: "pending",
      createdAt: new Date(),
      processedAt: null,
      processedBy: null,
      adminNotes: "",
    };

    const result = await db
      .collection("depositRequests")
      .insertOne(depositRequest);

    // Add notification for admin
    await db.collection("adminNotifications").insertOne({
      type: "deposit_request",
      title: "New Deposit Request",
      message: `${user.fullName} (@${user.username}) has submitted a deposit request for Ksh${amount}`,
      userId: user._id,
      depositRequestId: result.insertedId,
      isRead: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message:
        "Deposit request submitted successfully. Admin will verify and process your deposit.",
      requestId: result.insertedId,
    });
  } catch (error) {
    console.error("Deposit request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get user's deposit requests
    const depositRequests = await db
      .collection("depositRequests")
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ depositRequests });
  } catch (error) {
    console.error("Get deposit requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
