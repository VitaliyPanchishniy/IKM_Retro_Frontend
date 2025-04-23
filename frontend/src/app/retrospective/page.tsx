"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PlusCircle, MessageSquare, ThumbsUp, MoreHorizontal } from "lucide-react"

interface RetroItem {
  id: string
  content: string
  votes: number
  author: string
  comments: {
    id: string
    text: string
    author: string
  }[]
}

interface RetroColumn {
  id: string
  title: string
  items: RetroItem[]
}

export default function RetrospectivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const retroName = searchParams.get("name") || "Untitled Retrospective"
  const templateType = searchParams.get("template") || "glad-sad-mad"
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [columns, setColumns] = useState<RetroColumn[]>([])
  const [newItems, setNewItems] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login?redirect=/retrospective")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      if (!userData.isLoggedIn) {
        router.push("/login?redirect=/retrospective")
        return
      }
      setUser(userData)
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/login?redirect=/retrospective")
      return
    }

    setIsLoading(false)
  }, [router])

  // Initialize columns based on template
  useEffect(() => {
    if (isLoading) return

    let initialColumns: RetroColumn[] = []

    if (templateType === "glad-sad-mad") {
      initialColumns = [
        {
          id: "glad",
          title: "What Went Well",
          items: [
            {
              id: "item-1",
              content: "Successfully launched the new feature ahead of schedule",
              votes: 3,
              author: "You",
              comments: [],
            },
          ],
        },
        {
          id: "sad",
          title: "What Needs Improvement",
          items: [
            {
              id: "item-2",
              content: "Communication between teams could be better",
              votes: 2,
              author: "Jane",
              comments: [],
            },
          ],
        },
        {
          id: "mad",
          title: "Action Items",
          items: [
            {
              id: "item-3",
              content: "Set up weekly sync meetings between dev and QA",
              votes: 5,
              author: "Mark",
              comments: [],
            },
          ],
        },
      ]
    } else if (templateType === "start-stop-continue") {
      initialColumns = [
        { id: "start", title: "Start", items: [] },
        { id: "stop", title: "Stop", items: [] },
        { id: "continue", title: "Continue", items: [] },
      ]
    } else if (templateType === "start-stop-continue-change") {
      initialColumns = [
        { id: "start", title: "Start", items: [] },
        { id: "stop", title: "Stop", items: [] },
        { id: "continue", title: "Continue", items: [] },
        { id: "change", title: "Change", items: [] },
      ]
    } else {
      initialColumns = [
        { id: "column1", title: "Custom Column 1", items: [] },
        { id: "column2", title: "Custom Column 2", items: [] },
        { id: "column3", title: "Custom Column 3", items: [] },
      ]
    }

    setColumns(initialColumns)
  }, [isLoading, templateType])

  const handleAddItem = (columnId: string) => {
    if (!newItems[columnId]?.trim()) return

    const newItem: RetroItem = {
      id: `item-${Date.now()}`,
      content: newItems[columnId],
      votes: 0,
      author: "You",
      comments: [],
    }

    setColumns((prev) =>
      prev.map((column) => (column.id === columnId ? { ...column, items: [...column.items, newItem] } : column)),
    )

    setNewItems((prev) => ({ ...prev, [columnId]: "" }))
  }

  const handleVote = (columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? {
              ...column,
              items: column.items.map((item) => (item.id === itemId ? { ...item, votes: item.votes + 1 } : item)),
            }
          : column,
      ),
    )
  }

  const handleAddComment = (columnId: string, itemId: string) => {
    const commentText = newComments[itemId]
    if (!commentText?.trim()) return

    const newComment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: "You",
    }

    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? {
              ...column,
              items: column.items.map((item) =>
                item.id === itemId ? { ...item, comments: [...item.comments, newComment] } : item,
              ),
            }
          : column,
      ),
    )

    setNewComments((prev) => ({ ...prev, [itemId]: "" }))
  }

  const toggleComments = (itemId: string) => {
    setShowComments((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading Retrospective...</h2>
          <p className="text-gray-500">Please wait while we load your retrospective board.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-indigo-700">
                  Retro<span className="text-purple-600">IKM</span>
                </span>
              </Link>
              <div className="ml-4 text-lg font-medium text-gray-900">{retroName}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{column.title}</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {column.items.map((item) => (
                  <div key={item.id} className="bg-white border rounded-md shadow-sm">
                    <div className="p-3">
                      <div className="text-sm">{item.content}</div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.author}</span>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-1 hover:text-purple-600"
                            onClick={() => toggleComments(item.id)}
                          >
                            <MessageSquare className="h-3 w-3" />
                            {item.comments.length > 0 && item.comments.length}
                          </button>
                          <button
                            className="flex items-center gap-1 hover:text-purple-600"
                            onClick={() => handleVote(column.id, item.id)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {item.votes > 0 && item.votes}
                          </button>
                        </div>
                      </div>
                    </div>

                    {showComments[item.id] && (
                      <div className="border-t px-3 py-2 bg-gray-50">
                        {item.comments.length > 0 ? (
                          <div className="space-y-2 mb-2">
                            {item.comments.map((comment) => (
                              <div key={comment.id} className="text-xs">
                                <div className="font-medium">{comment.author}</div>
                                <div>{comment.text}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 mb-2">No comments yet</div>
                        )}

                        <div className="flex gap-2">
                          <Input
                            className="h-7 text-xs"
                            placeholder="Add a comment..."
                            value={newComments[item.id] || ""}
                            onChange={(e) => setNewComments((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddComment(column.id, item.id)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-7 px-2 bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleAddComment(column.id, item.id)}
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    placeholder="Add an item..."
                    value={newItems[column.id] || ""}
                    onChange={(e) => setNewItems((prev) => ({ ...prev, [column.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(column.id)
                      }
                    }}
                  />
                  <Button className="px-2 bg-purple-600 hover:bg-purple-700" onClick={() => handleAddItem(column.id)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleFinishRetro}>
            Finish Retrospective
          </Button>
        </div>
      </main>
    </div>
  )
}
