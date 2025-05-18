"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PlusCircle, X, ChevronRight, ChevronLeft } from "lucide-react"

interface ActionItem {
  id: string
  content: string
  completed: boolean
  assignee?: string
}

interface ActionItemsPanelProps {
  isOpen: boolean
  onToggle: () => void
}

export function ActionItemsPanel({ isOpen, onToggle }: ActionItemsPanelProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: "1", content: "Update documentation", completed: false, assignee: "John" },
    { id: "2", content: "Fix login bug", completed: true, assignee: "Sarah" },
    { id: "3", content: "Improve test coverage", completed: false },
  ])
  const [newItemContent, setNewItemContent] = useState("")

  const handleAddItem = () => {
    if (!newItemContent.trim()) return

    const newItem: ActionItem = {
      id: Date.now().toString(),
      content: newItemContent,
      completed: false,
    }

    setActionItems([...actionItems, newItem])
    setNewItemContent("")
  }

  const handleToggleComplete = (id: string) => {
    setActionItems(actionItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleDeleteItem = (id: string) => {
    setActionItems(actionItems.filter((item) => item.id !== id))
  }

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

      <div className="w-80 bg-white border-l shadow-lg flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Action Items</h2>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No action items yet</p>
              <p className="text-sm">Add items to track follow-up tasks</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <Card key={item.id} className={item.completed ? "opacity-70" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => handleToggleComplete(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`item-${item.id}`}
                        className={`font-medium ${item.completed ? "line-through text-gray-500" : ""}`}
                      >
                        {item.content}
                      </Label>
                      {item.assignee && <div className="text-xs text-gray-500 mt-1">Assigned to: {item.assignee}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
            />
            <Button size="icon" className="bg-purple-600 hover:bg-purple-700" onClick={handleAddItem}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
