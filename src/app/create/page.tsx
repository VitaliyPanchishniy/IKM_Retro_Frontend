"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import API from '../../../lib/api';

export default function CreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [retroName, setRetroName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("start-stop-continue")
  const [error, setError] = useState<string | null>(null)

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

  const handleCreateRetro = async () => {
    if (!retroName) {
      setError("Retrospective name is required")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const templateMap = {
        "start-stop-continue": 1,
        "glad-sad-mad": 2,
        "start-stop-continue-change": 3,
        "keep-stop-less-more-start": 4,
      } as const

      const selectedTemplateType = templateMap[selectedTemplate as keyof typeof templateMap]

      const response = await API.post('/api/Retrospective', {
        title: retroName,
        templateType: selectedTemplateType
      })

      console.log('Ретроспектива створена!', response.data)
      router.push("/dashboard")
    } catch (error: any) {
      console.error('Помилка при створенні ретроспективи', retroName, selectedTemplate, error)
      setError(error.message || "Unknown error")
    } finally {
      setIsCreating(false)
    }
  }

  const getTemplatePreview = () => {
    const box = (emoji: string, label: string, color: string) => (
      <div className={`rounded-lg border p-4 text-center ${color}`}>
        <div className="text-xl">{emoji}</div>
        <div className="font-medium mt-1">{label}</div>
      </div>
    )

    switch (selectedTemplate) {
      case "start-stop-continue":
        return (
          <>
            {box("🟢", "Start", "bg-green-50 border-green-200 text-green-700")}
            {box("⛔️", "Stop", "bg-red-50 border-red-200 text-red-700")}
            {box("🔄", "Continue", "bg-blue-50 border-blue-200 text-blue-700")}
          </>
        )
      case "glad-sad-mad":
        return (
          <>
            {box("😀", "Glad", "bg-green-50 border-green-200 text-green-700")}
            {box("😢", "Sad", "bg-blue-50 border-blue-200 text-blue-700")}
            {box("😡", "Mad", "bg-red-50 border-red-200 text-red-700")}
          </>
        )
      case "start-stop-continue-change":
        return (
          <>
            {box("🟢", "Start", "bg-green-50 border-green-200 text-green-700")}
            {box("⛔️", "Stop", "bg-red-50 border-red-200 text-red-700")}
            {box("🔄", "Continue", "bg-blue-50 border-blue-200 text-blue-700")}
            {box("🔧", "Change", "bg-yellow-50 border-yellow-200 text-yellow-700")}
          </>
        )
      case "keep-stop-less-more-start":
        return (
          <>
            {box("✔️", "Keep Doing", "bg-green-50 border-green-200 text-green-700")}
            {box("⛔️", "Stop Doing", "bg-red-50 border-red-200 text-red-700")}
            {box("➖", "Less Of", "bg-yellow-50 border-yellow-200 text-yellow-700")}
            {box("➕", "More Of", "bg-blue-50 border-blue-200 text-blue-700")}
            {box("✅", "Start Doing", "bg-purple-50 border-purple-200 text-purple-700")}
          </>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we prepare your retrospective.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-indigo-700">
            Retro<span className="text-purple-600">IKM</span>
          </Link>
        </header>

        <main className="bg-white rounded-xl shadow p-6 mt-6">
          <h1 className="text-2xl font-bold mb-6">Start a New Retro</h1>

          <div className="space-y-4">
            <div>
              <Label htmlFor="retro-name">Retro Name</Label>
              <Input
                id="retro-name"
                placeholder="e.g. Sprint 23 Retrospective"
                value={retroName}
                onChange={(e) => setRetroName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="template">Choose Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start-stop-continue">🟢 Start / ⛔️ Stop / 🔄 Continue</SelectItem>
                  <SelectItem value="glad-sad-mad">😀 Glad / 😢 Sad / 😡 Mad</SelectItem>
                  <SelectItem value="start-stop-continue-change">
                    🟢 Start / ⛔️ Stop / 🔄 Continue / 🔧 Change
                  </SelectItem>
                  <SelectItem value="keep-stop-less-more-start">
                    ✔️ Keep / ⛔️ Stop / ➖ Less / ➕ More / ✅ Start
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template Preview</Label>
              <div className={`grid gap-4 mt-3 ${
                selectedTemplate === "keep-stop-less-more-start"
                  ? "grid-cols-2 md:grid-cols-3"
                  : selectedTemplate === "start-stop-continue-change"
                  ? "grid-cols-2 md:grid-cols-4"
                  : "grid-cols-1 md:grid-cols-3"
              }`}>
                {getTemplatePreview()}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button onClick={handleCreateRetro} disabled={isCreating}>
              {isCreating && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Create Retrospective
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
