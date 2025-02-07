"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import sql from "@/lib/db"
import type { UserProfile } from "@/types/user"
import { X, Heart, Star, RefreshCw } from "lucide-react"
import { motion, AnimatePresence, type PanInfo, useAnimation } from "framer-motion"

const DAILY_LIKE_LIMIT = 20
const LIKE_LIMIT_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export default function DiscoverPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyLikes, setDailyLikes] = useState(0)
  const [lastLikeTimestamp, setLastLikeTimestamp] = useState<number | null>(null)
  const controls = useAnimation()
  const constraintsRef = useRef(null)

  const fetchUsers = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const fetchedUsers = await sql`
        SELECT * FROM users
        WHERE uid != ${user.uid}
          AND uid NOT IN (SELECT unnest(likes) FROM users WHERE uid = ${user.uid})
          AND uid NOT IN (SELECT unnest(dislikes) FROM users WHERE uid = ${user.uid})
      `

      setUsers(fetchedUsers)
      setCurrentIndex(0)
      setDailyLikes(user.daily_likes || 0)
      setLastLikeTimestamp(user.last_like_timestamp ? new Date(user.last_like_timestamp).getTime() : null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load profiles. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
  }

  const handleSwipe = async (direction: number) => {
    if (!user || !users[currentIndex]) return

    const liked = direction > 0
    const swipedUser = users[currentIndex]

    if (liked) {
      const currentTime = Date.now()
      if (lastLikeTimestamp && currentTime - lastLikeTimestamp < LIKE_LIMIT_DURATION) {
        if (dailyLikes >= DAILY_LIKE_LIMIT) {
          alert("You've reached your daily like limit. Try again in 24 hours.")
          return
        }
      } else {
        await sql`
          UPDATE users
          SET daily_likes = 1, last_like_timestamp = NOW()
          WHERE uid = ${user.uid}
        `
        setDailyLikes(1)
        setLastLikeTimestamp(currentTime)
      }

      await sql`
        UPDATE users
        SET likes = array_append(likes, ${swipedUser.uid}),
            daily_likes = ${dailyLikes + 1}
        WHERE uid = ${user.uid}
      `
      setDailyLikes(dailyLikes + 1)

      const [matchedUser] = await sql`
        SELECT * FROM users WHERE uid = ${swipedUser.uid} AND ${user.uid} = ANY(likes)
      `

      if (matchedUser) {
        await sql`
          UPDATE users
          SET matches = array_append(matches, ${swipedUser.uid})
          WHERE uid = ${user.uid}
        `

        await sql`
          UPDATE users
          SET matches = array_append(matches, ${user.uid})
          WHERE uid = ${swipedUser.uid}
        `
      }
    } else {
      await sql`
        UPDATE users
        SET dislikes = array_append(dislikes, ${swipedUser.uid})
        WHERE uid = ${user.uid}
      `
    }

    setCurrentIndex((prev) => prev + 1)
  }

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      await handleSwipe(offset)
    } else {
      controls.start({ x: 0 })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center space-y-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-[#FF7F50] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#FF6B3C] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!users[currentIndex]) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white mb-2">No more profiles available</h2>
          <p className="text-xl text-gray-400 mb-8">Check back later for new people!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Profiles"}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const currentUser = users[currentIndex]

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-md mx-auto" ref={constraintsRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser.uid}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: controls.get("x"),
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            drag="x"
            dragConstraints={constraintsRef}
            onDragEnd={handleDragEnd}
            className="bg-gray-900 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="relative h-[70vh]">
              <img
                src={currentUser.photo_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  {currentUser.display_name}, {currentUser.age}
                </h2>
                <p className="text-xl text-gray-200">{currentUser.university}</p>
                <p className="text-gray-300">
                  {currentUser.course} • Year {currentUser.year}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-gray-300 text-lg">{currentUser.bio}</p>

              <div>
                <h3 className="font-semibold text-white mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.interests && currentUser.interests.length > 0 ? (
                    currentUser.interests.map((interest, index) => (
                      <span key={index} className="px-4 py-2 bg-gray-800 text-gray-200 rounded-full text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No interests listed</span>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe(-1)}
                  className="p-4 rounded-full bg-gray-800 border-2 border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <X size={30} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSwipe(1)}
                  disabled={dailyLikes >= DAILY_LIKE_LIMIT}
                  className="p-4 rounded-full bg-gray-800 border-2 border-green-500 text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                >
                  <Heart size={30} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-4 rounded-full bg-gray-800 border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Star size={30} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

