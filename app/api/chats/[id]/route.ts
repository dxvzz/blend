import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatId = params.id

  try {
    const [chatData] = await sql`
      SELECT 
        c.*,
        u1.uid as user1_uid, u1.display_name as user1_name, u1.photo_url as user1_photo,
        u2.uid as user2_uid, u2.display_name as user2_name, u2.photo_url as user2_photo
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.uid
      JOIN users u2 ON c.user2_id = u2.uid
      WHERE c.id = ${chatId}
    `

    if (!chatData) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    const messages = await sql`
      SELECT * FROM messages
      WHERE chat_id = ${chatId}
      ORDER BY timestamp ASC
    `

    const otherUser = {
      uid: chatData.user2_uid,
      displayName: chatData.user2_name,
      photoURL: chatData.user2_photo,
    }

    return NextResponse.json({ otherUser, messages })
  } catch (error) {
    console.error("Error fetching chat data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

