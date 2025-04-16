"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function JoinPage() {
  const router = useRouter()
  const [boardCode, setBoardCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const avatars = [
    { id: 1, emoji: "🐱" },
    { id: 2, emoji: "🐶" },
    { id: 3, emoji: "🦊" },
    { id: 4, emoji: "🐻" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!boardCode.trim()) {
      newErrors.boardCode = "Board code is required"
    }

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required"
    }

    if (selectedAvatar === null) {
      newErrors.avatar = "Please select an avatar"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleJoinBoard = () => {
    if (!validateForm()) {
      return
    }

    // In a real app, we would validate the board code
    // For demo purposes, we'll just redirect to a mock board
    router.push("/retrospective?name=Team%20Retrospective&template=glad-sad-mad")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-indigo-700">
                Retro<span className="text-purple-600">KM</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Join a Retro Board</h1>
            <p className="text-gray-600 text-sm">Enter the code to join your team's board</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="board-code">Board Code</Label>
              <Input
                id="board-code"
                placeholder="Enter 8-digit code"
                value={boardCode}
                onChange={(e) => setBoardCode(e.target.value)}
              />
              {errors.boardCode && <p className="text-sm text-red-500">{errors.boardCode}</p>}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Don't have a code? Ask your facilitator
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="Your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              {errors.displayName && <p className="text-sm text-red-500">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <Label>Choose Avatar</Label>
              <div className="flex gap-3 justify-center">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      selectedAvatar === avatar.id
                        ? "bg-purple-100 border-2 border-purple-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  >
                    {avatar.emoji}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-400"
                >
                  +
                </button>
              </div>
              {errors.avatar && <p className="text-sm text-red-500 text-center">{errors.avatar}</p>}
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleJoinBoard}>
              Join Board
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-purple-600 hover:underline">
                Back to Main Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
