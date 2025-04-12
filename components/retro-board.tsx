"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreVertical, Plus, MessageSquare, ThumbsUp, Trash2 } from "lucide-react"

interface RetroItem {
  id: string
  content: string
  votes: number
  comments: {
    id: string
    text: string
    author: string
  }[]
}

interface RetroColumn {
  id: string
  label: string
  emoji: string
  description: string
  color: string
}

interface RetroItemProps {
  item: RetroItem
  columnId: string
  onVote: (columnId: string, itemId: string) => void
  onAddComment: (columnId: string, itemId: string, comment: string) => void
  currentStep: number
}

const SortableRetroItem = ({ item, columnId, onVote, onAddComment, currentStep }: RetroItemProps) => {
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `${columnId}:${item.id}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    onAddComment(columnId, item.id, newComment)
    setNewComment("")
  }

  const handleVote = () => {
    setHasVoted(!hasVoted)
    onVote(columnId, item.id)
  }

  return (
    <Card ref={setNodeRef} style={style} className="mb-3 cursor-move" {...attributes} {...listeners}>
      <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
        <div className="text-sm">{item.content}</div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        {showComments && item.comments.length > 0 && (
          <div className="mt-2 space-y-2">
            {item.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-2 rounded-md text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{comment.author}</span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="h-4 w-4" />
            {item.comments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {item.comments.length}
              </span>
            )}
          </Button>

          {currentStep >= 3 && (
            <Button
              variant={hasVoted ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 ${hasVoted ? "bg-purple-600" : ""}`}
              onClick={handleVote}
            >
              {hasVoted ? <ThumbsUp className="h-4 w-4 text-white" /> : <ThumbsUp className="h-4 w-4" />}
              {item.votes > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.votes}
                </span>
              )}
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>

      {showComments && (
        <div className="px-3 pb-3 flex gap-2">
          <Input
            placeholder="Add a comment..."
            className="h-8 text-xs"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddComment()
              }
            }}
          />
          <Button size="sm" className="h-8 px-2 bg-purple-600 hover:bg-purple-700" onClick={handleAddComment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}

interface RetroBoardProps {
  columns: RetroColumn[]
  items: Record<string, RetroItem[]>
  onAddItem: (columnId: string, content: string) => void
  onVote: (columnId: string, itemId: string) => void
  onAddComment: (columnId: string, itemId: string, comment: string) => void
  currentStep: number
}

export function RetroBoard({ columns, items, onAddItem, onVote, onAddComment, currentStep }: RetroBoardProps) {
  const [newItems, setNewItems] = useState<Record<string, string>>({})

  const handleAddItem = (columnId: string) => {
    if (!newItems[columnId]?.trim()) return
    onAddItem(columnId, newItems[columnId])
    setNewItems((prev) => ({ ...prev, [columnId]: "" }))
  }

  const getColumnColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-50 border-green-200 text-green-700"
      case "red":
        return "bg-red-50 border-red-200 text-red-700"
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "yellow":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-700"
      case "orange":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "teal":
        return "bg-teal-50 border-teal-200 text-teal-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col h-full">
          <div className={`rounded-t-lg p-3 border ${getColumnColorClasses(column.color)}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-lg">{column.emoji}</span>
                <h3 className="font-medium">{column.label}</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs">{column.description}</p>
          </div>

          <div className="flex-1 border border-t-0 rounded-b-lg p-3 bg-gray-50 min-h-[300px]" id={column.id}>
            {items[column.id]?.map((item) => (
              <SortableRetroItem
                key={item.id}
                item={item}
                columnId={column.id}
                onVote={onVote}
                onAddComment={onAddComment}
                currentStep={currentStep}
              />
            ))}

            {currentStep === 1 && (
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an item..."
                    className="text-sm"
                    value={newItems[column.id] || ""}
                    onChange={(e) => setNewItems((prev) => ({ ...prev, [column.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(column.id)
                      }
                    }}
                  />
                  <Button
                    className={`px-2 ${getColumnColorClasses(column.color)}`}
                    variant="outline"
                    onClick={() => handleAddItem(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

