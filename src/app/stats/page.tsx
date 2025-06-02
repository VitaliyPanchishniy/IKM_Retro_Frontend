"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, BarChart3, TrendingUp, Users, Target } from "lucide-react"
import { retrospectiveApi, TemplateType } from "@/lib/api-service"
import Header from "@/components/Header"

interface StatsData {
  totalCards: number
  totalComments: number
  totalLikes: number
  totalActionItems: number
  completedActionItems: number
  averageActionItemsPerBoard: number
  averageCompletedActionItemsPerBoard: number
  averageLikesPerCard: number
  averageCommentsPerCard: number
  averageCardsPerBoard: number
  averageCommentsPerBoard: number
  averageLikesPerBoard: number
  actionItemCompletionRate: number
  templatePopularity: Record<string, number>
}

export default function StatsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndLoadStats = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/login?redirect=/stats")
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (!userData.isLoggedIn) {
          router.push("/login?redirect=/stats")
          return
        }

        await loadStats()
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push("/login?redirect=/stats")
      }
    }

    checkAuthAndLoadStats()
  }, [router])

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Отримуємо статистику з бекенду
      const stats = await retrospectiveApi.getRetrospectiveStats()
      setStats(stats)
    } catch (error) {
      console.error("Error loading stats:", error)
      setError("Failed to load statistics. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatDecimal = (num: number): string => {
    return num.toFixed(1)
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`
  }

  // Для відображення популярності шаблонів:
  const templateLabels: Record<string, string> = {
    StartStopContinue: "Start / Stop / Continue",
    GladSadMad: "Glad / Sad / Mad",
    StartStopContinueChange: "Start / Stop / Continue / Change",
    KeepAddLessMore: "Keep / Add / Less / More",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h2 className="text-xl font-medium mb-2">Loading Statistics...</h2>
          <p className="text-gray-500">Please wait while we calculate your retrospective statistics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            Retrospective Statistics
          </h1>
          <p className="text-gray-500 mt-2">Comprehensive analytics for all your retrospectives</p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
            {error}
            <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalCards)}</div>
                  <p className="text-xs text-muted-foreground">Across all retrospectives</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalComments)}</div>
                  <p className="text-xs text-muted-foreground">Team discussions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</div>
                  <p className="text-xs text-muted-foreground">Votes cast</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Action Items</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalActionItems)}</div>
                  <p className="text-xs text-muted-foreground">Follow-up tasks</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Items Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action Items Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>{formatNumber(stats.completedActionItems)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total</span>
                        <span>{formatNumber(stats.totalActionItems)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats.actionItemCompletionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPercentage(stats.actionItemCompletionRate)}
                      </span>
                      <p className="text-xs text-muted-foreground">Completion rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">{formatDecimal(stats.averageActionItemsPerBoard)}</div>
                      <p className="text-xs text-muted-foreground">Per board</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatDecimal(stats.averageCompletedActionItemsPerBoard)}</div>
                      <p className="text-xs text-muted-foreground">Completed per board</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-lg font-semibold">{formatDecimal(stats.averageLikesPerCard)}</div>
                      <p className="text-xs text-muted-foreground">Average likes per card</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{formatDecimal(stats.averageCommentsPerCard)}</div>
                      <p className="text-xs text-muted-foreground">Average comments per card</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Board Averages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Cards per Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatDecimal(stats.averageCardsPerBoard)}</div>
                  <p className="text-sm text-muted-foreground">Cards created per retrospective</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Comments per Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatDecimal(stats.averageCommentsPerBoard)}</div>
                  <p className="text-sm text-muted-foreground">Comments per retrospective</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Likes per Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatDecimal(stats.averageLikesPerBoard)}</div>
                  <p className="text-sm text-muted-foreground">Votes per retrospective</p>
                </CardContent>
              </Card>
            </div>

            {/* Template Popularity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Popularity</CardTitle>
                <p className="text-sm text-muted-foreground">Most used retrospective templates</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.templatePopularity)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, count], index) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{templateLabels[key] || key}</p>
                            <p className="text-sm text-muted-foreground">
                              {count} {count === 1 ? "board" : "boards"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${Object.values(stats.templatePopularity).length > 0 ? (count / Math.max(...Object.values(stats.templatePopularity))) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  {Object.keys(stats.templatePopularity).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No retrospectives found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
