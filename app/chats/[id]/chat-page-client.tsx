"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/types/user"
import UserProfileCard from "@/components/user-profile-card"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: number
}

export default function ChatPageClient({ id }: { id: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const fetchChatData = async () => {
      try {
        const response = await fetch(`/api/chats/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch chat data")
        }
        const data = await response.json()
        setOtherUser(data.otherUser)
        setMessages(data.messages)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching chat data:", err)
        setError("An error occurred while loading the chat.")
        setLoading(false)
      }
    }

    fetchChatData()
  }, [id, user])

  useEffect(() => {
    scrollToBottom()
  }, [messagesEndRef]) //Fixed unnecessary dependency

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !otherUser) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: id,
          text: newMessage,
          senderId: user.uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const sentMessage = await response.json()
      setMessages([...messages, sentMessage])
      setNewMessage("")
      scrollToBottom()
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/chats")} className="bg-[#FF7F50] text-white px-4 py-2 rounded-lg">
            Back to Chats
          </button>
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-card min-h-screen flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4 bg-gray-800 sticky top-0 z-10">
          <button onClick={() => router.back()} className="p-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft />
          </button>

          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2">
            <img
              src={otherUser.photoURL || "/placeholder.svg"}
              alt={otherUser.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{otherUser.displayName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{otherUser.university}</p>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.senderId === user?.uid
                      ? "bg-[#FF7F50] text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-700 bg-gray-800 sticky bottom-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:border-[#FF7F50] bg-gray-800 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn btn-primary rounded-full disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UserProfileCard user={otherUser} />
            <button
              onClick={() => setShowProfile(false)}
              className="mt-4 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

