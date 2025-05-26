"use client"

import { useState, useEffect } from "react"
import { retrospectiveApi, type GroupItem } from "@/lib/api-service"

export function useRetroVoting(retroId: string, currentStep: number, user: any) {
  const [isVoting, setIsVoting] = useState<number | null>(null)
  const [isRemovingVotes, setIsRemovingVotes] = useState<number | null>(null)
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({})
  const [userVotesPerItem, setUserVotesPerItem] = useState<Record<number, number>>({}) // Track votes per item for this user
  const [remainingVotes, setRemainingVotes] = useState(6)
  const [showVoteLimitAlert, setShowVoteLimitAlert] = useState(false)

  // Load user votes and remaining votes from localStorage
  useEffect(() => {
    if (retroId && user?.id) {
      const storedVotes = localStorage.getItem(`retro_${retroId}_user_${user.id}_remaining_votes`)
      const storedUserVotes = localStorage.getItem(`retro_${retroId}_user_${user.id}_votes_per_item`)
      console.log('Read remainingVotes from localStorage:', storedVotes)
      console.log('Read userVotesPerItem from localStorage:', storedUserVotes)
  
      if (storedVotes) {
        setRemainingVotes(Number.parseInt(storedVotes, 10))
      }
  
      if (storedUserVotes) {
        setUserVotesPerItem(JSON.parse(storedUserVotes))
      }
    }
  }, [retroId, user?.id])
  

  // Save user votes and remaining votes to localStorage
  useEffect(() => {
    if (retroId && user?.id) {
      localStorage.setItem(`retro_${retroId}_user_${user.id}_remaining_votes`, remainingVotes.toString())
      localStorage.setItem(`retro_${retroId}_user_${user.id}_votes_per_item`, JSON.stringify(userVotesPerItem))
    }
  }, [remainingVotes, userVotesPerItem, retroId, user?.id])

  // Save vote counts to localStorage
  useEffect(() => {
    if (retroId && Object.keys(voteCounts).length > 0) {
      localStorage.setItem(`retro_${retroId}_vote_counts`, JSON.stringify(voteCounts))
    }
  }, [voteCounts, retroId])

  // Load vote counts from localStorage
  useEffect(() => {
    const storedVoteCounts = localStorage.getItem(`retro_${retroId}_vote_counts`)
    if (storedVoteCounts) {
      setVoteCounts(JSON.parse(storedVoteCounts))
    }
  }, [retroId])

  const handleVote = async (columnId: string, itemId: number) => {
    if (remainingVotes <= 0) {
      setShowVoteLimitAlert(true)
      setTimeout(() => setShowVoteLimitAlert(false), 3000)
      return
    }

    setIsVoting(itemId)

    try {
      const response = await retrospectiveApi.voteForGroupItem(itemId)

      // Update vote count from server
      const newCount = await retrospectiveApi.getVotesForGroupItem(itemId)
      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: newCount,
      }))

      // Update user votes for this item
      setUserVotesPerItem((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }))

      setRemainingVotes((prev) => prev - 1)
    } catch (error) {
      console.error("Error voting for item:", error)
      throw error
    } finally {
      setIsVoting(null)
    }
  }

  const handleRemoveMyVotes = async (itemId: number, userId: string) => {
    const userVotesForThisItem = userVotesPerItem[itemId] || 0
    if (userVotesForThisItem === 0) return

    setIsRemovingVotes(itemId)

    try {
      // Simulate removing user votes by calling the API multiple times
      for (let i = 0; i < userVotesForThisItem; i++) {
        // Since we don't have a specific endpoint to remove user votes,
        // we'll simulate it by tracking locally and updating the count
        await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay to simulate API call
      }

      // Update vote count from server
      const currentCount = await retrospectiveApi.getVotesForGroupItem(itemId)
      const newCount = Math.max(0, currentCount - userVotesForThisItem)

      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: newCount,
      }))

      // Reset user votes for this item
      setUserVotesPerItem((prev) => ({
        ...prev,
        [itemId]: 0,
      }))

      // Update remaining votes
      setRemainingVotes((prev) => prev + userVotesForThisItem)
    } catch (error) {
      console.error("Error removing votes:", error)
      throw error
    } finally {
      setIsRemovingVotes(null)
    }
  }

  const handleRemoveAllVotes = async (itemId: number) => {
    setIsRemovingVotes(itemId)

    try {
      const response = await retrospectiveApi.removeAllVotesForItem(itemId)

      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: response.count,
      }))

      // Reset user votes for this item
      setUserVotesPerItem((prev) => ({
        ...prev,
        [itemId]: 0,
      }))
    } catch (error) {
      console.error("Error removing all votes:", error)
      throw error
    } finally {
      setIsRemovingVotes(null)
    }
  }

  const initializeVoteCounts = async (groupItems: GroupItem[]) => {
    const storedVoteCounts = localStorage.getItem(`retro_${retroId}_vote_counts`)
    if (!storedVoteCounts) {
      const initialVoteCounts: Record<number, number> = {}
      for (const item of groupItems) {
        try {
          const voteCount = await retrospectiveApi.getVotesForGroupItem(item.id)
          initialVoteCounts[item.id] = voteCount
        } catch (error) {
          console.error(`Error getting votes for item ${item.id}:`, error)
          initialVoteCounts[item.id] = 0
        }
      }
      setVoteCounts(initialVoteCounts)
    }
  }

  return {
    isVoting,
    isRemovingVotes,
    voteCounts,
    setVoteCounts,
    remainingVotes,
    showVoteLimitAlert,
    handleVote,
    handleRemoveMyVotes,
    handleRemoveAllVotes,
    initializeVoteCounts,
  }
}
