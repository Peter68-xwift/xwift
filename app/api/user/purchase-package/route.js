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

    const client = await clientPromise;
    const db = client.db("mern_auth_app");

    const { packageId, paymentMethod } = await request.json();

    if (!packageId || !paymentMethod) {
      return NextResponse.json(
        { error: "Package ID and payment method are required" },
        { status: 400 }
      );
    }

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

    // === Handle Wallet Payment ===
    if (paymentMethod === "wallet") {
      const userBalance = user?.wallet?.balance || 0;
      if (userBalance < packageData.price) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        );
      }
      console.log(user._id);
      // 1. Deduct user balance and available balance
      const updated = await db.collection("users").findOneAndUpdate(
        {
          _id: new ObjectId(user._id),
        },
        {
          $inc: {
            "wallet.balance": -packageData.price,
            "wallet.availableBalance": -packageData.price,
            "wallet.totalInvested": packageData.price,
            "stats.activeInvestments": 1,
          },
          $push: {
            walletHistory: {
              type: "investment",
              amount: packageData.price,
              description: `Invested in ${packageData.name} package`,
              timestamp: new Date(),
              status: "completed",
            },
          },
        },
        { returnDocument: "after" }
      );

      // if (!updated.value) {
      //   return NextResponse.json(
      //     { error: "Failed to deduct wallet funds" },
      //     { status: 400 }
      //   );
      // }

      // 2. Create subscription with status 'active'
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + packageData.duration * 24 * 60 * 60 * 1000
      );

      const purchaseRequest = {
        userId: user._id,
        userFullName: user.fullName,
        username: user.username,
        packageId: packageData._id,
        packageName: packageData.name,
        amount: packageData.price,
        paymentMethod: "wallet",
        status: "active",
        createdAt: new Date(),
        activatedAt: startDate,
        startDate,
        endDate,
      };

      const result = await db
        .collection("purchaseRequests")
        .insertOne(purchaseRequest);

      // 3. Update package stats
      await db.collection("packages").updateOne(
        { _id: packageData._id },
        {
          $inc: {
            subscribers: 1,
            totalRevenue: packageData.price,
          },
          $set: { updatedAt: new Date() },
        }
      );

      // 4. Daily Feed Tracking
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await db.collection("dailyFeeds").insertOne({
        userId: user._id,
        subscriptionId: result.insertedId,
        feedDate: today,
        createdAt: new Date(),
      });

      // 5. Referral Bonus (only if it's user's first active subscription)
      const hasPrevious = await db.collection("purchaseRequests").findOne({
        userId: user._id,
        status: { $in: ["active", "completed"] },
        _id: { $ne: result.insertedId },
      });

      if (!hasPrevious && user.referrerId) {
        const bonus = packageData.price * 0.15;
        await db.collection("users").updateOne(
          { _id: user.referrerId },
          {
            $inc: {
              "wallet.balance": bonus,
              "wallet.availableBalance": bonus,
            },
            $push: {
              walletHistory: {
                type: "referral_bonus",
                amount: bonus,
                description: `15% referral bonus from ${user.fullName}`,
                timestamp: new Date(),
                status: "completed",
              },
            },
          }
        );

        await db.collection("userNotifications").insertOne({
          userId: user.referrerId,
          title: "Referral Bonus Received",
          message: `You earned KES ${bonus.toFixed(2)} from referring ${
            user.fullName
          }.`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Package purchased successfully using wallet",
        investment: {
          packageName: packageData.name,
          amount: packageData.price,
          roi: packageData.roi,
          duration: packageData.duration,
        },
      });
    }

    // === Handle M-Pesa Payment ===
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };

    const result = await db
      .collection("purchaseRequests")
      .insertOne(purchaseRequest);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.collection("dailyFeeds").insertOne({
      userId: new ObjectId(userId),
      subscriptionId: result.insertedId,
      feedDate: today,
      createdAt: new Date(),
    });

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
