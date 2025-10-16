import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AvatarDisplay } from "./AvatarDisplay"

interface User {
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
}

interface UserProfileBarProps {
  user: User
  onLogout: () => void
}

export function UserProfileBar({ user, onLogout }: UserProfileBarProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <AvatarDisplay
          photoURL={user.photoURL}
          displayName={user.displayName}
          email={user.email}
          size={36}
          className="h-9 w-9 rounded-full"
        />
        <div>
          <p className="text-sm font-medium">{user.displayName || user.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => router.push("/history")}>
          Settings
        </Button>
        <Button size="sm" variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
