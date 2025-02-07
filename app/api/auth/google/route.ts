import { NextResponse } from "next/server"
import { getGoogleUser } from "@/lib/google-auth"
import sql from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const googleUser = await getGoogleUser(code)

    let [user] = await sql`
      SELECT * FROM users WHERE uid = ${googleUser.id}
    `

    if (!user) {
      ;[user] = await sql`
        INSERT INTO users (uid, email, display_name, photo_url, matches, likes, dislikes, daily_likes, last_like_timestamp)
        VALUES (${googleUser.id}, ${googleUser.email}, ${googleUser.name}, ${googleUser.picture}, '[]', '[]', '[]', 0, NULL)
        RETURNING *
      `
    }

    return NextResponse.json({ token: googleUser.id, user })
  } catch (error) {
    console.error("Error in Google auth callback:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

