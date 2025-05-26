"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { retrospectiveApi, type Retrospective, type Group, type GroupItem } from "@/lib/api-service"

export interface RetroColumn {
  id: string
  groupId: number
  title: string
  emoji: string
  description: string
  items: GroupItem[]
}

export function useRetrospective(retroId: string, templateType: string) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [retrospective, setRetrospective] = useState<Retrospective | null>(null)
  const [columns, setColumns] = useState<RetroColumn[]>([])
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userMap, setUserMap] = useState<Record<string, string>>({})

  // Load retrospective data
  useEffect(() => {
    const loadRetrospective = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/login?redirect=/retrospective")
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (!userData.isLoggedIn) {
          router.push("/login?redirect=/retrospective")
          return
        }
        setUser(userData)

        // Initialize userMap with current user
        setUserMap((prev) => ({
          ...prev,
          [userData.id]: userData.name || "User",
        }))

        if (retroId) {
          try {
            // Use the new specific endpoint to get retrospective by ID
            const retroResponse = await retrospectiveApi.getRetrospective(retroId)
            const foundRetro = retroResponse.retrospective

            setRetrospective(foundRetro)

            // Add assigned users to userMap
            if (foundRetro.assignedUsers) {
              const updatedUserMap = { ...userMap }
              foundRetro.assignedUsers.forEach((user) => {
                updatedUserMap[user.id] = user.userName
              })
              setUserMap(updatedUserMap)
            }

            // Convert groups to columns
            const retroColumns = mapGroupsToColumns(foundRetro.groups, templateType)
            setColumns(retroColumns)

            // Load group items for this retrospective
            try {
              const groupItems = await retrospectiveApi.getGroupItems(retroId)
              updateColumnsWithGroupItems(retroColumns, groupItems)
            } catch (error) {
              console.error("Error fetching group items:", error)
              setError("Failed to load group items")
            }
          } catch (apiError) {
            console.error("Error loading retrospective:", apiError)
            setError("Failed to load retrospective data")
          }
        } else {
          // If no ID is provided, initialize columns based on template
          initializeColumnsFromTemplate(templateType)
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push("/login?redirect=/retrospective")
      }
    }

    loadRetrospective()
  }, [router, retroId, templateType])

  // Update columns with group items
  const updateColumnsWithGroupItems = (columns: RetroColumn[], groupItems: GroupItem[]) => {
    const updatedColumns = columns.map((column) => {
      const columnItems = groupItems.filter((item) => item.groupId === column.groupId)
      return {
        ...column,
        items: columnItems,
      }
    })

    setColumns(updatedColumns)
  }

  // Initialize columns based on template
  const initializeColumnsFromTemplate = (template: string) => {
    const initialColumns = getInitialColumnsForTemplate(template)
    setColumns(initialColumns)
  }

  // Map API groups to UI columns
  const mapGroupsToColumns = (groups: Group[], template: string): RetroColumn[] => {
    const initialColumns = getInitialColumnsForTemplate(template)

    return initialColumns.map((column, index) => {
      const matchingGroup =
        groups.find((g) => g.name.toLowerCase().includes(column.id.toLowerCase())) ||
        (groups.length > index ? groups[index] : null)

      if (matchingGroup) {
        return {
          ...column,
          groupId: matchingGroup.id,
          items: matchingGroup.groupItems || [],
        }
      }

      return column
    })
  }

  // Get initial columns structure based on template
  const getInitialColumnsForTemplate = (template: string): RetroColumn[] => {
    if (template === "glad-sad-mad") {
      return [
        {
          id: "glad",
          groupId: 0,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 0,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 0,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue") {
      return [
        {
          id: "start",
          groupId: 0,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 0, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 0,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
      ]
    } else if (template === "start-stop-continue-change") {
      return [
        {
          id: "start",
          groupId: 0,
          title: "Start",
          emoji: "🟢",
          description: "Things we should start doing",
          items: [],
        },
        { id: "stop", groupId: 0, title: "Stop", emoji: "⛔️", description: "Things we should stop doing", items: [] },
        {
          id: "continue",
          groupId: 0,
          title: "Continue",
          emoji: "🔄",
          description: "Things we should continue doing",
          items: [],
        },
        { id: "change", groupId: 0, title: "Change", emoji: "🔧", description: "Things we should change", items: [] },
      ]
    } else if (template === "keep-stop-less-more-start") {
      return [
        { id: "keep", groupId: 0, title: "Keep Doing", emoji: "✔️", description: "Things that work well", items: [] },
        { id: "stop", groupId: 0, title: "Stop Doing", emoji: "⛔️", description: "Things that don't work", items: [] },
        { id: "less", groupId: 0, title: "Less Of", emoji: "➖", description: "Things to reduce", items: [] },
        { id: "more", groupId: 0, title: "More Of", emoji: "➕", description: "Things to increase", items: [] },
        { id: "start", groupId: 0, title: "Start Doing", emoji: "✅", description: "New things to try", items: [] },
      ]
    } else {
      // Default to glad-sad-mad if template is not recognized
      return [
        {
          id: "glad",
          groupId: 0,
          title: "What Went Well",
          emoji: "😀",
          description: "Things that made you happy",
          items: [],
        },
        {
          id: "sad",
          groupId: 0,
          title: "What Needs Improvement",
          emoji: "😢",
          description: "Things that could be better",
          items: [],
        },
        {
          id: "mad",
          groupId: 0,
          title: "Action Items",
          emoji: "😡",
          description: "Things that frustrated you",
          items: [],
        },
      ]
    }
  }

  return {
    isLoading,
    retrospective,
    columns,
    setColumns,
    error,
    setError,
    user,
    userMap,
    setUserMap,
  }
}
