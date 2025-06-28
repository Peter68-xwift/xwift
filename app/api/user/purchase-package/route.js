import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { UserModel } from "../../../../lib/database";

import { ObjectId } from "mongodb";

export async function POST(request) {
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

    const client = await clientPromise; // ✅ correct usage
    const db = client.db("mern_auth_app"); // ⬅️ use your actual DB name

    const { packageId, paymentMethod } = await request.json();

    if (!packageId || !paymentMethod) {
      return NextResponse.json(
        { error: "Package ID and payment method are required" },
        { status: 400 }
      );
    }

    // Get package details
    const packageData = await db
      .collection("packages")
      .findOne({ _id: new ObjectId(packageId) });

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (packageData.status !== "active") {
      return NextResponse.json(
        { error: "Package is not available" },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance (for wallet payment)
    if (paymentMethod === "wallet") {
      const userBalance = user.wallet?.balance || 0;
      if (userBalance < packageData.price) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        );
      }

      // Create a purchase request for wallet method, pending admin approval
      const purchaseRequest = {
        userId: user._id,
        userFullName: user.fullName,
        username: user.username,
        packageId: packageData._id,
        packageName: packageData.name,
        amount: packageData.price,
        paymentMethod: "wallet",
        status: "pending",
        createdAt: new Date(),
      };

      const result = await db
        .collection("purchaseRequests")
        .insertOne(purchaseRequest);


      return NextResponse.json({
        success: true,
        message: "Package purchased successfully with wallet balance",
        investment: {
          packageName: packageData.name,
          amount: packageData.price,
          roi: packageData.roi,
          duration: packageData.duration,
        },
      });
    }

    // For M-Pesa payment, create a purchase request
    const purchaseRequest = {
      userId: user._id,
      userFullName: user.fullName,
      username: user.username,
      packageId: packageData._id,
      packageName: packageData.name,
      amount: packageData.price,
      paymentMethod: "mpesa",
      status: "pending_payment",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
    };

    const result = await db
      .collection("purchaseRequests")
      .insertOne(purchaseRequest);

    // Normalize today's date to 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create initial feed record
    await db.collection("dailyFeeds").insertOne({
      userId: new ObjectId(userId),
      subscriptionId: result.insertedId,
      feedDate: today,
      createdAt: new Date(),
    });

    // if (user.referrerId) {
    //   const hasPreviousPurchase = await db
    //     .collection("purchaseRequests")
    //     .findOne({
    //       userId: user._id,
    //       status: { $in: ["active", "completed"] },
    //     });

    //   if (!hasPreviousPurchase) {
    //     const commissionAmount = packageData.price * 0.15;

    //     // Credit referrer
    //     await db.collection("users").updateOne(
    //       { _id: user.referrerId },
    //       {
    //         $inc: {
    //           "wallet.balance": commissionAmount,
    //           "wallet.availableBalance": commissionAmount,
    //         },
    //         $push: {
    //           walletHistory: {
    //             type: "referral_bonus",
    //             amount: commissionAmount,
    //             description: `15% referral bonus from ${user.fullName}`,
    //             timestamp: new Date(),
    //             status: "completed",
    //           },
    //         },
    //       }
    //     );

    //     // Optional: notify referrer
    //     await db.collection("userNotifications").insertOne({
    //       userId: user.referrerId,
    //       title: "Referral Bonus Received",
    //       message: `You earned KES ${commissionAmount.toFixed(
    //         2
    //       )} from referring ${user.fullName}.`,
    //       isRead: false,
    //       createdAt: new Date(),
    //     });
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: "Purchase request created. Please complete M-Pesa payment.",
      purchaseRequestId: result.insertedId,
      packageDetails: {
        name: packageData.name,
        price: packageData.price,
        duration: packageData.duration,
        roi: packageData.roi,
      },
      paymentInstructions: {
        businessNumber: "0795486102",
        businessName: "Cosmas Kipyegon",
        amount: packageData.price,
        reference: result.insertedId.toString().slice(-8).toUpperCase(),
      },
    });
  } catch (error) {
    console.error("Purchase package error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
