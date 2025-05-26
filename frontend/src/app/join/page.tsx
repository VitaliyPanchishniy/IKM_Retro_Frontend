"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { retrospectiveApi } from "@/lib/api-service"
import Header from "@/components/Header"

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get("code") || ""

  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [code, setCode] = useState(codeFromUrl)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<any>(null)

  // Check if user is logged in and if we have a code in the URL
  useEffect(() => {
    const checkAuthAndCode = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push(`/login?redirect=/join${codeFromUrl ? `?code=${codeFromUrl}` : ""}`)
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (!userData.isLoggedIn) {
          router.push(`/login?redirect=/join${codeFromUrl ? `?code=${codeFromUrl}` : ""}`)
          return
        }

        // If we have a code in the URL, try to get the invite details
        if (codeFromUrl) {
          try {
            const invite = await retrospectiveApi.getInviteByCode(codeFromUrl)
            setInviteDetails(invite)
          } catch (error) {
            console.error("Error fetching invite details:", error)
            setError("Invalid or expired invite code. Please check and try again.")
          }
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push(`/login?redirect=/join${codeFromUrl ? `?code=${codeFromUrl}` : ""}`)
      }
    }

    checkAuthAndCode()
  }, [router, codeFromUrl])

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Please enter an invite code")
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      // Join the retrospective via API
      const retrospective = await retrospectiveApi.joinRetrospective(code)

      // Navigate to the retrospective page
      router.push(
        `/retrospective?id=${retrospective.id}&name=${encodeURIComponent(retrospective.title)}&template=${retrospectiveApi.getTemplateNameByType(retrospective.template)}`,
      )
    } catch (error) {
      console.error("Error joining retrospective:", error)
      setError("Failed to join retrospective. The code may be invalid or expired.")
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we prepare to join the retrospective.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        

        <main className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h1 className="text-2xl font-bold mb-8">Join a Retrospective</h1>

          {inviteDetails ? (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <h2 className="text-lg font-medium text-green-800 mb-2">Invite Found!</h2>
                <p className="text-green-700">
                  You're about to join the retrospective:{" "}
                  <span className="font-medium">{inviteDetails.retrospective?.title || "Untitled Retrospective"}</span>
                </p>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Retrospective"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Enter Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="e.g. ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg font-mono"
                />
              </div>

              {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>}

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleJoin}
                disabled={isJoining || !code.trim()}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Retrospective"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>Don't have an invite code? Ask your team member to share one with you.</p>
              </div>
            </div>
          )}
        </main>

        <footer className="text-center text-sm text-gray-500 py-4">© 2025 RetroIKM. All rights reserved.</footer>
      </div>
    </div>
  )
}
