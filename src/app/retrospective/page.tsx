"use client"

import { Label } from "@/components/ui/label"

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
  AlertTriangle,
  Clock,
  MoveRight,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
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
  type ConvertToActionRequest,
} from "@/lib/api-service"
import { ShareDialog } from "@/components/share-dialog"
import { RetroSteps } from "@/components/retro-steps"
import { TimerDialog } from "@/components/timer-dialog"
import { ActionItemsPanel } from "@/components/action-items-panel"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [isRemovingVotes, setIsRemovingVotes] = useState<number | null>(null)
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
  const [timerDialogOpen, setTimerDialogOpen] = useState(false)
  const [timerDuration, setTimerDuration] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerEndTime, setTimerEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [convertingItemId, setConvertingItemId] = useState<number | null>(null)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [convertPriority, setConvertPriority] = useState<string>("1") // Medium priority
  const [convertStatus, setConvertStatus] = useState<string>("0") // Not started
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<GroupItem | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [userMap, setUserMap] = useState<Record<string, string>>({}) // Map of user IDs to names

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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

  // Timer functionality
  useEffect(() => {
    if (timerRunning && timerEndTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const diff = timerEndTime.getTime() - now.getTime()

        if (diff <= 0) {
          setTimerRunning(false)
          setTimeRemaining(0)
          clearInterval(interval)
          // Show notification or alert that timer has ended
          alert("Timer has ended!")
        } else {
          setTimeRemaining(diff)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timerRunning, timerEndTime])

  const startTimer = (minutes: number) => {
    const endTime = new Date()
    endTime.setMinutes(endTime.getMinutes() + minutes)
    setTimerEndTime(endTime)
    setTimerRunning(true)
    setTimerDuration(minutes)
    setTimerDialogOpen(false)
  }

  const stopTimer = () => {
    setTimerRunning(false)
    setTimerEndTime(null)
  }

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "00:00"
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

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
              const commentResponse = await retrospectiveApi.getComments(item.id, retroId)
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

        // Initialize userMap with current user
        setUserMap((prev) => ({
          ...prev,
          [userData.id]: userData.name || "User",
        }))

        // If we have a retrospective ID, load it from the API
        if (retroId) {
          try {
            // In a real implementation, you would fetch the specific retrospective by ID
            // For now, we'll get all retrospectives and find the one with matching ID
            const retros = await retrospectiveApi.getAllRetrospectives()
            const foundRetro = retros.find((r) => r.retrospective.id === retroId)

            if (foundRetro) {
              setRetrospective(foundRetro.retrospective)

              // Add assigned users to userMap
              if (foundRetro.retrospective.assignedUsers) {
                const updatedUserMap = { ...userMap }
                foundRetro.retrospective.assignedUsers.forEach((user) => {
                  updatedUserMap[user.id] = user.userName
                })
                setUserMap(updatedUserMap)
              }

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
                    const comments = await retrospectiveApi.getComments(item.id, retroId)
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

      // Updated to use the new API endpoint with retrospectiveId
      const newItem = await retrospectiveApi.createGroupItem(retroId, createItemRequest)

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

      await retrospectiveApi.updateGroupItem(editingItemId, updateItemRequest, retroId)

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

      await retrospectiveApi.moveGroupItem(itemId, moveItemRequest, retroId)

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

  const handleRemoveMyVotes = async (itemId: number) => {
    if (!user?.id) return

    setIsRemovingVotes(itemId)

    try {
      // Call the API to remove all votes by this user for this item
      await retrospectiveApi.removeAllVotesForItem(itemId, user.id)

      // Get updated vote count
      const voteResponse = await retrospectiveApi.getVotesForGroupItem(itemId)

      // Update the vote count
      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: voteResponse.count,
      }))

      // Recalculate remaining votes
      // This is a simplified approach - in a real app, you'd need to track how many votes were removed
      const addedVotes = 1 // Assuming we're adding back 1 vote
      setRemainingVotes((prev) => prev + addedVotes)
    } catch (error) {
      console.error("Error removing votes:", error)
      setError("Failed to remove votes. Please try again.")
    } finally {
      setIsRemovingVotes(null)
    }
  }

  const handleRemoveAllVotes = async (itemId: number) => {
    if (!retrospective || retrospective.creatorUserId !== user?.id) {
      setError("Only the board owner can remove all votes")
      return
    }

    setIsRemovingVotes(itemId)

    try {
      // Get all votes for this item
      const votes = await retrospectiveApi.getAllVotesForGroupItem(itemId)

      // Delete each vote
      for (const vote of votes) {
        await retrospectiveApi.removeVote(vote.id)
      }

      // Update the vote count to zero
      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: 0,
      }))

      // No need to update remaining votes as this is an admin action
    } catch (error) {
      console.error("Error removing all votes:", error)
      setError("Failed to remove all votes. Please try again.")
    } finally {
      setIsRemovingVotes(null)
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
      const itemComments = await retrospectiveApi.getComments(itemId, retroId)
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

      const newComment = await retrospectiveApi.createComment(createCommentRequest, retroId)

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
      // Get all votes for this item before deleting
      const votes = await retrospectiveApi.getAllVotesForGroupItem(itemId)

      // Track users who voted and how many votes they had
      const userVotes: Record<string, number> = {}
      votes.forEach((vote) => {
        userVotes[vote.userId] = (userVotes[vote.userId] || 0) + 1
      })

      // Delete the item via API
      await retrospectiveApi.deleteGroupItem(itemId, retroId)

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

      // Return votes to the current user if they voted
      if (user?.id && userVotes[user.id]) {
        setRemainingVotes((prev) => prev + userVotes[user.id])
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      setError("Failed to delete item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleOpenConvertDialog = (itemId: number) => {
    setConvertingItemId(itemId)
    setConvertDialogOpen(true)
  }

  const handleCloseConvertDialog = () => {
    setConvertingItemId(null)
    setConvertDialogOpen(false)
    setConvertPriority("1") // Reset to medium priority
    setConvertStatus("0") // Reset to not started
  }

  const handleConvertToAction = async () => {
    if (!convertingItemId || !user?.id) {
      handleCloseConvertDialog()
      return
    }

    setIsSaving(convertingItemId)

    try {
      // Find the item to convert
      let itemToConvert: GroupItem | undefined
      let columnId = ""

      for (const column of columns) {
        const item = column.items.find((item) => item.id === convertingItemId)
        if (item) {
          itemToConvert = item
          columnId = column.id
          break
        }
      }

      if (!itemToConvert) {
        throw new Error("Item not found")
      }

      // Convert the item to an action via API
      const convertRequest: ConvertToActionRequest = {
        status: Number.parseInt(convertStatus),
        priority: Number.parseInt(convertPriority),
        assignedUserId: user.id,
      }

      await retrospectiveApi.convertToAction(convertingItemId, convertRequest, retroId)

      // Remove the item from the board
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.filter((item) => item.id !== convertingItemId),
        })),
      )

      // Show success message
      alert("Item successfully converted to action item!")

      // Open the action items panel to show the newly converted item
      setShowActionItems(true)

      // Close the dialog
      handleCloseConvertDialog()
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
    // But never blur the user's own cards
    return currentStep === 1 && item.userId !== user?.id && item.userId !== undefined
  }

  // Function to get user name from ID
  const getUserName = (userId: string) => {
    return userMap[userId] || "User"
  }

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const [columnId, itemId] = active.id.toString().split(":")

    setActiveId(active.id.toString())
    setActiveColumnId(columnId)

    // Find the item being dragged
    const column = columns.find((col) => col.id === columnId)
    if (column) {
      const item = column.items.find((item) => item.id.toString() === itemId)
      if (item) {
        setActiveItem(item)
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const [activeColumnId, activeItemId] = active.id.toString().split(":")
    const [overColumnId, overItemId] = over.id.toString().split(":")

    // If dragging over a different column
    if (activeColumnId !== overColumnId) {
      setColumns((prev) => {
        // Find the active and over columns
        const activeColumn = prev.find((col) => col.id === activeColumnId)
        const overColumn = prev.find((col) => col.id === overColumnId)

        if (!activeColumn || !overColumn) return prev

        // Find the active item
        const activeItem = activeColumn.items.find((item) => item.id.toString() === activeItemId)
        if (!activeItem) return prev

        // Create new columns array with the item moved
        return prev.map((col) => {
          // Remove from source column
          if (col.id === activeColumnId) {
            return {
              ...col,
              items: col.items.filter((item) => item.id.toString() !== activeItemId),
            }
          }

          // Add to target column
          if (col.id === overColumnId) {
            // If dropping on another item, insert at that position
            if (overItemId) {
              const overItemIndex = col.items.findIndex((item) => item.id.toString() === overItemId)
              const newItems = [...col.items]
              newItems.splice(overItemIndex, 0, { ...activeItem, groupId: col.groupId })
              return {
                ...col,
                items: newItems,
              }
            }

            // If dropping on the column itself, add to the end
            return {
              ...col,
              items: [...col.items, { ...activeItem, groupId: col.groupId }],
            }
          }

          return col
        })
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveItem(null)
    setActiveColumnId(null)

    if (!over) return

    const [activeColumnId, activeItemId] = active.id.toString().split(":")
    const [overColumnId, overItemId] = over.id.toString().split(":")

    // If dropped in a different column
    if (activeColumnId !== overColumnId) {
      const sourceColumn = columns.find((col) => col.id === activeColumnId)
      const targetColumn = columns.find((col) => col.id === overColumnId)

      if (!sourceColumn || !targetColumn) return

      const itemId = Number.parseInt(activeItemId)

      try {
        setIsSaving(itemId)

        // Call API to move the item
        const moveItemRequest: MoveGroupItemRequest = {
          newGroupId: targetColumn.groupId,
          orderPosition: overItemId
            ? targetColumn.items.findIndex((item) => item.id.toString() === overItemId)
            : targetColumn.items.length,
        }

        await retrospectiveApi.moveGroupItem(itemId, moveItemRequest, retroId)
      } catch (error) {
        console.error("Error moving item:", error)
        setError("Failed to move item. Please try again.")

        // Revert the UI change if the API call fails
        setColumns((prev) => {
          // Find the active item in the target column
          const targetColumn = prev.find((col) => col.id === overColumnId)
          const sourceColumn = prev.find((col) => col.id === activeColumnId)

          if (!targetColumn || !sourceColumn) return prev

          const movedItem = targetColumn.items.find((item) => item.id.toString() === activeItemId)
          if (!movedItem) return prev

          // Move the item back to its original column
          return prev.map((col) => {
            if (col.id === overColumnId) {
              return {
                ...col,
                items: col.items.filter((item) => item.id.toString() !== activeItemId),
              }
            }
            if (col.id === activeColumnId) {
              return {
                ...col,
                items: [...col.items, { ...movedItem, groupId: col.groupId }],
              }
            }
            return col
          })
        })
      } finally {
        setIsSaving(null)
      }
    }
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
              {timerRunning && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTimeRemaining()}</span>
                </div>
              )}

              <div className="text-sm text-gray-600 mr-2">
                <span className="font-medium">{remainingVotes}</span> votes remaining
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setTimerDialogOpen(true)}>
                      <Clock className="h-4 w-4" />
                      {timerRunning ? "Stop Timer" : "Start Timer"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set a timer for the current retrospective phase</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/logout">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <RetroSteps currentStep={currentStep} onStepChange={handleStepChange} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
            <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {showVoteLimitAlert && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              You've used all your votes! Each participant has a maximum of 6 votes.
            </AlertDescription>
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <span>Sort by votes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span>Sort by date</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span>Clear all items</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                </div>

                <div className="p-4 space-y-4" id={column.id}>
                  <SortableContext items={column.items.map((item) => `${column.id}:${item.id}`)}>
                    {column.items.map((item) => (
                      <RetroItem
                        key={item.id}
                        item={item}
                        columnId={column.id}
                        onVote={handleVote}
                        onAddComment={handleAddComment}
                        onStartEditing={handleStartEditing}
                        onCancelEditing={handleCancelEditing}
                        onSaveEditing={handleSaveEditing}
                        onDeleteItem={handleDeleteItem}
                        onOpenConvertDialog={handleOpenConvertDialog}
                        onToggleComments={toggleComments}
                        onRemoveMyVotes={handleRemoveMyVotes}
                        onRemoveAllVotes={handleRemoveAllVotes}
                        currentStep={currentStep}
                        editingItemId={editingItemId}
                        editingContent={editingContent}
                        setEditingContent={setEditingContent}
                        isSaving={isSaving}
                        isVoting={isVoting}
                        isRemovingVotes={isRemovingVotes}
                        isAddingComment={isAddingComment}
                        showComments={showComments}
                        comments={comments}
                        commentCounts={commentCounts}
                        voteCounts={voteCounts}
                        newComments={newComments}
                        setNewComments={setNewComments}
                        shouldBlurItem={shouldBlurItem}
                        user={user}
                        getUserName={getUserName}
                        isCreator={retrospective?.creatorUserId === user?.id}
                      />
                    ))}
                  </SortableContext>

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

          {/* Drag overlay for the currently dragged item */}
          <DragOverlay>
            {activeId && activeItem && (
              <div className="bg-white border rounded-md shadow-sm p-3 w-full max-w-xs opacity-80">
                <div className="text-sm">{activeItem.content}</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

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

      <TimerDialog
        open={timerDialogOpen}
        onOpenChange={setTimerDialogOpen}
        onStartTimer={startTimer}
        onStopTimer={stopTimer}
        isTimerRunning={timerRunning}
      />

      <ActionItemsPanel
        isOpen={showActionItems && currentStep === 4}
        onToggle={() => setShowActionItems(!showActionItems)}
        retrospectiveId={retroId}
        onItemConverted={() => {
          // Refresh the action items panel when an item is converted
          setShowActionItems(true)
        }}
      />

      {/* Convert to Action Item Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Action Item</DialogTitle>
            <DialogDescription>
              Convert this card to an action item. Set the priority and initial status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select value={convertPriority} onValueChange={setConvertPriority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Low</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={convertStatus} onValueChange={setConvertStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Not Started</SelectItem>
                  <SelectItem value="1">In Progress</SelectItem>
                  <SelectItem value="2">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseConvertDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertToAction}
              disabled={isSaving === convertingItemId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving === convertingItemId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MoveRight className="mr-2 h-4 w-4" />
              )}
              Convert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// RetroItem component for individual cards
interface RetroItemProps {
  item: GroupItem
  columnId: string
  onVote: (columnId: string, itemId: number) => void
  onAddComment: (columnId: string, itemId: number) => void
  onStartEditing: (item: GroupItem) => void
  onCancelEditing: () => void
  onSaveEditing: () => void
  onDeleteItem: (columnId: string, itemId: number) => void
  onOpenConvertDialog: (itemId: number) => void
  onToggleComments: (itemId: number) => void
  onRemoveMyVotes: (itemId: number) => void
  onRemoveAllVotes: (itemId: number) => void
  currentStep: number
  editingItemId: number | null
  editingContent: string
  setEditingContent: (content: string) => void
  isSaving: number | null
  isVoting: number | null
  isRemovingVotes: number | null
  isAddingComment: number | null
  showComments: Record<number, boolean>
  comments: Record<number, Comment[]>
  commentCounts: Record<number, number>
  voteCounts: Record<number, number>
  newComments: Record<number, string>
  setNewComments: (fn: (prev: Record<number, string>) => Record<number, string>) => void
  shouldBlurItem: (item: GroupItem) => boolean
  user: any
  getUserName: (userId: string) => string
  isCreator: boolean
}

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function RetroItem({
  item,
  columnId,
  onVote,
  onAddComment,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onDeleteItem,
  onOpenConvertDialog,
  onToggleComments,
  onRemoveMyVotes,
  onRemoveAllVotes,
  currentStep,
  editingItemId,
  editingContent,
  setEditingContent,
  isSaving,
  isVoting,
  isRemovingVotes,
  isAddingComment,
  showComments,
  comments,
  commentCounts,
  voteCounts,
  newComments,
  setNewComments,
  shouldBlurItem,
  user,
  getUserName,
  isCreator,
}: RetroItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${columnId}:${item.id}`,
    disabled: currentStep === 1 && item.userId !== user?.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const creatorName = item.userId ? getUserName(item.userId) : "Anonymous"
  const isOwnCard = item.userId === user?.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border rounded-md shadow-sm ${shouldBlurItem(item) ? "blur-sm" : ""} ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="p-3 relative">
        {/* Card menu (three dots) in top right corner */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStartEditing(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>

              {currentStep >= 3 && voteCounts[item.id] > 0 && (
                <DropdownMenuItem onClick={() => onRemoveMyVotes(item.id)}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Remove my votes
                </DropdownMenuItem>
              )}

              {currentStep >= 3 && voteCounts[item.id] > 0 && isCreator && (
                <DropdownMenuItem onClick={() => onRemoveAllVotes(item.id)}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Remove all votes
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onOpenConvertDialog(item.id)}>
                <MoveRight className="h-4 w-4 mr-2" />
                Move to Action Items
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteItem(columnId, item.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {editingItemId === item.id ? (
          <div className="space-y-2">
            <Input
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-7 px-2" onClick={onCancelEditing}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 px-2 bg-purple-600 hover:bg-purple-700"
                onClick={onSaveEditing}
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
          <div className="text-sm pr-6">{item.content}</div>
        )}

        {item.userId === user?.id && currentStep === 1 && (
          <div className="absolute top-1 right-8">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Your card</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium">{creatorName}</span>
          <div className="flex items-center gap-2">
            {currentStep >= 3 && (
              <button
                className="flex items-center gap-1 hover:text-purple-600"
                onClick={() => onToggleComments(item.id)}
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
                onClick={() => onVote(columnId, item.id)}
                disabled={isVoting === item.id }
              >
                {isVoting === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
                {voteCounts[item.id] > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                    {voteCounts[item.id]}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showComments[item.id] && currentStep >= 3 && (
        <div className="border-t px-3 py-2 bg-gray-50">
          {comments[item.id]?.length > 0 ? (
            <div className="space-y-2 mb-2">
              {comments[item.id].map((comment) => (
                <div key={comment.id} className="text-xs">
                  <div className="font-medium">{comment.isAnonymous ? "Anonymous" : getUserName(comment.userId)}</div>
                  <div className="mt-0.5">{comment.content}</div>
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
                  onAddComment(columnId, item.id)
                }
              }}
            />
            <Button
              size="sm"
              className="h-7 px-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => onAddComment(columnId, item.id)}
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
  )
}
