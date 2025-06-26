import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "../../../../../lib/mongodb";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const user = await db.collection("users").findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
