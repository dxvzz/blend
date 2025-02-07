"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Flame, MessageCircle, Heart, User } from "lucide-react"
import { motion } from "framer-motion"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { path: "/discover", icon: Flame, label: "Discover" },
    { path: "/matches", icon: Heart, label: "Matches" },
    { path: "/chats", icon: MessageCircle, label: "Messages" },
    { path: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-gray-800 py-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.path} href={item.path} className="relative flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <item.icon size={24} />
              </motion.div>
              <span className={`text-xs mt-1 ${isActive ? "text-white" : "text-gray-500"}`}>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 left-1/2 w-1 h-1 bg-[#FF7F50] rounded-full"
                  style={{ x: "-50%" }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

