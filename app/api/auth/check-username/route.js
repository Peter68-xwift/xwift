import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username must be at least 3 characters long",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
    }

    // Check if username exists in database
    const existingUser = await UserModel.findUserByUsername(username);

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? "Username is already taken"
        : "Username is available",
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
