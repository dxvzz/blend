"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { ArrowLeft, FileText, Info, Code, Trash2, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface SettingsViewProps {
  onBack: () => void
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await auth.currentUser?.delete()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container max-w-md mx-auto px-4 py-8"
    >
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={onBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>

          <div className="space-y-3">
            <Link href="/privacy-policy">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">
                <FileText className="mr-3 h-5 w-5" />
                Privacy Policy
              </Button>
            </Link>

            <Link href="/terms-conditions">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">
                <Info className="mr-3 h-5 w-5" />
                Terms & Conditions
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              disabled
            >
              <Code className="mr-3 h-5 w-5" />
              Build Version: 1.0.0
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-gray-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-3 h-5 w-5" />
              Delete Account
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteAccount}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

