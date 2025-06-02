"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  ThumbsUp,
  MoreHorizontal,
  Loader2,
  Trash2,
  Edit,
  Check,
  X,
  MoveRight,
  PlusCircle,
  EyeOff,
} from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { GroupItem, Comment } from "@/lib/api-service"

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

export function RetroItem({
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
  const isEditing = editingItemId === item.id
  const isCommenting = showComments[item.id]

  // Disable dragging when editing or commenting
  const isDragDisabled = isEditing || isCommenting || (currentStep === 1 && item.userId !== user?.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${columnId}:${item.id}`,
    disabled: isDragDisabled,
    data: {
      type: "item",
      item,
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const creatorName = item.userId ? getUserName(item.userId) : "Anonymous"
  const isBlurred = shouldBlurItem(item)

  // Handle key events to prevent space from triggering drag
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " && (isEditing || isCommenting)) {
      e.stopPropagation()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-md shadow-sm relative ${
        isDragDisabled ? "" : isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onKeyDown={handleKeyDown}
      {...(!isDragDisabled ? attributes : {})}
      {...(!isDragDisabled ? listeners : {})}
    >
      {/* Blur overlay for other users' cards on step 1 */}
      {isBlurred && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-md z-10 flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500">
            <EyeOff className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Hidden</span>
          </div>
        </div>
      )}

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
              onKeyDown={(e) => {
                e.stopPropagation() // Prevent drag events
                if (e.key === "Enter") {
                  onSaveEditing()
                } else if (e.key === "Escape") {
                  onCancelEditing()
                }
              }}
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
                disabled={isVoting === item.id}
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
                e.stopPropagation() // Prevent drag events
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
