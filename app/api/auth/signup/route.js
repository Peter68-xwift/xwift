import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";

function generateReferralCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    // const referrerCode = searchParams.get("ref"); // If available

    const { fullName, username, email, phone, password, referrerCode } =
      await request.json();

    // Validation checks ...
    if (!fullName || !username || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be at least 3 characters and contain only letters, numbers, underscores",
        },
        { status: 400 }
      );
    }

    const existingUserByUsername = await UserModel.findUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Generate a unique referral code
    let referralCode;
    let unique = false;

    while (!unique) {
      referralCode = generateReferralCode();
      const existing = await UserModel.findUserByReferralCode?.(referralCode);
      if (!existing) unique = true;
    }

    // If referred, find referrer by code
    let referrerId = null;
    if (referrerCode) {
      const referrer = await UserModel.findUserByReferralCode?.(referrerCode);
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Create user
    const newUser = await UserModel.createUser({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: "user",
      referralCode,
      referrerId, // optional
    });

    return NextResponse.json({
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        referralCode: newUser.referralCode,
        referredBy: referrerCode || null,
        role: newUser.role,
        name: newUser.fullName,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
