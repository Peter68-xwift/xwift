import { NextResponse } from "next/server";
import { UserModel } from "../../../../lib/database";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Hash the default password "0000"
    const hashedPassword = await bcrypt.hash("0000", 10);

    const updatedUser = await UserModel.updateUser(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Password reset to default (0000)",
    });
  } catch (err) {
    console.error("Admin reset password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
