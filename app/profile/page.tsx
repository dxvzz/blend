"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, storage } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Camera, Settings2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import SettingsView from "./settings-view"

export default function ProfilePage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !profile) return
    setUploading(true)

    try {
      const file = e.target.files[0]
      const storageRef = ref(storage, `profile-images/${profile.uid}`)
      await uploadBytes(storageRef, file)
      const photoURL = await getDownloadURL(storageRef)

      const userRef = doc(db, "users", profile.uid)
      await updateDoc(userRef, { photoURL })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setUploading(false)
    }
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pb-20">
      <AnimatePresence mode="wait">
        {showSettings ? (
          <SettingsView onBack={() => setShowSettings(false)} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container max-w-md mx-auto px-4 py-8"
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-0">
                <div className="relative h-40 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-lg">
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700">
                        <img
                          src={profile.photoURL || "/placeholder.svg"}
                          alt={profile.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label
                        className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer 
                          bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors
                          ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Camera className="w-5 h-5 text-gray-300" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="px-6 pt-20 pb-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
                    <p className="text-gray-400 text-sm mt-1">{profile.email}</p>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-3">About</h2>
                      <p className="text-gray-300">{profile.bio || "No bio yet"}</p>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-white mb-3">Education</h2>
                      <div className="space-y-2">
                        <p className="text-gray-300">{profile.university}</p>
                        <p className="text-gray-300">
                          {profile.course} • Year {profile.year}
                        </p>
                      </div>
                    </div>

                    {profile.interests && profile.interests.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-3">Interests</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-gray-700 text-gray-200 hover:bg-gray-600"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                      onClick={() => router.push("/profile/edit")}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-200 hover:bg-gray-700"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

