"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  PlusCircle,
  MessageSquare,
  ThumbsUp,
  MoreHorizontal,
  Loader2,
  Trash2,
  Share2,
  Edit,
  Check,
  X,
} from "lucide-react"
import {
  retrospectiveApi,
  type Retrospective,
  type Group,
  type GroupItem,
  type Comment,
  type CreateGroupItemRequest,
  type CreateCommentRequest,
  type UpdateGroupItemRequest,
  type MoveGroupItemRequest,
} from "@/lib/api-service"
import { ShareDialog } from "@/components/share-dialog"
import { RetroSteps } from "@/components/retro-steps"
import { TimerDialog } from "@/components/timer-dialog"
import { ActionItemsPanel } from "@/components/action-items-panel"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RetroColumn {
  id: string
  groupId: number
  title: string
  emoji: string
  description: string
  items: GroupItem[]
}

export default function RetrospectivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const retroId = searchParams.get("id") || ""
  const retroName = searchParams.get("name") || "Untitled Retrospective"
  const templateType = searchParams.get("template") || "glad-sad-mad"

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<number | null>(null)
  const [isAddingComment, setIsAddingComment] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null)
  const [columns, setColumns] = useState<RetroColumn[]>([])
  const [newItems, setNewItems] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [newComments, setNewComments] = useState<Record<number, string>>({})
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({})
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [remainingVotes, setRemainingVotes] = useState(6)
  const [showActionItems, setShowActionItems] = useState(false)
  const [showVoteLimitAlert, setShowVoteLimitAlert] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Load and save remaining votes to localStorage
  useEffect(() => {
    // Load remaining votes from localStorage
    const storedVotes = localStorage.getItem(`retro_${retroId}_remaining_votes`)
    if (storedVotes) {
      setRemainingVotes(Number.parseInt(storedVotes, 10))
    }
  }, [retroId])

  // Save remaining votes to localStorage whenever it changes
  useEffect(() => {
    if (retroId) {
      localStorage.setItem(`retro_${retroId}_remaining_votes`, remainingVotes.toString())
    }
  }, [remainingVotes, retroId])

  // Save vote counts to localStorage whenever they change
  useEffect(() => {
    if (retroId && Object.keys(voteCounts).length > 0) {
      localStorage.setItem(`retro_${retroId}_vote_counts`, JSON.stringify(voteCounts))
    }
  }, [voteCounts, retroId])

  // Set up periodic refresh of vote counts and comments
  useEffect(() => {
    if (retroId && currentStep >= 3) {
      // Refresh vote counts and comments every 10 seconds
      const interval = setInterval(async () => {
        try {
          // Refresh group items to get updated data
          const groupItems = await retrospectiveApi.getGroupItems(retroId)

          // Update vote counts for all items
          const updatedVoteCounts: Record<number, number> = { ...voteCounts }
          const updatedCommentCounts: Record<number, number> = { ...commentCounts }

          for (const item of groupItems) {
            try {
              // Get vote count for this item
              const voteResponse = await retrospectiveApi.getVotesForGroupItem(item.id)
              updatedVoteCounts[item.id] = voteResponse.count

              // Get comment count for this item
              const commentResponse = await retrospectiveApi.getComments(item.id)
              updatedCommentCounts[item.id] = commentResponse.length
            } catch (error) {
              console.error(`Error refreshing data for item ${item.id}:`, error)
            }
          }

          setVoteCounts(updatedVoteCounts)
          setCommentCounts(updatedCommentCounts)
        } catch (error) {
          console.error("Error refreshing data:", error)
        }
      }, 10000) // 10 seconds

      setRefreshInterval(interval)

      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [retroId, currentStep])

  // Check if user is logged in and load retrospective data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
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

        // If we have a retrospective ID, load it from the API
        if (retroId) {
          try {
            // In a real implementation, you would fetch the specific retrospective by ID
            // For now, we'll get all retrospectives and find the one with matching ID
            const retros = await retrospectiveApi.getAllRetrospectives()
            const foundRetro = retros.find((r) => r.retrospective.id === retroId)

            if (foundRetro) {
              setRetrospective(foundRetro.retrospective)

              // Convert groups to columns
              const retroColumns = mapGroupsToColumns(foundRetro.retrospective.groups, templateType)
              setColumns(retroColumns)

              // Load group items for this retrospective
              try {
                const groupItems = await retrospectiveApi.getGroupItems(retroId)

                // Update columns with group items
                updateColumnsWithGroupItems(retroColumns, groupItems)

                // Load saved vote counts from localStorage
                const storedVoteCounts = localStorage.getItem(`retro_${retroId}_vote_counts`)
                if (storedVoteCounts) {
                  setVoteCounts(JSON.parse(storedVoteCounts))
                }

                // Initialize comment counts
                const initialCommentCounts: Record<number, number> = {}
                for (const item of groupItems) {
                  try {
                    const comments = await retrospectiveApi.getComments(item.id)
                    initialCommentCounts[item.id] = comments.length
                  } catch (error) {
                    console.error(`Error loading comments for item ${item.id}:`, error)
                    initialCommentCounts[item.id] = 0
                  }
                }
                setCommentCounts(initialCommentCounts)
              } catch (error) {
                console.error("Error fetching group items:", error)
                setError("Failed to load group items")
              }
            } else {
              setError("Retrospective not found")
            }
          } catch (apiError) {
            console.error("Error loading retrospective:", apiError)
            setError("Failed to load retrospective data")
          }
        } else {
          // If no ID is provided, initialize columns based on template
          initializeColumnsFromTemplate(templateType)
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push("/login?redirect=/retrospective")
      }
    }

    checkAuthAndLoadData()
  }, [router, retroId, templateType])

  // Update columns with group items
  const updateColumnsWithGroupItems = (columns: RetroColumn[], groupItems: GroupItem[]) => {
    const updatedColumns = columns.map((column) => {
      const columnItems = groupItems.filter((item) => item.groupId === column.groupId)
      return {
        ...column,
        items: columnItems,
      }
    })

    setColumns(updatedColumns)

    // Initialize vote counts if not already loaded from localStorage
    const storedVoteCounts = localStorage.getItem(`retro_${retroId}_vote_counts`)
    if (!storedVoteCounts) {
      const initialVoteCounts: Record<number, number> = {}
      groupItems.forEach(async (item) => {
        try {
          // Get actual vote count from API
          const voteResponse = await retrospectiveApi.getVotesForGroupItem(item.id)
          initialVoteCounts[item.id] = voteResponse.count
        } catch (error) {
          console.error(`Error getting votes for item ${item.id}:`, error)
          initialVoteCounts[item.id] = 0
        }
      })
      setVoteCounts(initialVoteCounts)
    }
  }

  // Initialize columns based on template
  const initializeColumnsFromTemplate = (template: string) => {
    let initialColumns: RetroColumn[] = []

    if (template === "glad-sad-mad") {
      initialColumns = [
        {
          id: "glad",
          groupId: 1,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 2,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 3,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue") {
      initialColumns = [
        {
          id: "start",
          groupId: 1,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 2, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 3,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue-change") {
      initialColumns = [
        {
          id: "start",
          groupId: 1,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 2, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 3,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
        { id: "change", groupId: 4, title: "Change", emoji: "🔧", description: "Things we should change", items: [] },
      ]
    } else if (template === "keep-stop-less-more-start") {
      initialColumns = [
        { id: "keep", groupId: 1, title: "Keep Doing", emoji: "✔️", description: "Things that work well", items: [] },
        { id: "stop", groupId: 2, title: "Stop Doing", emoji: "⛔️", description: "Things that don't work", items: [] },
        { id: "less", groupId: 3, title: "Less Of", emoji: "➖", description: "Things to reduce", items: [] },
        { id: "more", groupId: 4, title: "More Of", emoji: "➕", description: "Things to increase", items: [] },
        { id: "start", groupId: 5, title: "Start Doing", emoji: "✅", description: "New things to try", items: [] },
      ]
    } else {
      // Default to glad-sad-mad if template is not recognized
      initialColumns = [
        {
          id: "glad",
          groupId: 1,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 2,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 3,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    }

    setColumns(initialColumns)
  }

  // Map API groups to UI columns
  const mapGroupsToColumns = (groups: Group[], template: string): RetroColumn[] => {
    // First initialize the columns based on the template
    const initialColumns = getInitialColumnsForTemplate(template)

    // Then map the groups to the columns
    return initialColumns.map((column, index) => {
      // Find the matching group or use the group at the same index
      const matchingGroup =
        groups.find((g) => g.name.toLowerCase().includes(column.id.toLowerCase())) ||
        (groups.length > index ? groups[index] : null)

      if (matchingGroup) {
        return {
          ...column,
          groupId: matchingGroup.id,
          items: matchingGroup.groupItems || [],
        }
      }

      return column
    })
  }

  // Get initial columns structure based on template
  const getInitialColumnsForTemplate = (template: string): RetroColumn[] => {
    if (template === "glad-sad-mad") {
      return [
        {
          id: "glad",
          groupId: 0,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 0,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 0,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue") {
      return [
        {
          id: "start",
          groupId: 0,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 0, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 0,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue-change") {
      return [
        {
          id: "start",
          groupId: 0,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 0, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 0,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
        { id: "change", groupId: 0, title: "Change", emoji: "🔧", description: "Things we should change", items: [] },
      ]
    } else if (template === "keep-stop-less-more-start") {
      return [
        { id: "keep", groupId: 0, title: "Keep Doing", emoji: "✔️", description: "Things that work well", items: [] },
        { id: "stop", groupId: 0, title: "Stop Doing", emoji: "⛔️", description: "Things that don't work", items: [] },
        { id: "less", groupId: 0, title: "Less Of", emoji: "➖", description: "Things to reduce", items: [] },
        { id: "more", groupId: 0, title: "More Of", emoji: "➕", description: "Things to increase", items: [] },
        { id: "start", groupId: 0, title: "Start Doing", emoji: "✅", description: "New things to try", items: [] },
      ]
    } else {
      // Default to glad-sad-mad if template is not recognized
      return [
        {
          id: "glad",
          groupId: 0,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 0,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 0,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    }
  }

  const handleAddItem = async (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column || !newItems[columnId]?.trim()) return

    setIsSaving(column.groupId)

    try {
      // Create a new group item via API
      const createItemRequest: CreateGroupItemRequest = {
        groupId: column.groupId,
        content: newItems[columnId],
        isHidden: false,
      }

      const newItem = await retrospectiveApi.createGroupItem(createItemRequest)

      // Update the columns state with the new item
      setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, items: [...col.items, newItem] } : col)))

      // Initialize vote count for the new item
      setVoteCounts((prev) => ({
        ...prev,
        [newItem.id]: 0,
      }))

      // Initialize comment count for the new item
      setCommentCounts((prev) => ({
        ...prev,
        [newItem.id]: 0,
      }))

      // Clear the input
      setNewItems((prev) => ({ ...prev, [columnId]: "" }))
    } catch (error) {
      console.error("Error adding item:", error)
      setError("Failed to add item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleStartEditing = (item: GroupItem) => {
    setEditingItemId(item.id)
    setEditingContent(item.content)
  }

  const handleCancelEditing = () => {
    setEditingItemId(null)
    setEditingContent("")
  }

  const handleSaveEditing = async () => {
    if (!editingItemId || !editingContent.trim()) {
      handleCancelEditing()
      return
    }

    setIsSaving(editingItemId)

    try {
      // Update the group item via API
      const updateItemRequest: UpdateGroupItemRequest = {
        content: editingContent,
      }

      await retrospectiveApi.updateGroupItem(editingItemId, updateItemRequest)

      // Update the columns state with the updated item
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.map((item) => (item.id === editingItemId ? { ...item, content: editingContent } : item)),
        })),
      )

      // Clear editing state
      setEditingItemId(null)
      setEditingContent("")
    } catch (error) {
      console.error("Error updating item:", error)
      setError("Failed to update item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleMoveItem = async (itemId: number, sourceColumnId: string, targetColumnId: string) => {
    const sourceColumn = columns.find((col) => col.id === sourceColumnId)
    const targetColumn = columns.find((col) => col.id === targetColumnId)

    if (!sourceColumn || !targetColumn) return

    const item = sourceColumn.items.find((i) => i.id === itemId)
    if (!item) return

    setIsSaving(itemId)

    try {
      // Move the group item via API
      const moveItemRequest: MoveGroupItemRequest = {
        newGroupId: targetColumn.groupId,
        orderPosition: targetColumn.items.length, // Add to the end of the target column
      }

      await retrospectiveApi.moveGroupItem(itemId, moveItemRequest)

      // Update the columns state by removing the item from the source column and adding it to the target column
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === sourceColumnId) {
            return {
              ...col,
              items: col.items.filter((i) => i.id !== itemId),
            }
          } else if (col.id === targetColumnId) {
            return {
              ...col,
              items: [...col.items, { ...item, groupId: targetColumn.groupId }],
            }
          }
          return col
        }),
      )
    } catch (error) {
      console.error("Error moving item:", error)
      setError("Failed to move item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleVote = async (columnId: string, itemId: number) => {
    // Check if user has remaining votes
    if (remainingVotes <= 0) {
      setShowVoteLimitAlert(true)
      setTimeout(() => setShowVoteLimitAlert(false), 3000)
      return
    }

    setIsVoting(itemId)

    try {
      // Call the API to vote for the item
      const response = await retrospectiveApi.voteForGroupItem(itemId)

      // Update the vote count
      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: response.count,
      }))

      // Decrease remaining votes
      setRemainingVotes((prev) => prev - 1)
    } catch (error) {
      console.error("Error voting for item:", error)
      setError("Failed to vote for item. Please try again.")
    } finally {
      setIsVoting(null)
    }
  }

  const toggleComments = async (itemId: number) => {
    // Toggle the comments visibility
    setShowComments((prev) => {
      const newState = { ...prev, [itemId]: !prev[itemId] }

      // If we're showing comments and haven't loaded them yet, load them
      if (newState[itemId] && !comments[itemId]) {
        loadComments(itemId)
      }

      return newState
    })
  }

  const loadComments = async (itemId: number) => {
    try {
      const itemComments = await retrospectiveApi.getComments(itemId)
      setComments((prev) => ({
        ...prev,
        [itemId]: itemComments,
      }))

      // Update comment count
      setCommentCounts((prev) => ({
        ...prev,
        [itemId]: itemComments.length,
      }))
    } catch (error) {
      console.error("Error loading comments:", error)
      setError("Failed to load comments. Please try again.")
    }
  }

  const handleAddComment = async (columnId: string, itemId: number) => {
    if (!newComments[itemId]?.trim()) return

    setIsAddingComment(itemId)

    try {
      // Create a new comment via API
      const createCommentRequest: CreateCommentRequest = {
        groupItemId: itemId,
        content: newComments[itemId],
        isAnonymous: false,
      }

      const newComment = await retrospectiveApi.createComment(createCommentRequest)

      // Update the comments state with the new comment
      const updatedComments = [...(comments[itemId] || []), newComment]
      setComments((prev) => ({
        ...prev,
        [itemId]: updatedComments,
      }))

      // Update comment count
      setCommentCounts((prev) => ({
        ...prev,
        [itemId]: updatedComments.length,
      }))

      // Clear the input
      setNewComments((prev) => ({ ...prev, [itemId]: "" }))
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Failed to add comment. Please try again.")
    } finally {
      setIsAddingComment(null)
    }
  }

  const handleDeleteItem = async (columnId: string, itemId: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    setIsSaving(itemId)

    try {
      // Delete the item via API
      await retrospectiveApi.deleteGroupItem(itemId)

      // Update the columns state
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, items: col.items.filter((item) => item.id !== itemId) } : col,
        ),
      )

      // Remove the vote count for this item
      setVoteCounts((prev) => {
        const newCounts = { ...prev }
        delete newCounts[itemId]
        return newCounts
      })

      // Remove the comment count for this item
      setCommentCounts((prev) => {
        const newCounts = { ...prev }
        delete newCounts[itemId]
        return newCounts
      })

      // Remove any comments for this item
      setComments((prev) => {
        const newComments = { ...prev }
        delete newComments[itemId]
        return newComments
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      setError("Failed to delete item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleConvertToAction = async (itemId: number, status: number, priority: number, assignedUserId: string) => {
    setIsSaving(itemId)

    try {
      // Convert the item to an action via API
      await retrospectiveApi.convertToAction(itemId, {
        status,
        priority,
        assignedUserId,
      })

      // You might want to update the UI to reflect that this item is now an action item
      // This depends on how you want to handle action items in your UI
    } catch (error) {
      console.error("Error converting item to action:", error)
      setError("Failed to convert item to action. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleFinishRetro = async () => {
    setIsSaving(-1)

    try {
      // In a real implementation, you would call the API to mark the retrospective as completed
      // For now, we'll just redirect to the dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error finishing retrospective:", error)
      setError("Failed to finish retrospective. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  // Function to determine if an item should be blurred based on the current step
  const shouldBlurItem = (item: GroupItem) => {
    // In step 1 (reflect), blur all items that don't belong to the current user
    return currentStep === 1 && item.userId !== user?.id
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
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
              <div className="text-sm text-gray-600 mr-2">
                <span className="font-medium">{remainingVotes}</span> votes remaining
              </div>

              <TimerDialog open={false} onOpenChange={() => {}} />

              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4" />
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

      <RetroSteps currentStep={currentStep} onStepChange={handleStepChange} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
            {error}
            <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {showVoteLimitAlert && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-700">
              You've used all your votes! Each participant has a maximum of 6 votes.
            </AlertDescription>
          </Alert>
        )}

        <div
          className={`grid grid-cols-1 gap-6 ${
            columns.length <= 3
              ? "md:grid-cols-3"
              : columns.length === 4
                ? "md:grid-cols-2 lg:grid-cols-4"
                : "md:grid-cols-3 lg:grid-cols-5"
          }`}
        >
          {columns.map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    <span className="mr-2">{column.emoji}</span>
                    {column.title}
                  </h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{column.description}</p>
              </div>

              <div className="p-4 space-y-4">
                {column.items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-md shadow-sm ${shouldBlurItem(item) ? "blur-sm" : ""}`}
                  >
                    <div className="p-3 relative">
                      {editingItemId === item.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={handleCancelEditing}>
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 bg-purple-600 hover:bg-purple-700"
                              onClick={handleSaveEditing}
                              disabled={isSaving === item.id}
                            >
                              {isSaving === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">{item.content}</div>
                      )}

                      {item.userId === user?.id && currentStep === 1 && (
                        <div className="absolute top-1 right-1">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                            Your card
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{user?.name || "Anonymous"}</span>
                        <div className="flex items-center gap-2">
                          {currentStep >= 2 && editingItemId !== item.id && (
                            <button
                              className="flex items-center gap-1 hover:text-purple-600"
                              onClick={() => handleStartEditing(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}

                          {currentStep >= 3 && (
                            <button
                              className="flex items-center gap-1 hover:text-purple-600"
                              onClick={() => toggleComments(item.id)}
                            >
                              <MessageSquare className="h-3 w-3" />
                              {commentCounts[item.id] > 0 && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                                  {commentCounts[item.id]}
                                </span>
                              )}
                            </button>
                          )}

                          {currentStep >= 3 && (
                            <button
                              className="flex items-center gap-1 hover:text-purple-600"
                              onClick={() => handleVote(column.id, item.id)}
                              disabled={isVoting === item.id || remainingVotes <= 0}
                            >
                              {isVoting === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3 w-3" />
                              )}
                              {voteCounts[item.id] > 0 && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                                  {voteCounts[item.id]}
                                </span>
                              )}
                            </button>
                          )}

                          <button
                            className="flex items-center gap-1 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(column.id, item.id)}
                            disabled={isSaving === item.id}
                          >
                            {isSaving === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {showComments[item.id] && currentStep >= 3 && (
                      <div className="border-t px-3 py-2 bg-gray-50">
                        {comments[item.id]?.length > 0 ? (
                          <div className="space-y-2 mb-2">
                            {comments[item.id].map((comment) => (
                              <div key={comment.id} className="text-xs">
                                <div className="font-medium">{comment.isAnonymous ? "Anonymous" : user?.name}</div>
                                <div>{comment.content}</div>
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
                            disabled={isAddingComment === item.id}
                          >
                            {isAddingComment === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <PlusCircle className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {currentStep === 1 && (
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
                    <Button
                      className="px-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleAddItem(column.id)}
                      disabled={isSaving === column.groupId}
                    >
                      {isSaving === column.groupId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowActionItems(!showActionItems)}
            className={currentStep < 4 ? "invisible" : ""}
          >
            {showActionItems ? "Hide Action Items" : "Show Action Items"}
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 4))}
              >
                Next Step
              </Button>
            ) : (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleFinishRetro}
                disabled={isSaving === -1}
              >
                {isSaving === -1 ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  "Finish Retrospective"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} retrospectiveId={retroId} />

      <ActionItemsPanel
        isOpen={showActionItems && currentStep === 4}
        onToggle={() => setShowActionItems(!showActionItems)}
      />
    </div>
  )
}
