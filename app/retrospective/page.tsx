"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RetroBoard } from "@/components/retro-board"
import { InviteDialog } from "@/components/invite-dialog"
import { ChevronRight, Users, MessageSquare, ThumbsUp, Layers, Share2 } from "lucide-react"
import Link from "next/link"

export default function RetrospectivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const retroName = searchParams.get("name") || "Untitled Retrospective"
  const templateType = searchParams.get("template") || "glad-sad-mad"
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [items, setItems] = useState<Record<string, any[]>>({})
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({})
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const checkUserLogin = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        setIsUserLoggedIn(false)
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (!userData.isLoggedIn) {
          setIsUserLoggedIn(false)
          return
        }
        setIsUserLoggedIn(true)
      } catch (e) {
        console.error("Error parsing user data:", e)
        setIsUserLoggedIn(false)
        return
      }

      setIsLoading(false)
    }

    checkUserLogin()
  }, [])

  useEffect(() => {
    if (!isLoading && !isUserLoggedIn) {
      router.push("/login?redirect=/retrospective")
    }
  }, [isLoading, isUserLoggedIn, router])

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold hidden md:inline-block">RetroSync</span>
            </Link>
          </div>
        </header>
        <div className="container flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Loading Retrospective...</h2>
            <p className="text-muted-foreground">Please wait while we load your retrospective board.</p>
          </div>
        </div>
      </div>
    )
  }

  // Initialize columns based on template
  useEffect(() => {
    let initialColumns: Record<string, any[]> = {}

    if (templateType === "glad-sad-mad") {
      initialColumns = {
        glad: [],
        sad: [],
        mad: [],
      }
    } else if (templateType === "start-stop-continue") {
      initialColumns = {
        start: [],
        stop: [],
        continue: [],
      }
    } else if (templateType === "start-stop-continue-change") {
      initialColumns = {
        start: [],
        stop: [],
        continue: [],
        change: [],
      }
    } else if (templateType === "custom") {
      initialColumns = {
        column1: [],
        column2: [],
        column3: [],
      }
    }

    setItems(initialColumns)
  }, [templateType])

  const handleAddItem = (columnId: string, content: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      content,
      votes: 0,
      comments: [],
    }

    setItems((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], newItem],
    }))
  }

  const handleVote = (columnId: string, itemId: string) => {
    const voteKey = `${columnId}:${itemId}`
    const userId = "current-user" // In a real app, this would be the actual user ID

    setUserVotes((prev) => {
      // If user already voted for this item, remove the vote
      if (prev[userId]?.includes(voteKey)) {
        setItems((prevItems) => ({
          ...prevItems,
          [columnId]: prevItems[columnId].map((item) =>
            item.id === itemId ? { ...item, votes: Math.max(0, item.votes - 1) } : item,
          ),
        }))

        return {
          ...prev,
          [userId]: prev[userId].filter((id) => id !== voteKey),
        }
      }
      // Otherwise add the vote
      else {
        setItems((prevItems) => ({
          ...prevItems,
          [columnId]: prevItems[columnId].map((item) =>
            item.id === itemId ? { ...item, votes: item.votes + 1 } : item,
          ),
        }))

        return {
          ...prev,
          [userId]: [...(prev[userId] || []), voteKey],
        }
      }
    })
  }

  const handleAddComment = (columnId: string, itemId: string, comment: string) => {
    setItems((prev) => ({
      ...prev,
      [columnId]: prev[columnId].map((item) =>
        item.id === itemId
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `comment-${Date.now()}`,
                  text: comment,
                  author: "You",
                },
              ],
            }
          : item,
      ),
    }))
  }

  const handleFinishRetro = () => {
    // Mark the retrospective as completed
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        const storedRetros = localStorage.getItem(`retros_${userData.email}`)

        if (storedRetros) {
          const retros = JSON.parse(storedRetros)
          const updatedRetros = retros.map((retro: any) => {
            if (retro.name === retroName && retro.template === templateType) {
              return {
                ...retro,
                status: "completed",
                participants: Math.floor(Math.random() * 5) + 2, // Random number of participants for demo
              }
            }
            return retro
          })

          localStorage.setItem(`retros_${userData.email}`, JSON.stringify(updatedRetros))
        }
      } catch (e) {
        console.error("Error updating retrospective status:", e)
      }
    }

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Check if we're dragging a card
    if (activeId.includes(":")) {
      // Extract column and item IDs
      const [activeColumn, activeItemId] = activeId.split(":")

      // If dropping on another card
      if (overId.includes(":")) {
        const [overColumn, overItemId] = overId.split(":")

        // If dragging between columns
        if (activeColumn !== overColumn) {
          setItems((prev) => {
            const activeItems = [...prev[activeColumn]]
            const overItems = [...prev[overColumn]]

            const activeItemIndex = activeItems.findIndex((item) => item.id === activeItemId)
            const activeItem = activeItems[activeItemIndex]

            activeItems.splice(activeItemIndex, 1)

            const overItemIndex = overItems.findIndex((item) => item.id === overItemId)
            overItems.splice(overItemIndex + 1, 0, activeItem)

            return {
              ...prev,
              [activeColumn]: activeItems,
              [overColumn]: overItems,
            }
          })
        } else {
          // If dragging within the same column
          setItems((prev) => {
            const columnItems = [...prev[activeColumn]]
            const oldIndex = columnItems.findIndex((item) => item.id === activeItemId)
            const newIndex = columnItems.findIndex((item) => item.id === overItemId)

            return {
              ...prev,
              [activeColumn]: arrayMove(columnItems, oldIndex, newIndex),
            }
          })
        }
      }
      // If dropping directly on a column
      else {
        const overColumn = overId

        if (activeColumn !== overColumn) {
          setItems((prev) => {
            const activeItems = [...prev[activeColumn]]
            const overItems = [...prev[overColumn]]

            const activeItemIndex = activeItems.findIndex((item) => item.id === activeItemId)
            const activeItem = activeItems[activeItemIndex]

            activeItems.splice(activeItemIndex, 1)
            overItems.push(activeItem)

            return {
              ...prev,
              [activeColumn]: activeItems,
              [overColumn]: overItems,
            }
          })
        }
      }
    }
  }

  const getColumnConfig = () => {
    if (templateType === "glad-sad-mad") {
      return [
        { id: "glad", label: "Glad", emoji: "😊", description: "Positive experiences", color: "green" },
        { id: "sad", label: "Sad", emoji: "😔", description: "Negative experiences", color: "blue" },
        { id: "mad", label: "Mad", emoji: "😠", description: "Frustrations and challenges", color: "red" },
      ]
    } else if (templateType === "start-stop-continue") {
      return [
        { id: "start", label: "Start", emoji: "🚀", description: "Things to begin doing", color: "green" },
        { id: "stop", label: "Stop", emoji: "🛑", description: "Things to stop doing", color: "red" },
        { id: "continue", label: "Continue", emoji: "➡️", description: "Things to keep doing", color: "blue" },
      ]
    } else if (templateType === "start-stop-continue-change") {
      return [
        { id: "start", label: "Start", emoji: "🚀", description: "Things to begin doing", color: "green" },
        { id: "stop", label: "Stop", emoji: "🛑", description: "Things to stop doing", color: "red" },
        { id: "continue", label: "Continue", emoji: "➡️", description: "Things to keep doing", color: "blue" },
        { id: "change", label: "Change", emoji: "🔄", description: "Things to modify", color: "yellow" },
      ]
    } else {
      return [
        { id: "column1", label: "Column 1", emoji: "📝", description: "Custom column", color: "purple" },
        { id: "column2", label: "Column 2", emoji: "📝", description: "Custom column", color: "orange" },
        { id: "column3", label: "Column 3", emoji: "📝", description: "Custom column", color: "teal" },
      ]
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold hidden md:inline-block">RetroSync</span>
          </Link>
          <div className="h-6 w-px bg-gray-200 hidden md:block" />
          <h1 className="text-lg font-medium truncate max-w-[200px] md:max-w-md">{retroName}</h1>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setInviteDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline-block">Invite Others</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b bg-gray-50">
        <div className="container px-4 py-2 md:px-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentStep === 1 ? "bg-purple-600 text-white" : "bg-white border"}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>1. Reflect</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentStep === 2 ? "bg-purple-600 text-white" : "bg-white border"}`}
            >
              <Layers className="h-4 w-4" />
              <span>2. Group</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentStep === 3 ? "bg-purple-600 text-white" : "bg-white border"}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>3. Vote</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentStep === 4 ? "bg-purple-600 text-white" : "bg-white border"}`}
            >
              <Users className="h-4 w-4" />
              <span>4. Discuss</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container px-4 py-6 md:px-6">
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="w-full">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <RetroBoard
                columns={getColumnConfig()}
                items={items}
                onAddItem={handleAddItem}
                onVote={handleVote}
                onAddComment={handleAddComment}
                currentStep={currentStep}
              />
            </DndContext>
          </TabsContent>
          <TabsContent value="timeline">
            <Card className="p-6">
              <p className="text-center text-gray-500">Timeline view will be available in a future update.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4">
        <div className="container flex justify-between items-center px-4 md:px-6">
          <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setCurrentStep((prev) => prev + 1)}>
                Next Step
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleFinishRetro}>
                Finish Retrospective
              </Button>
            )}
          </div>
        </div>
      </footer>

      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} retroName={retroName} />
    </div>
  )
}

