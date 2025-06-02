"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MoveRight } from "lucide-react"
import { ActionItemPriority, ActionItemStatus, retrospectiveApi } from "@/lib/api-service"

interface ConvertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  retrospectiveId: string
  onCreated?: () => void
  itemContent: string
  setItemContent: (content: string) => void
  isSaving?: boolean
  user: any
}

export function ConvertDialog({
  open,
  onOpenChange,
  retrospectiveId,
  onCreated,
  itemContent,
  setItemContent,
  isSaving,
  user,
}: ConvertDialogProps) {
  const [formData, setFormData] = useState({
    description: itemContent,
    priority: ActionItemPriority.Medium,
    status: ActionItemStatus.Pending,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Синхронізуємо description з itemContent при відкритті діалогу або зміні itemContent
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        description: itemContent,
      }))
    }
  }, [itemContent, open])

  const handleCreate = async () => {
    if (!formData.description.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const newItem = {
        retrospectiveId,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedUserId: user?.id,
      }

      await retrospectiveApi.createActionItem(newItem)
      setFormData({
        description: "",
        priority: ActionItemPriority.Medium,
        status: ActionItemStatus.Pending,
      })
      setItemContent("")
      onOpenChange(false)
      onCreated?.()
    } catch (error) {
      setError("Failed to create action item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Action Item</DialogTitle>
          <DialogDescription>
            Add a new action item to track follow-up tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="mb-2 p-2 bg-red-50 rounded text-red-500 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Title *</Label>
            <Input
              id="description"
              placeholder="Enter action item title"
              value={formData.description}
              readOnly // <-- поле тільки для читання
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: Number(value) as ActionItemPriority,
                  }))
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
                  setFormData((prev) => ({
                    ...prev,
                    status: Number(value) as ActionItemStatus,
                  }))
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
              setFormData({
                description: "",
                priority: ActionItemPriority.Medium,
                status: ActionItemStatus.Pending,
              })
              setItemContent("")
              onOpenChange(false)
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !formData.description.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MoveRight className="h-4 w-4 mr-2" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
