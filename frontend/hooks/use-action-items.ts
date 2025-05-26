"use client"

import { useState, useCallback } from "react"
import {
  retrospectiveApi,
  type ActionItem,
  ActionItemPriority,
  ActionItemStatus,
  type CreateActionItemRequest,
} from "@/lib/api-service"

export function useActionItems(retrospectiveId: string) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActionItems = useCallback(async () => {
    if (!retrospectiveId) return

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
  }, [retrospectiveId])

  const createActionItem = useCallback(async (data: CreateActionItemRequest) => {
    setError(null)

    try {
      const newItem = await retrospectiveApi.createActionItem(data)
      setActionItems((prev) => {
        const updated = [...prev, newItem]
        return updated.sort((a, b) => {
          if (a.status === ActionItemStatus.Completed && b.status !== ActionItemStatus.Completed) return 1
          if (a.status !== ActionItemStatus.Completed && b.status === ActionItemStatus.Completed) return -1
          return b.priority - a.priority
        })
      })
      return newItem
    } catch (error) {
      console.error("Error creating action item:", error)
      setError("Failed to create action item")
      throw error
    }
  }, [])

  const updateActionItem = useCallback(async (id: string, updates: Partial<ActionItem>) => {
    setError(null)

    try {
      await retrospectiveApi.updateActionItem(id, updates)
      setActionItems((prev) => {
        const updated = prev.map((item) => (item.actionId === id ? { ...item, ...updates } : item))

        // Re-sort: completed items at the end
        return updated.sort((a, b) => {
          if (a.status === ActionItemStatus.Completed && b.status !== ActionItemStatus.Completed) return 1
          if (a.status !== ActionItemStatus.Completed && b.status === ActionItemStatus.Completed) return -1
          return b.priority - a.priority
        })
      })
    } catch (error) {
      console.error("Error updating action item:", error)
      setError("Failed to update action item")
      throw error
    }
  }, [])

  const deleteActionItem = useCallback(async (id: string) => {
    setError(null)

    try {
      await retrospectiveApi.deleteActionItem(id)
      setActionItems((prev) => prev.filter((item) => item.actionId !== id))
    } catch (error) {
      console.error("Error deleting action item:", error)
      setError("Failed to delete action item")
      throw error
    }
  }, [])

  const createFromGroupItem = useCallback(
    async (
      groupItemContent: string,
      priority: ActionItemPriority = ActionItemPriority.Medium,
      status: ActionItemStatus = ActionItemStatus.Pending,
      assignedUserId?: string,
    ) => {
      const data: CreateActionItemRequest = {
        retrospectiveId,
        description: groupItemContent,
        priority,
        status,
        assignedUserId,
      }

      return await createActionItem(data)
    },
    [retrospectiveId, createActionItem],
  )

  return {
    actionItems,
    isLoading,
    error,
    setError,
    loadActionItems,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    createFromGroupItem,
  }
}
