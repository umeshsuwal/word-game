import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { avataaars, bottts, initials, lorelei, micah, pixelArt } from "@dicebear/collection"

const avatarStyles: Record<string, any> = {
  "Avataaars": avataaars,
  "Bottts": bottts,
  "Lorelei": lorelei,
  "Micah": micah,
  "Pixel Art": pixelArt,
  "Initials": initials,
}

interface AvatarDisplayProps {
  photoURL?: string | null
  displayName?: string | null
  email?: string | null
  size?: number
  className?: string
}

export function AvatarDisplay({ 
  photoURL, 
  displayName, 
  email, 
  size = 36,
  className = ""
}: AvatarDisplayProps) {
  const avatarUri = useMemo(() => {
    if (!photoURL) return null
    
    if (photoURL.startsWith("dicebear:")) {
      const [, style, indexStr] = photoURL.split(":")
      const avatarStyle = avatarStyles[style]
      
      if (avatarStyle) {
        const avatar = createAvatar(avatarStyle, {
          seed: `avatar-${indexStr}`,
          size,
        })
        return avatar.toDataUri()
      }
    }
    
    return photoURL
  }, [photoURL, size])

  if (avatarUri) {
    return (
      <img 
        src={avatarUri} 
        alt="Avatar" 
        className={className || `h-${Math.floor(size / 4)} w-${Math.floor(size / 4)} rounded-full`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Fallback to initials
  const initial = displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?"
  
  return (
    <div 
      className={className || "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initial}
    </div>
  )
}
