import { NextResponse } from "next/server"
import { UserModel } from "../../../../lib/database"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email or username
    const user = await UserModel.findUserByEmailOrUsername(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await UserModel.verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.fullName, // For backward compatibility
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    }

    return NextResponse.json({
      user: userResponse,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
