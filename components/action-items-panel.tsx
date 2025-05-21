"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowUpDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { retrospectiveApi } from "@/lib/api-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

interface ActionItem {
  id: string
  description: string
  details?: string
  status: number // 0 = Not started, 1 = In progress, 2 = Completed
  priority: number // 0 = Low, 1 = Medium, 2 = High
  assignedUserId?: string
  dueDate?: string
  sourceItemId?: number // Reference to the original group item
}

interface ActionItemsPanelProps {
  isOpen: boolean
  onToggle: () => void
  retrospectiveId: string
  onItemConverted?: () => void
}

export function ActionItemsPanel({ isOpen, onToggle, retrospectiveId, onItemConverted }: ActionItemsPanelProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [newItemContent, setNewItemContent] = useState("")
  const [newItemDetails, setNewItemDetails] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"priority" | "status">("priority")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null)
  const [newPriority, setNewPriority] = useState<string>("1") // Medium priority
  const [newStatus, setNewStatus] = useState<string>("0") // Not started

  // Load action items when the panel is opened
  useEffect(() => {
    if (isOpen && retrospectiveId) {
      loadActionItems()
    }
  }, [isOpen, retrospectiveId])

  // Update the loadActionItems function to use the new API endpoint
  const loadActionItems = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const items = await retrospectiveApi.getActionItems(retrospectiveId)
      console.log("Loaded action items:", items)
      setActionItems(items)
    } catch (error) {
      console.error("Error loading action items:", error)
      setError("Failed to load action items")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleAddItem function to use the new API endpoint
  const handleAddItem = async () => {
    if (!newItemContent.trim()) return

    setIsAdding(true)
    setError(null)

    try {
      const newItem = await retrospectiveApi.createActionItem({
        retrospectiveId,
        description: newItemContent,
        details: newItemDetails,
        status: Number.parseInt(newStatus),
        priority: Number.parseInt(newPriority),
      })

      setActionItems([...actionItems, newItem])
      setNewItemContent("")
      setNewItemDetails("")
      setNewPriority("1")
      setNewStatus("0")
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding action item:", error)
      setError("Failed to add action item")
    } finally {
      setIsAdding(false)
    }
  }

  // Update the handleUpdateStatus function to use the new API endpoint
  const handleUpdateStatus = async (id: string, newStatus: number) => {
    try {
      // Use the correct API endpoint format
      await retrospectiveApi.updateActionItem(id, {
        status: newStatus,
      })

      setActionItems(actionItems.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
    } catch (error) {
      console.error("Error updating action item:", error)
      setError("Failed to update action item")
    }
  }

  // Update the handleUpdatePriority function to use the new API endpoint
  const handleUpdatePriority = async (id: string, newPriority: number) => {
    try {
      await retrospectiveApi.updateActionItem(id, {
        priority: newPriority,
      })

      setActionItems(actionItems.map((item) => (item.id === id ? { ...item, priority: newPriority } : item)))
    } catch (error) {
      console.error("Error updating action item priority:", error)
      setError("Failed to update action item priority")
    }
  }

  // Update the handleDeleteItem function to use the new API endpoint
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this action item?")) return

    try {
      await retrospectiveApi.deleteActionItem(id)
      setActionItems(actionItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting action item:", error)
      setError("Failed to delete action item")
    }
  }

  // Start editing an item
  const handleStartEditing = (item: ActionItem) => {
    setEditingItem(item)
    setNewItemContent(item.description)
    setNewItemDetails(item.details || "")
    setNewPriority(item.priority.toString())
    setNewStatus(item.status.toString())
  }

  // Cancel editing
  const handleCancelEditing = () => {
    setEditingItem(null)
    setNewItemContent("")
    setNewItemDetails("")
    setNewPriority("1")
    setNewStatus("0")
  }

  // Save edited item
  const handleSaveEditing = async () => {
    if (!editingItem || !newItemContent.trim()) {
      handleCancelEditing()
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await retrospectiveApi.updateActionItem(editingItem.id, {
        description: newItemContent,
        details: newItemDetails,
        status: Number.parseInt(newStatus),
        priority: Number.parseInt(newPriority),
      })

      setActionItems(
        actionItems.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                description: newItemContent,
                details: newItemDetails,
                status: Number.parseInt(newStatus),
                priority: Number.parseInt(newPriority),
              }
            : item,
        ),
      )
      handleCancelEditing()
    } catch (error) {
      console.error("Error updating action item:", error)
      setError("Failed to update action item")
    } finally {
      setIsAdding(false)
    }
  }

  // Get priority badge color
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 0:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 border-0">
            Low Priority
          </Badge>
        )
      case 1:
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 border-0">
            Medium Priority
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 border-0">High Priority</Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-300 bg-gray-50">
            Not Started
          </Badge>
        )
      case 1:
        return (
          <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-100">
            In Progress
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-200">
            Closed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Get status icon
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      case 1:
        return <Clock className="h-4 w-4 text-purple-500" />
      case 2:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  // Sort action items
  const sortedActionItems = [...actionItems].sort((a, b) => {
    // Always put completed items at the end
    if (a.status === 2 && b.status !== 2) return 1
    if (a.status !== 2 && b.status === 2) return -1

    // Then sort by the selected criteria
    if (sortBy === "priority") {
      // Sort by priority (high to low)
      return b.priority - a.priority
    } else {
      // Sort by status (not started, in progress, completed)
      return a.status - b.status
    }
  })

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-30 flex transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 h-20 w-10 rounded-l-md rounded-r-none border-r-0 bg-white shadow-md"
        onClick={onToggle}
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>

      <div className="w-96 bg-white border-l shadow-lg flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Action Items</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={() => setSortBy(sortBy === "priority" ? "status" : "priority")}
              >
                <ArrowUpDown className="h-3 w-3" />
                Sort by {sortBy === "priority" ? "Priority" : "Status"}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 rounded-md text-red-500 text-sm">
            {error}
            <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
              <p className="text-sm text-gray-500">Loading action items...</p>
            </div>
          ) : sortedActionItems.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-gray-500">
              <p>No action items yet</p>
              <p className="text-sm">Add items to track follow-up tasks</p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddForm(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            </div>
          ) : (
            <>
              {showAddForm && !editingItem && (
                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium">Add New Action Item</h3>
                    <div className="space-y-2">
                      <Label htmlFor="new-item-title">Title</Label>
                      <Input
                        id="new-item-title"
                        placeholder="Enter action item title"
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-item-details">Details</Label>
                      <Textarea
                        id="new-item-details"
                        placeholder="Enter additional details"
                        value={newItemDetails}
                        onChange={(e) => setNewItemDetails(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="new-item-priority">Priority</Label>
                        <Select value={newPriority} onValueChange={setNewPriority}>
                          <SelectTrigger id="new-item-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Low</SelectItem>
                            <SelectItem value="1">Medium</SelectItem>
                            <SelectItem value="2">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-item-status">Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger id="new-item-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Not Started</SelectItem>
                            <SelectItem value="1">In Progress</SelectItem>
                            <SelectItem value="2">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleAddItem}
                        disabled={isAdding || !newItemContent.trim()}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2" />
                        )}
                        Add Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {editingItem && (
                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium">Edit Action Item</h3>
                    <div className="space-y-2">
                      <Label htmlFor="edit-item-title">Title</Label>
                      <Input
                        id="edit-item-title"
                        placeholder="Enter action item title"
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-item-details">Details</Label>
                      <Textarea
                        id="edit-item-details"
                        placeholder="Enter additional details"
                        value={newItemDetails}
                        onChange={(e) => setNewItemDetails(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-item-priority">Priority</Label>
                        <Select value={newPriority} onValueChange={setNewPriority}>
                          <SelectTrigger id="edit-item-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Low</SelectItem>
                            <SelectItem value="1">Medium</SelectItem>
                            <SelectItem value="2">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-item-status">Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger id="edit-item-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Not Started</SelectItem>
                            <SelectItem value="1">In Progress</SelectItem>
                            <SelectItem value="2">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={handleCancelEditing}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleSaveEditing}
                        disabled={isAdding || !newItemContent.trim()}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sortedActionItems.map((item) => (
                <Card key={item.id} className={item.status === 2 ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{item.description}</h3>
                        {item.details && <p className="text-gray-600 text-sm mt-1">{item.details}</p>}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEditing(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 0)}>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Mark as Not Started
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 1)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 2)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Closed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t">
          {!showAddForm && !editingItem && (
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
              onClick={() => setShowAddForm(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Action Item
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
