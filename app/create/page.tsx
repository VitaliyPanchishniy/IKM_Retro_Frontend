"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function CreatePage() {
  const router = useRouter()
  const [retroName, setRetroName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login?redirect=/create")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      if (!userData.isLoggedIn) {
        router.push("/login?redirect=/create")
        return
      }
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/login?redirect=/create")
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold">RetroSync</span>
            </Link>
          </div>
        </header>
        <div className="container flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we prepare your retrospective.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCreateRetro = () => {
    if (!retroName || !selectedTemplate) return

    // Create a new retrospective object
    const newRetro = {
      id: `retro-${Date.now()}`,
      name: retroName,
      template: selectedTemplate,
      createdAt: new Date().toISOString(),
      participants: 0,
      status: "active" as const,
    }

    // Save to localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const storedRetros = localStorage.getItem(`retros_${userData.email}`)
        let retros = []

        if (storedRetros) {
          retros = JSON.parse(storedRetros)
        }

        retros.push(newRetro)
        localStorage.setItem(`retros_${userData.email}`, JSON.stringify(retros))
      } catch (e) {
        console.error("Error saving retrospective:", e)
      }
    }

    // Navigate to the retrospective page
    router.push(`/retrospective?name=${encodeURIComponent(retroName)}&template=${encodeURIComponent(selectedTemplate)}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold">RetroSync</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-5xl py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-8">Create a New Retrospective</h1>

        <div className="grid gap-6">
          <div>
            <Label htmlFor="retro-name" className="text-base">
              Retrospective Name
            </Label>
            <Input
              id="retro-name"
              placeholder="Sprint 42 Retrospective"
              className="mt-2"
              value={retroName}
              onChange={(e) => setRetroName(e.target.value)}
            />
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Choose a Template</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                className={`cursor-pointer transition-all ${selectedTemplate === "glad-sad-mad" ? "ring-2 ring-purple-600" : ""}`}
                onClick={() => setSelectedTemplate("glad-sad-mad")}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Glad, Sad, Mad</CardTitle>
                  <CardDescription>Emotions-based reflection</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-100 text-green-800 p-2 rounded">Glad</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded">Sad</div>
                    <div className="bg-red-100 text-red-800 p-2 rounded">Mad</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {selectedTemplate === "glad-sad-mad" && (
                    <div className="text-purple-600 flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </CardFooter>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${selectedTemplate === "start-stop-continue" ? "ring-2 ring-purple-600" : ""}`}
                onClick={() => setSelectedTemplate("start-stop-continue")}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Start, Stop, Continue</CardTitle>
                  <CardDescription>Action-oriented reflection</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-100 text-green-800 p-2 rounded">Start</div>
                    <div className="bg-red-100 text-red-800 p-2 rounded">Stop</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded">Continue</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {selectedTemplate === "start-stop-continue" && (
                    <div className="text-purple-600 flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </CardFooter>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${selectedTemplate === "start-stop-continue-change" ? "ring-2 ring-purple-600" : ""}`}
                onClick={() => setSelectedTemplate("start-stop-continue-change")}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Start, Stop, Continue, Change</CardTitle>
                  <CardDescription>Extended action reflection</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-100 text-green-800 p-2 rounded">Start</div>
                    <div className="bg-red-100 text-red-800 p-2 rounded">Stop</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded">Continue</div>
                    <div className="bg-yellow-100 text-yellow-800 p-2 rounded">Change</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {selectedTemplate === "start-stop-continue-change" && (
                    <div className="text-purple-600 flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </CardFooter>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${selectedTemplate === "custom" ? "ring-2 ring-purple-600" : ""}`}
                onClick={() => setSelectedTemplate("custom")}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Custom</CardTitle>
                  <CardDescription>Create your own format</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-100 text-gray-800 p-2 rounded">Custom Column 1</div>
                    <div className="bg-gray-100 text-gray-800 p-2 rounded">Custom Column 2</div>
                    <div className="bg-gray-100 text-gray-800 p-2 rounded">Custom Column 3</div>
                    <div className="bg-gray-100 text-gray-800 p-2 rounded">+ Add Column</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {selectedTemplate === "custom" && (
                    <div className="text-purple-600 flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateRetro}
              disabled={!retroName || !selectedTemplate}
            >
              Create Retrospective
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

