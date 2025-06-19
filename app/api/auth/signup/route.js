import { NextResponse } from "next/server"

// Mock user database - in a real app, this would be in a database
const users = [
  {
    id: 1,
    fullName: "John Doe",
    username: "johndoe",
    email: "user@example.com",
    phone: "+1234567890",
    password: "password123",
    role: "user",
  },
  {
    id: 2,
    fullName: "Admin User",
    username: "admin",
    email: "admin@example.com",
    phone: "+1987654321",
    password: "admin123",
    role: "admin",
  },
]

export async function POST(request) {
  try {
    const { fullName, username, email, phone, password } = await request.json()

    // Validation
    if (!fullName || !username || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if username already exists
    const existingUserByUsername = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Check if email already exists
    const existingUserByEmail = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      fullName,
      username,
      email: email.toLowerCase(),
      phone,
      password, // In a real app, this should be hashed
      role: "user",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
