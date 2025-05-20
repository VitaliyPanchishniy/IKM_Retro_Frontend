"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  PlusCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ArrowUpDown,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { retrospectiveApi } from "@/lib/api-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ActionItem {
  id: string
  description: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"priority" | "status">("priority")

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
        status: 0, // Not started
        priority: 1, // Medium priority
      })

      setActionItems([...actionItems, newItem])
      setNewItemContent("")
    } catch (error) {
      console.error("Error adding action item:", error)
      setError("Failed to add action item")
    } finally {
      setIsAdding(false)
    }
  }

  // Update the handleToggleStatus function to use the new API endpoint
  const handleUpdateStatus = async (id: string, newStatus: number) => {
    try {
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
    try {
      await retrospectiveApi.deleteActionItem(id)
      setActionItems(actionItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting action item:", error)
      setError("Failed to delete action item")
    }
  }

  // Get priority badge color
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 0:
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>
      case 1:
        return <Badge className="bg-orange-500 hover:bg-orange-600">Medium</Badge>
      case 2:
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-300">
            Not Started
          </Badge>
        )
      case 1:
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-300">
            In Progress
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="text-green-500 border-green-300">
            Completed
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
        return <Clock className="h-4 w-4 text-blue-500" />
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
          ) : sortedActionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No action items yet</p>
              <p className="text-sm">Add items to track follow-up tasks</p>
            </div>
          ) : (
            sortedActionItems.map((item) => (
              <Card key={item.id} className={item.status === 2 ? "opacity-70" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.status === 2}
                      onCheckedChange={() => handleUpdateStatus(item.id, item.status === 2 ? 0 : 2)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <Label
                          htmlFor={`item-${item.id}`}
                          className={`font-medium ${item.status === 2 ? "line-through text-gray-500" : ""}`}
                        >
                          {item.description}
                        </Label>
                        <div className="flex items-center gap-1 ml-2">{getStatusIcon(item.status)}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Select
                          value={item.priority.toString()}
                          onValueChange={(value) => handleUpdatePriority(item.id, Number.parseInt(value))}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Low</SelectItem>
                            <SelectItem value="1">Medium</SelectItem>
                            <SelectItem value="2">High</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={item.status.toString()}
                          onValueChange={(value) => handleUpdateStatus(item.id, Number.parseInt(value))}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Not Started</SelectItem>
                            <SelectItem value="1">In Progress</SelectItem>
                            <SelectItem value="2">Completed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Add new action item..."
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddItem()
                }
              }}
              disabled={isAdding}
            />
            <Button
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleAddItem}
              disabled={isAdding}
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
