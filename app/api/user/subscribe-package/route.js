import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/database";

import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const client = await clientPromise; // ✅ correct usage
       const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name
   
       const { searchParams } = new URL(request.url);
       const userId = searchParams.get("userId");

       if (!userId) {
         return NextResponse.json(
           { error: "Missing user ID" },
           { status: 400 }
         );
       }

       const user = await UserModel.findUserById(userId);

       if (!user || user.role !== "user") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

    const { packageId, paymentMethod, transactionMessage, phoneNumber } = await request.json()

    if (!packageId || !paymentMethod) {
      return NextResponse.json({ error: "Package ID and payment method are required" }, { status: 400 })
    }

    // Get package details
    const packageData = await db.collection("packages").findOne({ _id: new ObjectId(packageId) })

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    if (packageData.status !== "active") {
      return NextResponse.json({ error: "Package is not available" }, { status: 400 })
    }

    // Check if user already has this package (active or pending)
    const existingSubscription = await db.collection("packageSubscriptions").findOne({
      userId: new ObjectId(decoded.userId),
      packageId: new ObjectId(packageId),
      status: { $in: ["pending", "active"] },
    })

    if (existingSubscription) {
      return NextResponse.json(
        {
          error: "You already have an active or pending subscription for this package",
        },
        { status: 400 },
      )
    }

    // For wallet payment
    if (paymentMethod === "wallet") {
      const userBalance = user.wallet?.balance || 0
      if (userBalance < packageData.price) {
        return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
      }

      // Create subscription request (still needs admin approval even for wallet)
      const subscriptionRequest = {
        userId: new ObjectId(decoded.userId),
        userFullName: user.fullName,
        username: user.username,
        packageId: new ObjectId(packageId),
        packageName: packageData.name,
        packagePrice: packageData.price,
        packageDuration: packageData.duration,
        packageROI: packageData.roi,
        paymentMethod: "wallet",
        status: "pending_approval",
        paymentStatus: "completed", // Wallet payment is instant
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Deduct from wallet immediately
      const newBalance = userBalance - packageData.price
      await db.collection("users").updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: { "wallet.balance": newBalance },
          $push: {
            "wallet.history": {
              type: "debit",
              amount: -packageData.price,
              description: `Package subscription - ${packageData.name} (Pending approval)`,
              timestamp: new Date(),
              status: "completed",
            },
          },
        },
      )

      const result = await db.collection("packageSubscriptions").insertOne(subscriptionRequest)

      return NextResponse.json({
        success: true,
        message: "Subscription request submitted successfully. Awaiting admin approval.",
        subscriptionId: result.insertedId,
      })
    }

    // For M-Pesa payment
    if (paymentMethod === "mpesa") {
      if (!transactionMessage || !phoneNumber) {
        return NextResponse.json(
          {
            error: "Transaction message and phone number are required for M-Pesa payment",
          },
          { status: 400 },
        )
      }

      const subscriptionRequest = {
        userId: new ObjectId(decoded.userId),
        userFullName: user.fullName,
        username: user.username,
        phoneNumber: phoneNumber,
        packageId: new ObjectId(packageId),
        packageName: packageData.name,
        packagePrice: packageData.price,
        packageDuration: packageData.duration,
        packageROI: packageData.roi,
        paymentMethod: "mpesa",
        transactionMessage: transactionMessage,
        status: "pending_payment_verification",
        paymentStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("packageSubscriptions").insertOne(subscriptionRequest)

      return NextResponse.json({
        success: true,
        message: "Subscription request submitted successfully. Awaiting payment verification and admin approval.",
        subscriptionId: result.insertedId,
      })
    }

    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
  } catch (error) {
    console.error("Subscribe package error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
