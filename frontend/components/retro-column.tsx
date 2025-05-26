"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlusCircle, MoreHorizontal, Loader2 } from "lucide-react"
import { SortableContext } from "@dnd-kit/sortable"
import { RetroItem } from "./retro-item"
import type { RetroColumn as RetroColumnType } from "@/hooks/use-retrospective"
import type { GroupItem } from "@/lib/api-service"

interface RetroColumnProps {
  column: RetroColumnType
  currentStep: number
  newItems: Record<string, string>
  setNewItems: (fn: (prev: Record<string, string>) => Record<string, string>) => void
  onAddItem: (columnId: string) => void
  isSaving: number | null
  // Item handlers
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
  // State props
  editingItemId: number | null
  editingContent: string
  setEditingContent: (content: string) => void
  isVoting: number | null
  isRemovingVotes: number | null
  isAddingComment: number | null
  showComments: Record<number, boolean>
  comments: Record<number, any[]>
  commentCounts: Record<number, number>
  voteCounts: Record<number, number>
  newComments: Record<number, string>
  setNewComments: (fn: (prev: Record<number, string>) => Record<number, string>) => void
  shouldBlurItem: (item: GroupItem) => boolean
  user: any
  getUserName: (userId: string) => string
  isCreator: boolean
}

export function RetroColumn({
  column,
  currentStep,
  newItems,
  setNewItems,
  onAddItem,
  isSaving,
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
  editingItemId,
  editingContent,
  setEditingContent,
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
}: RetroColumnProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto" id={column.id}>
        <SortableContext items={column.items.map((item) => `${column.id}:${item.id}`)}>
          {column.items.map((item) => (
            <RetroItem
              key={item.id}
              item={item}
              columnId={column.id}
              onVote={onVote}
              onAddComment={onAddComment}
              onStartEditing={onStartEditing}
              onCancelEditing={onCancelEditing}
              onSaveEditing={onSaveEditing}
              onDeleteItem={onDeleteItem}
              onOpenConvertDialog={onOpenConvertDialog}
              onToggleComments={onToggleComments}
              onRemoveMyVotes={onRemoveMyVotes}
              onRemoveAllVotes={onRemoveAllVotes}
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
              isCreator={isCreator}
            />
          ))}
        </SortableContext>
      </div>

      {/* Moved add item section to bottom */}
      {currentStep === 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              placeholder="Add an item..."
              value={newItems[column.id] || ""}
              onChange={(e) => setNewItems((prev) => ({ ...prev, [column.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onAddItem(column.id)
                }
              }}
            />
            <Button
              className="px-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => onAddItem(column.id)}
              disabled={isSaving === column.groupId}
            >
              {isSaving === column.groupId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
