import { NextResponse } from "next/server"
import { UserModel } from "../../../../lib/database.js"

export async function POST(request) {
  try {
    const { fullName, username, email, phone, password } = await request.json()

    // Validation
    if (!fullName || !username || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Validate username format
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    // Check if username already exists
    const existingUserByUsername = await UserModel.findUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Check if email already exists
    const existingUserByEmail = await UserModel.findUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = await UserModel.createUser({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: "user",
    })

    // Return success response
    return NextResponse.json({
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        name: newUser.fullName, // For backward compatibility
      },
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({ error: `${field} already exists` }, { status: 400 })
    }

    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 })
  }
}
