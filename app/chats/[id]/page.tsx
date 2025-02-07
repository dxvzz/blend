import { Suspense } from "react"
import ChatPageClient from "./chat-page-client"
import sql from "@/lib/db"
import type { Metadata } from "next"

export const revalidate = 0 // disable static generation for this route

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const [chatData] = await sql`
    SELECT users.display_name
    FROM chats
    JOIN users ON (chats.user1_id = users.uid OR chats.user2_id = users.uid)
    WHERE chats.id = ${params.id}
    LIMIT 1
  `

  return {
    title: chatData ? `Chat with ${chatData.display_name}` : "Chat",
  }
}

export default async function ChatPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageClient id={params.id} />
    </Suspense>
  )
}

