"use client"

import { AuthProvider } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import { Montserrat } from "next/font/google"
import "./globals.css"
import AuthWrapper from "@/components/auth-wrapper"
import { usePathname } from "next/navigation"
import type React from "react"

const montserrat = Montserrat({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showNavbar = !["/login", "/", "/onboarding"].includes(pathname)

  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.className} min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <AuthWrapper>
            <main className={`${showNavbar ? "pb-16" : ""} min-h-screen`}>{children}</main>
            {showNavbar && <Navbar />}
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}

