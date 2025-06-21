import { NextResponse } from "next/server";
import { GiftCodeModel, UserModel } from "../../../../../lib/database";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Gift code is required" },
        { status: 400 }
      );
    }

    // For now, we'll use a mock user ID. In a real app, you'd get this from the session/auth
    const userId = "user123"; // This should come from your authentication system

    // Find the gift code
    const giftCode = await GiftCodeModel.findByCode(code.toUpperCase());

    if (!giftCode) {
      return NextResponse.json(
        { success: false, message: "Invalid gift code" },
        { status: 404 }
      );
    }

    // Check if code is active
    if (!giftCode.isActive) {
      return NextResponse.json(
        { success: false, message: "This gift code is no longer active" },
        { status: 400 }
      );
    }

    // Check if code is already redeemed
    if (giftCode.isRedeemed) {
      return NextResponse.json(
        { success: false, message: "This gift code has already been redeemed" },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (giftCode.expiresAt && new Date() > new Date(giftCode.expiresAt)) {
      return NextResponse.json(
        { success: false, message: "This gift code has expired" },
        { status: 400 }
      );
    }

    // Redeem the code
    const result = await GiftCodeModel.redeemCode(giftCode._id, userId);

    if (result.success) {
      // Credit user's wallet
      await UserModel.creditWallet(
        userId,
        giftCode.amount,
        `Gift code redemption: ${code}`
      );

      return NextResponse.json({
        success: true,
        message: "Gift code redeemed successfully!",
        amount: giftCode.amount,
        code: code,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to redeem gift code" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error redeeming gift code:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
