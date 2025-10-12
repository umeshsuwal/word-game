"use client"

import { createAvatar } from "@dicebear/core"
import { avataaars } from "@dicebear/collection"

interface PlayerAvatarProps {
  username: string
  size?: number
  className?: string
}

export function PlayerAvatar({ username, size = 40, className = "" }: PlayerAvatarProps) {
  const getAvatarUrl = (username: string, size: number) => {
    const avatar = createAvatar(avataaars, {
      seed: username,
      size: size,
    })
    return avatar.toDataUri()
  }

  return (
    <img
      src={getAvatarUrl(username, size)}
      alt={username}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
