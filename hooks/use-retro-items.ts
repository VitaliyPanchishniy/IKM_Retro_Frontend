"use client"

import type React from "react"

import { useState } from "react"
import {
  retrospectiveApi,
  type GroupItem,
  type CreateGroupItemRequest,
  type UpdateGroupItemRequest,
  type MoveGroupItemRequest,
  type ConvertToActionRequest,
} from "@/lib/api-service"
import type { RetroColumn } from "./use-retrospective"

export function useRetroItems(
  retroId: string,
  columns: RetroColumn[],
  setColumns: React.Dispatch<React.SetStateAction<RetroColumn[]>>,
  setError: (error: string | null) => void,
  user: any,
) {
  const [isSaving, setIsSaving] = useState<number | null>(null)
  const [newItems, setNewItems] = useState<Record<string, string>>({})
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")

  const handleAddItem = async (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column || !newItems[columnId]?.trim()) return

    setIsSaving(column.groupId)

    try {
      const createItemRequest: CreateGroupItemRequest = {
        groupId: column.groupId,
        content: newItems[columnId],
        isHidden: false,
      }

      const newItem = await retrospectiveApi.createGroupItem(retroId, createItemRequest)

      setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, items: [...col.items, newItem] } : col)))

      setNewItems((prev) => ({ ...prev, [columnId]: "" }))
    } catch (error) {
      console.error("Error adding item:", error)
      setError("Failed to add item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleStartEditing = (item: GroupItem) => {
    setEditingItemId(item.id)
    setEditingContent(item.content)
  }

  const handleCancelEditing = () => {
    setEditingItemId(null)
    setEditingContent("")
  }

  const handleSaveEditing = async () => {
    if (!editingItemId || !editingContent.trim()) {
      handleCancelEditing()
      return
    }

    setIsSaving(editingItemId)

    try {
      const updateItemRequest: UpdateGroupItemRequest = {
        content: editingContent,
      }

      await retrospectiveApi.updateGroupItem(retroId, editingItemId, updateItemRequest)

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.map((item) => (item.id === editingItemId ? { ...item, content: editingContent } : item)),
        })),
      )

      setEditingItemId(null)
      setEditingContent("")
    } catch (error) {
      console.error("Error updating item:", error)
      setError("Failed to update item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleMoveItem = async (itemId: number, sourceColumnId: string, targetColumnId: string) => {
    const sourceColumn = columns.find((col) => col.id === sourceColumnId)
    const targetColumn = columns.find((col) => col.id === targetColumnId)

    if (!sourceColumn || !targetColumn) return

    const item = sourceColumn.items.find((i) => i.id === itemId)
    if (!item) return

    setIsSaving(itemId)

    try {
      const moveItemRequest: MoveGroupItemRequest = {
        newGroupId: targetColumn.groupId,
        orderPosition: targetColumn.items.length,
      }

      await retrospectiveApi.moveGroupItem(retroId, itemId, moveItemRequest)

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === sourceColumnId) {
            return {
              ...col,
              items: col.items.filter((i) => i.id !== itemId),
            }
          } else if (col.id === targetColumnId) {
            return {
              ...col,
              items: [...col.items, { ...item, groupId: targetColumn.groupId }],
            }
          }
          return col
        }),
      )
    } catch (error) {
      console.error("Error moving item:", error)
      setError("Failed to move item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleDeleteItem = async (columnId: string, itemId: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    setIsSaving(itemId)

    try {
      await retrospectiveApi.deleteGroupItem(retroId, itemId)

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, items: col.items.filter((item) => item.id !== itemId) } : col,
        ),
      )
    } catch (error) {
      console.error("Error deleting item:", error)
      setError("Failed to delete item. Please try again.")
    } finally {
      setIsSaving(null)
    }
  }

  const handleConvertToAction = async (
    itemId: number,
    description: string,
    priority: number,
    status: number,
    details?: string,
    assignedUserId?: string,
  ) => {
    setIsSaving(itemId)

    try {
      const convertRequest: ConvertToActionRequest = {
        status,
        priority,
        assignedUserId: assignedUserId || user?.id || "",
      }

      await retrospectiveApi.convertToAction(retroId, itemId, convertRequest)

      // Remove the item from the board
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.filter((item) => item.id !== itemId),
        })),
      )

      return true
    } catch (error) {
      console.error("Error converting item to action:", error)
      setError("Failed to convert item to action. Please try again.")
      return false
    } finally {
      setIsSaving(null)
    }
  }

  return {
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
  }
}
