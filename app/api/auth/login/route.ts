import { type NextRequest, NextResponse } from "next/server"

// Simple demo authentication - in production, use proper database and hashing
const DEMO_USER = {
  email: "demo@student.com",
  password: "demo123",
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Demo authentication
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const response = NextResponse.json({ success: true })
      response.cookies.set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return response
    }

    return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
