"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  PlusCircle,
  Loader2,
  MoreHorizontal,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  MessageSquare,
  Send,
} from "lucide-react"
import {
  retrospectiveApi,
  type ActionItem,
  ActionItemPriority,
  ActionItemStatus,
  type CreateActionItemRequest,
  type ActionItemComment,
} from "@/lib/api-service"

interface ActionItemsTableProps {
  retrospectiveId: string
  isVisible: boolean
  user: any
  onItemConverted?: () => void
}

export function ActionItemsTable({ retrospectiveId, isVisible, user, onItemConverted }: ActionItemsTableProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<ActionItemComment[]>([])
  const [selectedActionItemId, setSelectedActionItemId] = useState<string | null>(null)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)

  const descriptionInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    priority: ActionItemPriority.Medium,
    status: ActionItemStatus.Pending,
  })

  // Load action items
  useEffect(() => {
    if (isVisible && retrospectiveId) {
      loadActionItems()
    }
  }, [isVisible, retrospectiveId])

  const loadActionItems = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await retrospectiveApi.getActionItems(retrospectiveId)
      // Sort items: completed items at the end
      const sortedItems = items.sort((a, b) => {
        if (a.status === ActionItemStatus.Completed && b.status !== ActionItemStatus.Completed) return 1
        if (a.status !== ActionItemStatus.Completed && b.status === ActionItemStatus.Completed) return -1
        return b.priority - a.priority // Higher priority first
      })
      setActionItems(sortedItems)
    } catch (error) {
      console.error("Error loading action items:", error)
      setError("Failed to load action items")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateItem = async () => {
    if (!formData.description.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const newItem: CreateActionItemRequest = {
        retrospectiveId,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedUserId: user?.id,
      }

      const createdItem = await retrospectiveApi.createActionItem(newItem)
      setActionItems([...actionItems, createdItem])
      resetForm()
      setShowAddDialog(false)
      onItemConverted?.()
    } catch (error) {
      console.error("Error creating action item:", error)
      setError("Failed to create action item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateItem = async (actionId: string, updates: Partial<ActionItem>) => {
    try {
      await retrospectiveApi.updateActionItem(actionId, updates)

      setActionItems((items) => {
        const updatedItems = items.map((item) => (item.actionId === actionId ? { ...item, ...updates } : item))

        // Re-sort: completed items at the end
        return updatedItems.sort((a, b) => {
          if (a.status === ActionItemStatus.Completed && b.status !== ActionItemStatus.Completed) return 1
          if (a.status !== ActionItemStatus.Completed && b.status === ActionItemStatus.Completed) return -1
          return b.priority - a.priority
        })
      })
    } catch (error) {
      console.error("Error updating action item:", error)
      setError("Failed to update action item")
    }
  }

  const handleDeleteItem = async (actionId: string) => {
    if (!window.confirm("Are you sure you want to delete this action item?")) return

    try {
      await retrospectiveApi.deleteActionItem(actionId)
      setActionItems((items) => items.filter((item) => item.actionId !== actionId))
    } catch (error) {
      console.error("Error deleting action item:", error)
      setError("Failed to delete action item")
    }
  }

  const resetForm = () => {
    setFormData({
      description: "",
      priority: ActionItemPriority.Medium,
      status: ActionItemStatus.Pending,
    })
    setEditingItem(null)
  }

  const getPriorityBadge = (priority: ActionItemPriority) => {
    const configs = {
      [ActionItemPriority.Critical]: { label: "Critical", className: "bg-red-100 text-red-800 border-red-200" },
      [ActionItemPriority.High]: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
      [ActionItemPriority.Medium]: { label: "Medium", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      [ActionItemPriority.Low]: { label: "Low", className: "bg-green-100 text-green-800 border-green-200" },
      [ActionItemPriority.VeryLow]: { label: "Very Low", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }

    const config = configs[priority]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: ActionItemStatus) => {
    const configs = {
      [ActionItemStatus.Pending]: { label: "Pending", icon: AlertCircle, className: "text-gray-500 border-gray-300" },
      [ActionItemStatus.InProgress]: { label: "In Progress", icon: Clock, className: "text-blue-500 border-blue-300" },
      [ActionItemStatus.Completed]: {
        label: "Completed",
        icon: CheckCircle2,
        className: "text-green-500 border-green-300",
      },
      [ActionItemStatus.WontDo]: { label: "Won't Do", icon: XCircle, className: "text-red-500 border-red-300" },
      [ActionItemStatus.Archived]: { label: "Archived", icon: Archive, className: "text-gray-400 border-gray-200" },
    }

    const config = configs[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const handleDescriptionDoubleClick = (item: ActionItem) => {
    setIsEditingDescription(true)
    setEditedDescription(item.description)
    setEditingItem(item)
    setTimeout(() => {
      descriptionInputRef.current?.focus()
    }, 0)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDescription(e.target.value)
  }

  const handleDescriptionSave = async (actionId: string) => {
    if (!editedDescription.trim()) return

    setIsEditingDescription(false)
    setEditingItem(null)
    await handleUpdateItem(actionId, { description: editedDescription })
  }

  const handleDescriptionCancel = () => {
    setIsEditingDescription(false)
    setEditingItem(null)
  }

  const handleAddComment = async (actionItemId: string) => {
    if (!commentText.trim()) return

    try {
      const actionItem = actionItems.find((item) => item.actionId === actionItemId)
      if (!actionItem) return

      const newComment = await retrospectiveApi.createActionItemComment({
        actionItemId: actionItem.id,
        content: commentText,
      })
      setComments([...comments, newComment])
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("Failed to add comment")
    }
  }

  const loadComments = async (actionItemId: string) => {
    setLoadingComments(true)
    try {
      const actionItem = actionItems.find((item) => item.actionId === actionItemId)
      if (!actionItem) return

      const loadedComments = await retrospectiveApi.getActionItemComments(actionItem.id)
      setComments(loadedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
      setError("Failed to load comments")
    } finally {
      setLoadingComments(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Action Items</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Action Item</DialogTitle>
                <DialogDescription>Add a new action item to track follow-up tasks.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Title </Label>
                  <Input
                    id="description"
                    placeholder="Enter action item title"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, priority: Number.parseInt(value) as ActionItemPriority }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ActionItemPriority.Critical.toString()}>Critical</SelectItem>
                        <SelectItem value={ActionItemPriority.High.toString()}>High</SelectItem>
                        <SelectItem value={ActionItemPriority.Medium.toString()}>Medium</SelectItem>
                        <SelectItem value={ActionItemPriority.Low.toString()}>Low</SelectItem>
                        <SelectItem value={ActionItemPriority.VeryLow.toString()}>Very Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: Number.parseInt(value) as ActionItemStatus }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ActionItemStatus.Pending.toString()}>Pending</SelectItem>
                        <SelectItem value={ActionItemStatus.InProgress.toString()}>In Progress</SelectItem>
                        <SelectItem value={ActionItemStatus.Completed.toString()}>Completed</SelectItem>
                        <SelectItem value={ActionItemStatus.WontDo.toString()}>Won't Do</SelectItem>
                        <SelectItem value={ActionItemStatus.Archived.toString()}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setShowAddDialog(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateItem}
                  disabled={isSubmitting || !formData.description.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md text-red-500 text-sm">
              {error}
              <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
              {actionItems.map((item) => (
                <Card
                  key={item.actionId}
                  className={`${item.status === ActionItemStatus.Completed ? "opacity-70" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      {isEditingDescription && editingItem?.actionId === item.actionId ? (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            value={editedDescription}
                            onChange={handleDescriptionChange}
                            onBlur={() => handleDescriptionCancel()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleDescriptionSave(item.actionId)
                              } else if (e.key === "Escape") {
                                handleDescriptionCancel()
                              }
                            }}
                            ref={descriptionInputRef}
                            className="text-sm font-medium"
                          />
                          <Button
                            size="icon"
                            onClick={() => handleDescriptionSave(item.actionId)}
                            className="ml-2 h-6 w-6"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" onClick={() => handleDescriptionCancel()} className="ml-1 h-6 w-6">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <h3
                          className="font-medium text-sm line-clamp-2 cursor-pointer flex-1"
                          onDoubleClick={() => handleDescriptionDoubleClick(item)}
                        >
                          {item.description}
                        </h3>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedActionItemId(item.actionId === selectedActionItemId ? null : item.actionId)
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {selectedActionItemId === item.actionId ? "Hide Comments" : "Show Comments"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {/* Status submenu */}
                          <DropdownMenuItem className="font-medium">Status</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { status: ActionItemStatus.Pending })}
                            className={item.status === ActionItemStatus.Pending ? "bg-gray-100" : ""}
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { status: ActionItemStatus.InProgress })}
                            className={item.status === ActionItemStatus.InProgress ? "bg-gray-100" : ""}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { status: ActionItemStatus.Completed })}
                            className={item.status === ActionItemStatus.Completed ? "bg-gray-100" : ""}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { status: ActionItemStatus.WontDo })}
                            className={item.status === ActionItemStatus.WontDo ? "bg-gray-100" : ""}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Won't Do
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { status: ActionItemStatus.Archived })}
                            className={item.status === ActionItemStatus.Archived ? "bg-gray-100" : ""}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archived
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Priority submenu */}
                          <DropdownMenuItem className="font-medium">Priority</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { priority: ActionItemPriority.Critical })}
                            className={item.priority === ActionItemPriority.Critical ? "bg-gray-100" : ""}
                          >
                            Critical
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { priority: ActionItemPriority.High })}
                            className={item.priority === ActionItemPriority.High ? "bg-gray-100" : ""}
                          >
                            High
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { priority: ActionItemPriority.Medium })}
                            className={item.priority === ActionItemPriority.Medium ? "bg-gray-100" : ""}
                          >
                            Medium
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { priority: ActionItemPriority.Low })}
                            className={item.priority === ActionItemPriority.Low ? "bg-gray-100" : ""}
                          >
                            Low
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateItem(item.actionId, { priority: ActionItemPriority.VeryLow })}
                            className={item.priority === ActionItemPriority.VeryLow ? "bg-gray-100" : ""}
                          >
                            Very Low
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteItem(item.actionId)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selectedActionItemId && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Comments</h4>
              {loadingComments ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <>
                  {comments.length > 0 ? (
                    <ul className="space-y-2">
                      {comments.map((comment) => (
                        <li key={comment.id} className="bg-gray-50 p-2 rounded-md text-sm">
                          {comment.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                  )}
                  <div className="flex mt-2">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mr-2"
                    />
                    <Button
                      onClick={() => handleAddComment(selectedActionItemId)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
