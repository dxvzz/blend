"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      router.push("/discover")
    }
  }, [user, router])

  useEffect(() => {
    const fetchGoogleAuthUrl = async () => {
      try {
        const response = await fetch('/api/auth/google-url'); // Create an API route to fetch the URL
        const data = await response.json();
        setGoogleAuthUrl(data.url);
      } catch (error) {
        console.error("Error fetching Google Auth URL:", error)
        setError("Failed to initialize Google login. Please try again.")
      }
    }

    fetchGoogleAuthUrl()
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    if (code) {
      handleGoogleCallback(code)
    }
  }, [])

  const handleGoogleCallback = async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      await login(code)
      router.push("/onboarding")
    } catch (error) {
      console.error("Error signing in with Google:", error)
      setError("Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Welcome to <span className="text-blue-600">BLEND</span>
        </h1>
        <p className="text-xl md:text-2xl text-white">Connect with university peers</p>
        {googleAuthUrl && (
          <a
            href={googleAuthUrl}
            className="flex items-center justify-center gap-3 w-full bg-white text-gray-700 rounded-full py-3 px-6 font-medium shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Image src="/google-logo.png" alt="Google" width={20} height={20} />
            Continue with Google
          </a>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  )
}

