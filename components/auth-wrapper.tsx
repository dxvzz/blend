"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import type React from "react" // Added import for React

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (profile) {
        if (pathname === "/" || pathname === "/onboarding") {
          router.push("/discover")
        }
      } else {
        if (pathname !== "/" && pathname !== "/onboarding") {
          router.push("/")
        }
      }
    }
  }, [profile, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return <>{children}</>
}

