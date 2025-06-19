import { NextResponse } from "next/server"

// Mock user database - should match the one in signup
const users = [
  {
    id: 1,
    username: "johndoe",
    email: "user@example.com",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@example.com",
  },
]

export async function POST(request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if username exists
    const existingUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? "Username is already taken" : "Username is available",
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
