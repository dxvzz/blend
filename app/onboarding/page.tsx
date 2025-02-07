"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const questions = [
  { key: "name", label: "What's your name?" },
  { key: "university", label: "What university do you attend?" },
  { key: "campus", label: "Which campus are you located at?" },
  { key: "course", label: "What course are you studying?" },
  { key: "year", label: "What year are you in?" },
  { key: "bio", label: "Tell us a bit about yourself" },
  { key: "interests", label: "What are your interests? (comma-separated)" },
  { key: "lookingFor", label: "What are you looking for?" },
]

export default function OnboardingPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    campus: "",
    course: "",
    year: "",
    bio: "",
    interests: "",
    lookingFor: "",
  })

  useEffect(() => {
    if (!authLoading && profile && Object.keys(profile).length > 3) {
      router.push("/discover")
    }
  }, [authLoading, profile, router])

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push("/")
    }
  }, [authLoading, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      try {
        await setDoc(
          doc(db, "users", profile.uid),
          {
            ...profile,
            ...formData,
            interests: formData.interests.split(",").map((i) => i.trim()),
            matches: [],
            likes: [],
            dislikes: [],
          },
          { merge: true },
        )
        router.push("/discover")
      } catch (error) {
        console.error("Error saving profile:", error)
      }
    }
  }

  const currentQuestion = questions[step]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to BLEND</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentQuestion.label}
            </label>
            {currentQuestion.key === "bio" ? (
              <textarea
                name={currentQuestion.key}
                value={formData[currentQuestion.key as keyof typeof formData]}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            ) : currentQuestion.key === "lookingFor" ? (
              <select
                name={currentQuestion.key}
                value={formData[currentQuestion.key as keyof typeof formData]}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an option</option>
                <option value="friendship">Friendship</option>
                <option value="dating">Dating</option>
                <option value="networking">Networking</option>
              </select>
            ) : (
              <input
                type="text"
                name={currentQuestion.key}
                value={formData[currentQuestion.key as keyof typeof formData]}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {step < questions.length - 1 ? "Next" : "Complete Profile"}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>
            Step {step + 1} of {questions.length}
          </span>
          <span>{Math.round(((step + 1) / questions.length) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50] rounded-full"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </motion.div>
    </div>
  )
}

