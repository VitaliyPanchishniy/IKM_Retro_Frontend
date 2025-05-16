"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import API from '../../../lib/api';
import Header from "@/components/Header"

export default function CreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [retroName, setRetroName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("StartStopContinue")
  const [anonymousMode, setAnonymousMode] = useState(false)

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we prepare your retrospective.</p>
        </div>
      </div>
    )
  }

  // const handleCreateRetro = () => {
  //   if (!retroName) return

  //   // Create a new retrospective object
  //   const newRetro = {
  //     id: `retro-${Date.now()}`,
  //     name: retroName,
  //     template: selectedTemplate,
  //     createdAt: new Date().toISOString(),
  //     participants: 0,
  //     status: "active" as const,
  //   }

    


  //   // Navigate to the retrospective page
  //   router.push(`/retrospective?name=${encodeURIComponent(retroName)}&template=${encodeURIComponent(selectedTemplate)}`)
  // }

  const handleCreateRetro = async () => {
    try {
      
      // console.log(retroName);
      // console.log(selectedTemplate);
      const templateMap = {
        StartStopContinue: 1,
        GladSadMad: 2,
        StartStopContinueChange: 3,
      } as const;
      const selectedTemplateType = templateMap[selectedTemplate as keyof typeof templateMap];
 
      const response = await API.post('/api/Retrospective', {
        title: retroName,
        templateType: selectedTemplateType
      });

      console.log('Ретроспектива создана!', response.data);
      router.push("/dashboard")
      // можно редиректить или показывать уведомление
    } catch (error) {
      console.error('Ошибка при создании ретроспективы', retroName, selectedTemplate, error);
      console.log(retroName);
      console.log(selectedTemplate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-3xl mx-auto p-4">

        <main className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h1 className="text-2xl font-bold mb-8">Start a New Retro</h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="retro-name">Retro Name</Label>
              <Input
                id="retro-name"
                placeholder="e.g. Sprint 23 Retrospective"
                value={retroName}
                onChange={(e) => setRetroName(e.target.value)}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="team-name">Team Name (Optional)</Label>
              <Input
                id="team-name"
                placeholder="e.g. Product Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="template">Choose Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="StartStopContinue">Start/Stop/Continue</SelectItem>
                  <SelectItem value="GladSadMad">Glad/Sad/Mad</SelectItem>
                  <SelectItem value="StartStopContinueChange">Start/Stop/Continue/Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template Preview</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {selectedTemplate === "StartStopContinue" && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                      <div className="text-green-600 font-medium">Start</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                      <div className="text-red-600 font-medium">Stop</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                      <div className="text-blue-600 font-medium">Continue</div>
                    </div>
                  </>
                )}

                {selectedTemplate === "GladSadMad" && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                      <div className="text-green-600 font-medium">Glad</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                      <div className="text-blue-600 font-medium">Sad</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                      <div className="text-red-600 font-medium">Mad</div>
                    </div>
                  </>
                )}

                {selectedTemplate === "StartStopContinueChange" && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                      <div className="text-green-600 font-medium">Start</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                      <div className="text-red-600 font-medium">Stop</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center">
                      <div className="text-blue-600 font-medium">Continue</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-center col-span-3">
                      <div className="text-yellow-600 font-medium">Change</div>
                    </div>
                  </>
                )}

                {selectedTemplate === "custom" && (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                      <div className="text-gray-600 font-medium">Custom Column 1</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                      <div className="text-gray-600 font-medium">Custom Column 2</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                      <div className="text-gray-600 font-medium">Custom Column 3</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous-mode">Enable Anonymous Mode</Label>
                <p className="text-sm text-gray-500">Participants' names will be hidden</p>
              </div>
              <Switch id="anonymous-mode" checked={anonymousMode} onCheckedChange={setAnonymousMode} />
            </div> */}

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
              onClick={handleCreateRetro}
              disabled={!retroName}
            >
              Create Board
            </Button>
          </div>
        </main>

        <footer className="text-center text-sm text-gray-500 py-4 mt-4">© 2025 RetroIKM. All rights reserved.</footer>
      </div>
    </div>
  )
}
