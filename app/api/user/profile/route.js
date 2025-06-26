import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";

export async function GET(request) {
  try {
    // Get user from token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate real statistics from user data
    const totalInvested = user.wallet?.totalInvested || 0;
    const activePackages = user.stats?.activeInvestments || 0;
    const totalReferrals = user.referrals?.length || 0;

    // Calculate member since date
    const memberSince = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })
      : "Recently";

    const profileData = {
      user: {
        id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        username: user.username,
        phone: user.phone || "+1 (555) 123-4567",
        address: user.referralCode || "Not provided",
        referralLink: user.referralLink || "Not provided",
        joinDate: memberSince,
        createdAt: user.createdAt,
      },
      wallet: {
        balance: user.wallet?.balance || 0,
        totalInvested: totalInvested,
        totalReturns: user.wallet?.totalReturns || 0,
        totalDeposited: user.wallet?.totalDeposited || 0,
      },
      stats: {
        totalInvested: `Ksh${totalInvested.toFixed(2)}`,
        activePackages: activePackages.toString(),
        referrals: totalReferrals.toString(),
        memberSince: memberSince,
      },
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get user from token
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = await UserModel.findUserById(userId);

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address } = body;

    // Update user profile
    const updatedUser = await UserModel.updateUser(decoded.userId, {
      fullName: name,
      email: email,
      phoneNumber: phone,
      address: address,
      updatedAt: new Date(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: updatedUser.fullName || updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
