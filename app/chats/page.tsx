"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import sql from "@/lib/db"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle } from "lucide-react"

interface ChatPreview {
  uid: string
  display_name: string
  photo_url: string
  last_message: string
  last_message_time: number
}

export default function ChatsPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchChats = async () => {
      try {
        const chatPreviews = await sql`
          SELECT 
            u.uid, 
            u.display_name, 
            u.photo_url, 
            c.last_message, 
            c.last_message_time
          FROM 
            chats c
          JOIN 
            users u ON u.uid = (CASE 
              WHEN c.user1_id = ${user.uid} THEN c.user2_id 
              ELSE c.user1_id 
            END)
          WHERE 
            c.user1_id = ${user.uid} OR c.user2_id = ${user.uid}
          ORDER BY 
            c.last_message_time DESC
        `
        setChats(chatPreviews)
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-card min-h-screen">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>

        <div className="divide-y">
          {chats.map((chat) => (
            <Link
              key={chat.uid}
              href={`/chats/${chat.uid}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={chat.photo_url || "/placeholder.svg"}
                alt={chat.display_name}
                className="w-14 h-14 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{chat.display_name}</h3>
                <p className="text-gray-500 dark:text-gray-400 truncate">{chat.last_message}</p>
              </div>

              <div className="text-sm text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: true })}
              </div>
            </Link>
          ))}
        </div>

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400 mb-6">Match with people to start chatting!</p>
            <Link
              href="/discover"
              className="bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Find Matches
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

