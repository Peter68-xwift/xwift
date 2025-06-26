import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { UserModel } from "../../../../lib/database";

export async function POST(request) {
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
  const users = db.collection("users");
  const giftCodes = db.collection("gift_codes");

  try {
    const { code } = await request.json();
    const formattedCode = code?.toUpperCase().trim();

    if (!formattedCode) {
      return NextResponse.json(
        { message: "Gift code is required" },
        { status: 400 }
      );
    }

    // Check if gift code exists and is unused
    const gift = await giftCodes.findOne({ code: formattedCode });

    if (!gift) {
      return NextResponse.json(
        { message: "Invalid gift code" },
        { status: 400 }
      );
    }

    if (gift.redeemedBy) {
      return NextResponse.json(
        { message: "This gift code has already been used" },
        { status: 400 }
      );
    }

    const amount = gift.amount || 0;

    // Update user's wallet balance and record transaction
    await users.updateOne(
      { _id: user._id },
      {
        $inc: { "wallet.balance": amount },
        $push: {
          walletHistory: {
            amount,
            type: "credit",
            method: "Gift Code",
            timestamp: new Date(),
          },
        },
      }
    );

    // Mark the gift code as redeemed
    await giftCodes.updateOne(
      { _id: gift._id },
      {
        $set: {
          redeemedBy: user._id,
          redeemedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Gift code redeemed successfully",
      amount,
    });
  } catch (error) {
    console.error("Gift code redemption error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
