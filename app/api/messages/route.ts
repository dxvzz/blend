import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { chatId, text, senderId } = await request.json()

    const [newMessage] = await sql`
      INSERT INTO messages (chat_id, sender_id, text, timestamp)
      VALUES (${chatId}, ${senderId}, ${text}, NOW())
      RETURNING *
    `

    await sql`
      UPDATE chats
      SET last_message = ${text}, last_message_time = NOW()
      WHERE id = ${chatId}
    `

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

