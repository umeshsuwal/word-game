import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
    <motion.div 
      className="flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl p-3 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
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
      </motion.div>
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="sm" variant="ghost" onClick={() => router.push("/history")}>
            Settings
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="sm" variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
