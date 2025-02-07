import type { UserProfile } from "@/types/user"

interface UserProfileCardProps {
  user: UserProfile
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-[#8A2BE2] to-[#FF7F50]">
        <img
          src={user.photoURL || "/placeholder.svg"}
          alt={user.displayName}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
        />
      </div>
      <div className="pt-16 pb-6 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.displayName}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {user.age} years old • {user.university}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {user.course} • Year {user.year}
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-300">{user.bio}</p>
      </div>
    </div>
  )
}

