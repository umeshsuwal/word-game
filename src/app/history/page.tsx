"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { HistoryService } from "@/lib/historyService"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { createAvatar } from "@dicebear/core"
import { avataaars, bottts, initials, lorelei, micah, pixelArt } from "@dicebear/collection"
import type { GameHistory } from "@/types/user"
import { User, Trophy, ArrowLeft } from "lucide-react"

// Avatar styles available
const avatarStyles = [
  { name: "Avataaars", collection: avataaars, label: "Human" },
  { name: "Bottts", collection: bottts, label: "Robots" },
  { name: "Lorelei", collection: lorelei, label: "Cartoon" },
  { name: "Micah", collection: micah, label: "Modern" },
  { name: "Pixel Art", collection: pixelArt, label: "Pixel" },
  { name: "Initials", collection: initials, label: "Letters" },
]

export default function HistoryPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"profile" | "games">("profile")
  const [displayName, setDisplayName] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("Avataaars")
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0)
  const [updating, setUpdating] = useState(false)

  // Generate avatar URL from selected style and index
  const generateAvatarUrl = (style: string, index: number) => {
    const avatarStyle = avatarStyles.find((s) => s.name === style)
    if (!avatarStyle) return ""
    
    const avatar = createAvatar(avatarStyle.collection as any, {
      seed: `avatar-${index}`,
      size: 128,
    })
    return avatar.toDataUri()
  }

  // Create a short avatar reference string
  const createAvatarReference = (style: string, index: number) => {
    return `dicebear:${style}:${index}`
  }

  // Parse avatar reference string
  const parseAvatarReference = (reference: string) => {
    if (!reference || !reference.startsWith("dicebear:")) {
      return null
    }
    const [, style, indexStr] = reference.split(":")
    return { style, index: parseInt(indexStr, 10) }
  }

  // Generate a gallery of avatars for the selected style
  const generateAvatarGallery = (style: string, count: number = 12) => {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      url: generateAvatarUrl(style, i),
    }))
  }

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    setDisplayName(user.displayName || "")
    
    // Check if user has an avatar reference
    if (user.photoURL) {
      const avatarRef = parseAvatarReference(user.photoURL)
      if (avatarRef) {
        // It's a DiceBear reference
        setSelectedStyle(avatarRef.style)
        setSelectedAvatarIndex(avatarRef.index)
        setPhotoURL(generateAvatarUrl(avatarRef.style, avatarRef.index))
      } else {
        setPhotoURL(user.photoURL)
      }
    } else {
      // No avatar, set default
      const initialAvatar = generateAvatarUrl(selectedStyle, 0)
      setPhotoURL(initialAvatar)
      setSelectedAvatarIndex(0)
    }
    
    loadHistory()
  }, [user, router])

  // Update preview when style or avatar selection changes
  useEffect(() => {
    const newAvatarUrl = generateAvatarUrl(selectedStyle, selectedAvatarIndex)
    setPhotoURL(newAvatarUrl)
  }, [selectedStyle, selectedAvatarIndex])

  const loadHistory = async () => {
    if (!user) return

    setLoading(true)
    try {
      const games = await HistoryService.getUserGameHistory(user.uid, 10)
      setGameHistory(games)
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setUpdating(true)
    try {
      // Create short avatar reference instead of full data URI
      const avatarReference = createAvatarReference(selectedStyle, selectedAvatarIndex)
      
      // Update Firebase Auth profile with short reference
      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: avatarReference, // Short string: "dicebear:Avataaars:0"
      })

      // Update Firestore user document with both reference and data URI
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        photoURL: avatarReference,
        avatarDataUri: photoURL, // Store full data URI in Firestore
        avatarStyle: selectedStyle,
        avatarIndex: selectedAvatarIndex,
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === "profile"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === "games"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
            onClick={() => setActiveTab("games")}
          >
            <Trophy className="w-4 h-4" />
            Recent Games
          </button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your display name and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                          {displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar Style Selector */}
                  <div className="space-y-3">
                    <Label>Avatar Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {avatarStyles.map((style) => (
                        <button
                          key={style.name}
                          onClick={() => {
                            setSelectedStyle(style.name)
                            setSelectedAvatarIndex(0) // Reset to first avatar when style changes
                          }}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            selectedStyle === style.name
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Gallery */}
                  <div className="space-y-3">
                    <Label>Choose Your Avatar</Label>
                    <div className="grid grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-2 bg-muted/30 rounded-lg">
                      {generateAvatarGallery(selectedStyle, 16).map((avatar) => (
                        <button
                          key={avatar.index}
                          onClick={() => setSelectedAvatarIndex(avatar.index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-3 transition-all hover:scale-105 ${
                            selectedAvatarIndex === avatar.index
                              ? "border-primary ring-2 ring-primary ring-offset-2"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={`Avatar ${avatar.index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {selectedAvatarIndex === avatar.index && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Click an avatar to select it
                    </p>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                      {user.email}
                    </div>
                  </div>

                  {/* Update Button */}
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={updating}
                    className="w-full"
                    size="lg"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Game History Tab */}
            {activeTab === "games" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Matches (Last 10)</CardTitle>
                    <CardDescription>Your game history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gameHistory.length === 0 ? (
                      <div className="py-8 text-center space-y-4">
                        <p className="text-muted-foreground">No games played yet</p>
                        <Button onClick={() => router.push("/create")}>Start Playing</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {gameHistory.map((game, index) => (
                          <div 
                            key={game.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Match</div>
                                <div className="font-semibold">#{index + 1}</div>
                              </div>
                              <div className="h-10 w-px bg-border" />
                              <div>
                                <div className="font-medium">Room {game.roomCode}</div>
                                <div className="text-sm text-muted-foreground">
                                  {game.playedAt?.toDate().toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-lg font-bold">{game.score}</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                              {game.isWinner ? (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                  🏆 Winner
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  #{game.rank}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
