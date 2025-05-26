"use client"

import { useState } from "react"
import { retrospectiveApi, type Comment, type CreateCommentRequest } from "@/lib/api-service"

export function useRetroComments(retroId: string) {
  const [isAddingComment, setIsAddingComment] = useState<number | null>(null)
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [newComments, setNewComments] = useState<Record<number, string>>({})
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})

  const toggleComments = async (itemId: number) => {
    setShowComments((prev) => {
      const newState = { ...prev, [itemId]: !prev[itemId] }

      if (newState[itemId] && !comments[itemId]) {
        loadComments(itemId)
      }

      return newState
    })
  }

  const loadComments = async (itemId: number) => {
    try {
      const itemComments = await retrospectiveApi.getComments(retroId, itemId)
      setComments((prev) => ({
        ...prev,
        [itemId]: itemComments,
      }))

      setCommentCounts((prev) => ({
        ...prev,
        [itemId]: itemComments.length,
      }))
    } catch (error) {
      console.error("Error loading comments:", error)
      throw error
    }
  }

  const handleAddComment = async (columnId: string, itemId: number) => {
    if (!newComments[itemId]?.trim()) return

    setIsAddingComment(itemId)

    try {
      const createCommentRequest: CreateCommentRequest = {
        content: newComments[itemId],
        isAnonymous: false,
      }

      const newComment = await retrospectiveApi.createComment(retroId, itemId, createCommentRequest)

      const updatedComments = [...(comments[itemId] || []), newComment]
      setComments((prev) => ({
        ...prev,
        [itemId]: updatedComments,
      }))

      setCommentCounts((prev) => ({
        ...prev,
        [itemId]: updatedComments.length,
      }))

      setNewComments((prev) => ({ ...prev, [itemId]: "" }))
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    } finally {
      setIsAddingComment(null)
    }
  }

  const initializeCommentCounts = async (groupItems: any[]) => {
    const initialCommentCounts: Record<number, number> = {}
    for (const item of groupItems) {
      try {
        const comments = await retrospectiveApi.getComments(retroId, item.id)
        initialCommentCounts[item.id] = comments.length
      } catch (error) {
        console.error(`Error loading comments for item ${item.id}:`, error)
        initialCommentCounts[item.id] = 0
      }
    }
    setCommentCounts(initialCommentCounts)
  }

  return {
    isAddingComment,
    showComments,
    newComments,
    setNewComments,
    comments,
    commentCounts,
    setCommentCounts,
    toggleComments,
    loadComments,
    handleAddComment,
    initializeCommentCounts,
  }
}
