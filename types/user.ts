import type { Timestamp } from "firebase/firestore"

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  university: string
  bio: string
  interests: string[]
  age: number
  gender: string
  lookingFor: string
  course: string
  year: number
  matches: string[]
  likes: string[]
  dislikes: string[]
  dailyLikes: number
  lastLikeTimestamp: Timestamp
}

