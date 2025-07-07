import { type NextRequest, NextResponse } from "next/server"

// Simple authentication - in production, use proper auth like NextAuth or Supabase
const VALID_CREDENTIALS = {
  username: "student",
  password: "itdept2024",
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const response = NextResponse.json({ success: true })
      response.cookies.set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return response
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
