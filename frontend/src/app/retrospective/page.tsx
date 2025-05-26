"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { retrospectiveApi, type GroupItem, type MoveGroupItemRequest } from "@/lib/api-service"

// Import custom hooks
import { useRetrospective } from "@/hooks/use-retrospective"
import { useRetroItems } from "@/hooks/use-retro-items"
import { useRetroVoting } from "@/hooks/use-retro-voting"
import { useRetroComments } from "@/hooks/use-retro-comments"
import { ActionItemsTable } from "@/components/action-items-table"
import { useActionItems } from "@/hooks/use-action-items"

// Import components
import { RetroHeader } from "@/components/retro-header"
import { RetroColumn } from "@/components/retro-column"
import { ConvertDialog } from "@/components/convert-dialog"
import { ShareDialog } from "@/components/share-dialog"
import { RetroSteps } from "@/components/retro-steps"
import { TimerDialog } from "@/components/timer-dialog"

export default function RetrospectivePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const retroId = searchParams.get("id") || ""
  const retroName = searchParams.get("name") || "Untitled Retrospective"
  const templateType = searchParams.get("template") || "glad-sad-mad"

  // Use custom hooks
  const { isLoading, retrospective, columns, setColumns, error, setError, user, userMap } = useRetrospective(
    retroId,
    templateType,
  )

  const {
    isSaving,
    newItems,
    setNewItems,
    editingItemId,
    editingContent,
    setEditingContent,
    handleAddItem,
    handleStartEditing,
    handleCancelEditing,
    handleSaveEditing,
    handleMoveItem,
    handleDeleteItem,
    handleConvertToAction,
  } = useRetroItems(retroId, columns, setColumns, setError, user)

  const {
    isVoting,
    isRemovingVotes,
    voteCounts,
    setVoteCounts,
    remainingVotes,
    showVoteLimitAlert,
    handleVote,
    handleRemoveMyVotes,
    handleRemoveAllVotes,
    initializeVoteCounts,
  } = useRetroVoting(retroId, 1, user)
  

  const {
    isAddingComment,
    showComments,
    newComments,
    setNewComments,
    comments,
    commentCounts,
    setCommentCounts,
    toggleComments,
    handleAddComment,
    initializeCommentCounts,
  } = useRetroComments(retroId)

  const { actionItems, loadActionItems, createFromGroupItem } = useActionItems(retroId)

  // Local state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showActionItems, setShowActionItems] = useState(false)
  const [convertingItemId, setConvertingItemId] = useState<number | null>(null)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [timerDialogOpen, setTimerDialogOpen] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerEndTime, setTimerEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<GroupItem | null>(null)

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
          alert("Timer has ended!")
        } else {
          setTimeRemaining(diff)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timerRunning, timerEndTime])

  // Initialize data when columns change
  useEffect(() => {
    if (columns.length > 0) {
      const allItems = columns.flatMap((col) => col.items)
      if (allItems.length > 0) {
        initializeVoteCounts(allItems)
        initializeCommentCounts(allItems)
      }
    }
  }, [columns])

  // Timer functions
  const startTimer = (minutes: number) => {
    const endTime = new Date()
    endTime.setMinutes(endTime.getMinutes() + minutes)
    setTimerEndTime(endTime)
    setTimerRunning(true)
    setTimerDialogOpen(false)
  }

  const stopTimer = () => {
    setTimerRunning(false)
    setTimerEndTime(null)
  }

  // Convert dialog functions
  const handleOpenConvertDialog = (itemId: number) => {
    setConvertingItemId(itemId)

    // Find the item to convert and pre-fill the title
    for (const column of columns) {
      const item = column.items.find((item) => item.id === itemId)
      if (item) {
        setEditingContent(item.content)
        break
      }
    }

    setConvertDialogOpen(true)
  }

  const handleCloseConvertDialog = () => {
    setConvertingItemId(null)
    setConvertDialogOpen(false)
  }

  const handleConvertItem = async (convertData: {
    status: number
    priority: number
    assignedUserId: string
    details?: string
    description?: string
  }) => {
    if (!convertingItemId) return false

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

      // Create action item using the hook
      const success = await handleConvertToAction(
        itemToConvert.id,
        convertData.description || itemToConvert.content,
        convertData.priority,
        convertData.status,
        convertData.details,
        convertData.assignedUserId,
      )

      if (!success) {
        throw new Error("Failed to convert item to action")
      }

      // Remove the item from the board
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.filter((item) => item.id !== convertingItemId),
        })),
      )

      return true
    } catch (error) {
      console.error("Error converting item to action:", error)
      setError("Failed to convert item to action. Please try again.")
      return false
    }
  }

  // Voting functions with error handling
  const handleVoteWithError = async (columnId: string, itemId: number) => {
    try {
      await handleVote(columnId, itemId)
    } catch (error) {
      setError("Failed to vote for item. Please try again.")
    }
  }

  const handleRemoveMyVotesWithError = async (itemId: number) => {
    if (!user?.id) return
    try {
      await handleRemoveMyVotes(itemId, user.id)
    } catch (error) {
      setError("Failed to remove votes. Please try again.")
    }
  }

  const handleRemoveAllVotesWithError = async (itemId: number) => {
    if (!retrospective || retrospective.creatorUserId !== user?.id) {
      setError("Only the board owner can remove all votes")
      return
    }
    try {
      await handleRemoveAllVotes(itemId)
    } catch (error) {
      setError("Failed to remove all votes. Please try again.")
    }
  }

  // Comment functions with error handling
  const handleAddCommentWithError = async (columnId: string, itemId: number) => {
    try {
      await handleAddComment(columnId, itemId)
    } catch (error) {
      setError("Failed to add comment. Please try again.")
    }
  }

  // Helper functions - Fixed blur logic
  const shouldBlurItem = (item: GroupItem) => {
    // Debug logging
    console.log({
      currentStep,
      itemUserId: item.userId,
      userId: user?.id,
      userExists: !!user,
      itemUserIdExists: !!item.userId,
      shouldBlur: currentStep === 1 && !!user?.id && !!item.userId && item.userId !== user.id,
    })

    // Only blur on step 1, when both user and item have userIds, and they don't match
    return currentStep === 1 && !!user?.id && !!item.userId && item.userId !== user.id
  }

  const getUserName = (userId: string) => {
    return userMap[userId] || "User"
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleFinishRetro = async () => {
    try {
      // Оновити статус ретроспективи на неактивний
      if (retrospective) {
        await retrospectiveApi.updateRetrospective(retrospective.id, { isActive: false })
      }
      router.push("/dashboard")
    } catch (error) {
      console.error("Error finishing retrospective:", error)
      setError("Failed to finish retrospective. Please try again.")
    }
  }

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const [columnId, itemId] = active.id.toString().split(":")

    setActiveId(active.id.toString())

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
        const activeColumn = prev.find((col) => col.id === activeColumnId)
        const overColumn = prev.find((col) => col.id === overColumnId)

        if (!activeColumn || !overColumn) return prev

        const activeItem = activeColumn.items.find((item) => item.id.toString() === activeItemId)
        if (!activeItem) return prev

        return prev.map((col) => {
          if (col.id === activeColumnId) {
            return {
              ...col,
              items: col.items.filter((item) => item.id.toString() !== activeItemId),
            }
          }

          if (col.id === overColumnId) {
            if (overItemId) {
              const overItemIndex = col.items.findIndex((item) => item.id.toString() === overItemId)
              const newItems = [...col.items]
              newItems.splice(overItemIndex, 0, { ...activeItem, groupId: col.groupId })
              return {
                ...col,
                items: newItems,
              }
            }

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
        const moveItemRequest: MoveGroupItemRequest = {
          newGroupId: targetColumn.groupId,
          orderPosition: overItemId
            ? targetColumn.items.findIndex((item) => item.id.toString() === overItemId)
            : targetColumn.items.length,
        }

        await retrospectiveApi.moveGroupItem(retroId, itemId, moveItemRequest)
      } catch (error) {
        console.error("Error moving item:", error)
        setError("Failed to move item. Please try again.")

        // Revert the UI change if the API call fails
        setColumns((prev) => {
          const targetColumn = prev.find((col) => col.id === overColumnId)
          const sourceColumn = prev.find((col) => col.id === activeColumnId)

          if (!targetColumn || !sourceColumn) return prev

          const movedItem = targetColumn.items.find((item) => item.id.toString() === activeItemId)
          if (!movedItem) return prev

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
      <RetroHeader
        retroName={retroName}
        remainingVotes={remainingVotes}
        timerRunning={timerRunning}
        timeRemaining={timeRemaining}
        user={user}
        onShareClick={() => setShareDialogOpen(true)}
        onTimerClick={() => setTimerDialogOpen(true)}
        currentStep={currentStep} 
        onStepChange={handleStepChange}
      />

      {/* <RetroSteps currentStep={currentStep} onStepChange={handleStepChange} /> */}

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
              <RetroColumn
                key={column.id}
                column={column}
                currentStep={currentStep}
                newItems={newItems}
                setNewItems={setNewItems}
                onAddItem={handleAddItem}
                isSaving={isSaving}
                onVote={handleVoteWithError}
                onAddComment={handleAddCommentWithError}
                onStartEditing={handleStartEditing}
                onCancelEditing={handleCancelEditing}
                onSaveEditing={handleSaveEditing}
                onDeleteItem={handleDeleteItem}
                onOpenConvertDialog={handleOpenConvertDialog}
                onToggleComments={toggleComments}
                onRemoveMyVotes={handleRemoveMyVotesWithError}
                onRemoveAllVotes={handleRemoveAllVotesWithError}
                editingItemId={editingItemId}
                editingContent={editingContent}
                setEditingContent={setEditingContent}
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
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleFinishRetro}>
                Finish Retrospective
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

      <ConvertDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onConvert={handleConvertItem}
        itemContent={editingContent}
        setItemContent={setEditingContent}
        isSaving={isSaving === convertingItemId}
        user={user}
      />

      <ActionItemsTable
        retrospectiveId={retroId}
        isVisible={showActionItems && currentStep === 4}
        user={user}
        onItemConverted={() => {
          setShowActionItems(true)
          loadActionItems()
        }}
      />
    </div>
  )
}
