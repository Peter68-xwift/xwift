import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      }
    }

    const result = await UserModel.getAllUsers(page, limit, query);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userData = await request.json();

    // Validate required fields
    const requiredFields = [
      "fullName",
      "username",
      "email",
      "phone",
      "password",
    ];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmailOrUsername(
      userData.email
    );
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email or username already exists",
        },
        { status: 400 }
      );
    }

    // Create user with default wallet
    const newUserData = {
      ...userData,
      email: userData.email.toLowerCase(),
      username: userData.username.toLowerCase(),
      role: userData.role || "user",
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      wallet: {
        balance: userData.walletBalance || 0,
        totalInvested: 0,
        totalReturns: 0,
        availableBalance: userData.walletBalance || 0,
      },
      profile: {
        avatar: userData.avatar || null,
        bio: userData.bio || "",
        location: userData.location || "",
        dateOfBirth: userData.dateOfBirth || null,
      },
      stats: {
        totalPackages: 0,
        activeInvestments: 0,
        completedInvestments: 0,
        lastLogin: null,
      },
    };

    const user = await UserModel.createUser(newUserData);

    // Remove password from response
    const { password, ...userResponse } = user;
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
