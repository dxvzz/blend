"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import sql from "@/lib/db"
import type { UserProfile } from "@/types/user"
import Link from "next/link"
import UserProfileCard from "@/components/user-profile-card"
import { Heart } from "lucide-react"

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchMatches = async () => {
      try {
        const matchedUsers = await sql`
          SELECT * FROM users
          WHERE uid = ANY(${user.matches})
        `
        setMatches(matchedUsers)
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Matches</h1>

        <div className="grid grid-cols-2 gap-4">
          {matches.map((match) => (
            <div key={match.uid} className="relative">
              <UserProfileCard user={match} />
              <Link
                href={`/chats/${match.uid}`}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"
              />
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
            <p className="text-gray-400 mb-6">Start discovering new people to get matches!</p>
            <Link
              href="/discover"
              className="bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Discover People
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

