import { NextResponse } from "next/server"

// Mock user database - updated to match signup structure
const users = [
  {
    id: 1,
    fullName: "John Doe",
    username: "johndoe",
    email: "user@example.com",
    phone: "+1234567890",
    password: "password123",
    role: "user",
    name: "John Doe", // Keep for backward compatibility
  },
  {
    id: 2,
    fullName: "Admin User",
    username: "admin",
    email: "admin@example.com",
    phone: "+1987654321",
    password: "admin123",
    role: "admin",
    name: "Admin User", // Keep for backward compatibility
  },
]

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Find user by email or username
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) &&
        u.password === password,
    )

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
