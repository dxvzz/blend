"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { UserProfile } from "@/types/user"
import type React from "react"
import sql from "@/lib/db"

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      if (token) {
        try {
          const [userData] = await sql`
            SELECT * FROM users WHERE uid = ${token}
          `
          if (userData) {
            setUser(userData as UserProfile)
          }
        } catch (error) {
          console.error("Error checking auth:", error)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (code: string) => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error logging in:", error)
    }
  }

  const logout = async () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

