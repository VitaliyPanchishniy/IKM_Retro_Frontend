"use client"
import Header from "@/components/Header"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, Loader2, Edit, BarChart3 } from "lucide-react"
import { retrospectiveApi, type RetrospectiveResponse, TemplateType } from "@/lib/api-service"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [retrospectives, setRetrospectives] = useState<RetrospectiveResponse[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("created")
  const [selectedTemplate, setSelectedTemplate] = useState("All Templates")
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRetro, setEditingRetro] = useState<RetrospectiveResponse | null>(null)
  const [newTitle, setNewTitle] = useState("")

  // Check authentication and load retrospectives
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/login?redirect=/dashboard")
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (!userData.isLoggedIn) {
          router.push("/login?redirect=/dashboard")
          return
        }
        setUser(userData)

        // Load retrospectives from API
        try {
          const retros = await retrospectiveApi.getAllRetrospectives()
          setRetrospectives(retros)
        } catch (apiError) {
          console.error("Error loading retrospectives:", apiError)
          setError("Failed to load retrospectives. Please try again later.")
        }

        setIsLoading(false)
      } catch (e) {
        console.error("Error parsing user data:", e)
        router.push("/login?redirect=/dashboard")
      }
    }

    checkAuthAndLoadData()
  }, [router])

  const handleCreateRetro = () => {
    router.push("/create")
  }

  const handleDeleteRetro = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this retrospective?")) {
      setIsDeleting(id)
      try {
        await retrospectiveApi.deleteRetrospective(id)
        setRetrospectives(retrospectives.filter((item) => item.retrospective.id !== id))
      } catch (error) {
        console.error("Error deleting retrospective:", error)
        setError("Failed to delete retrospective. Please try again.")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleEditRetro = (retro: RetrospectiveResponse) => {
    setEditingRetro(retro)
    setNewTitle(retro.retrospective.title)
    setEditDialogOpen(true)
  }

  const handleUpdateRetro = async () => {
    if (!editingRetro || !newTitle.trim()) return

    setIsUpdating(editingRetro.retrospective.id)
    try {
      await retrospectiveApi.updateRetrospective(editingRetro.retrospective.id, { title: newTitle })
      setRetrospectives(
        retrospectives.map((item) =>
          item.retrospective.id === editingRetro.retrospective.id
            ? { ...item, retrospective: { ...item.retrospective, title: newTitle } }
            : item,
        ),
      )
      setEditDialogOpen(false)
      setEditingRetro(null)
      setNewTitle("")
    } catch (error) {
      console.error("Error updating retrospective:", error)
      setError("Failed to update retrospective. Please try again.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleOpenRetro = (retro: RetrospectiveResponse) => {
    const templateName = retrospectiveApi.getTemplateNameByType(retro.retrospective.template)
    router.push(
      `/retrospective?id=${retro.retrospective.id}&name=${encodeURIComponent(retro.retrospective.title)}&template=${encodeURIComponent(templateName)}`,
    )
  }

  const handleViewStats = () => {
    router.push("/stats")
  }

  const handleActivateRetro = async (retro: RetrospectiveResponse) => {
    if (window.confirm("Are you sure you want to make this retrospective active again?")) {
      setIsUpdating(retro.retrospective.id)
      try {
        await retrospectiveApi.updateRetrospective(retro.retrospective.id, { isActive: true })
        setRetrospectives(
          retrospectives.map((item) =>
            item.retrospective.id === retro.retrospective.id
              ? { ...item, retrospective: { ...item.retrospective, isActive: true } }
              : item,
          ),
        )
      } catch (error) {
        console.error("Error activating retrospective:", error)
        setError("Failed to activate retrospective. Please try again.")
      } finally {
        setIsUpdating(null)
      }
    }
  }

  const handleArchiveRetro = async (retro: RetrospectiveResponse) => {
    if (window.confirm("Are you sure you want to archive this retrospective?")) {
      setIsUpdating(retro.retrospective.id)
      try {
        await retrospectiveApi.updateRetrospective(retro.retrospective.id, { isActive: false })
        setRetrospectives(
          retrospectives.map((item) =>
            item.retrospective.id === retro.retrospective.id
              ? { ...item, retrospective: { ...item.retrospective, isActive: false } }
              : item,
          ),
        )
      } catch (error) {
        console.error("Error archiving retrospective:", error)
        setError("Failed to archive retrospective. Please try again.")
      } finally {
        setIsUpdating(null)
      }
    }
  }

  // Modified to show all retrospectives in "created by me" tab
  const filteredRetros = retrospectives.filter((retro) => {
    const matchesSearch = retro.retrospective.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate =
      selectedTemplate === "All Templates" || getTemplateLabel(retro.retrospective.template).includes(selectedTemplate)

    // For v2, show all active retrospectives in "created by me" tab
    const isArchived = !retro.retrospective.isActive

    // Modified logic to show all retrospectives in "created by me" tab
    const matchesTab = (activeTab === "created" && !isArchived) || (activeTab === "archived" && isArchived)

    return matchesSearch && matchesTemplate && matchesTab
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `Created on ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)}`
  }

  const getTemplateLabel = (template: TemplateType) => {
    switch (template) {
      case TemplateType.StartStopContinue:
        return "🟢 Start / ⛔️ Stop / 🔄 Continue"
      case TemplateType.GladSadMad:
        return "😀 Glad / 😢 Sad / 😡 Mad"
      case TemplateType.StartStopContinueChange:
        return "🟢 Start / ⛔️ Stop / 🔄 Continue / 🔧 Change"
      case TemplateType.KeepStopLessMoreStart:
        return "✔️ Keep / ⛔️ Stop / ➖ Less / ➕ More / ✅ Start"
      default:
        return "Custom Template"
    }
  }

  const getTemplateColorClass = (template: TemplateType) => {
    switch (template) {
      case TemplateType.StartStopContinue:
        return "bg-green-100 text-green-800"
      case TemplateType.GladSadMad:
        return "bg-blue-100 text-blue-800"
      case TemplateType.StartStopContinueChange:
        return "bg-yellow-100 text-yellow-800"
      case TemplateType.KeepStopLessMoreStart:
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-100 text-purple-700",
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-yellow-100 text-yellow-700",
      "bg-red-100 text-red-700",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your retrospectives.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Retrospectives</h1>
              <p className="text-sm text-gray-500">Manage and organize your team retrospectives</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button onClick={handleViewStats} variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Get All Stats
              </Button>
              <Button onClick={handleCreateRetro} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" /> Create New Retro
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
              {error}
              <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search retros..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-1 border rounded-md text-sm"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    <option>All Templates</option>
                    <option>🟢 Start / ⛔️ Stop / 🔄 Continue</option>
                    <option>😀 Glad / 😢 Sad / 😡 Mad</option>
                    <option>🟢 Start / ⛔️ Stop / 🔄 Continue / 🔧 Change</option>
                    <option>✔️ Keep / ⛔️ Stop / ➖ Less / ➕ More / ✅ Start</option>
                  </select>
                </div>
              </div>
            </div>

            <Tabs defaultValue="created" onValueChange={setActiveTab}>
              <div className="px-4 border-b">
                <TabsList className="h-10 w-full justify-start bg-transparent p-0">
                  <TabsTrigger
                    value="created"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none"
                  >
                    All Retrospectives
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none"
                  >
                    Finished
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="created" className="p-0">
                <div className="divide-y">
                  {filteredRetros.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">No retrospectives found</p>
                      <Button onClick={handleCreateRetro} className="mt-4 bg-purple-600 hover:bg-purple-700">
                        Create Your First Retro
                      </Button>
                    </div>
                  ) : (
                    filteredRetros.map((retro) => (
                      <div key={retro.retrospective.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{retro.retrospective.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenRetro(retro)}>
                                    Open Retrospective
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditRetro(retro)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Title
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleArchiveRetro(retro)}>
                                    Archive Retrospective
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Share</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteRetro(retro.retrospective.id)}
                                    disabled={isDeleting === retro.retrospective.id}
                                  >
                                    {isDeleting === retro.retrospective.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete"
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {formatDate(retro.retrospective.createdAt)}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTemplateColorClass(
                                  retro.retrospective.template,
                                )}`}
                              >
                                {getTemplateLabel(retro.retrospective.template)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  retro.retrospective.isActive,
                                )}`}
                              >
                                {retro.retrospective.isActive ? "Active" : "Archived"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {retro.retrospective.assignedUsers &&
                                  retro.retrospective.assignedUsers.slice(0, 4).map((user, index) => (
                                    <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                      {user.avatarUrl ? (
                                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.userName} />
                                      ) : (
                                        <AvatarFallback className={getAvatarColor(user.userName)}>
                                          {getAvatarInitial(user.userName)}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                  ))}
                                {retro.retrospective.assignedUsers && retro.retrospective.assignedUsers.length > 4 && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                    +{retro.retrospective.assignedUsers.length - 4}
                                  </div>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => handleOpenRetro(retro)}
                              >
                                {!retro.retrospective.isActive ? "View Archive →" : "Open Board →"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="archived" className="p-0">
                {filteredRetros.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No archived retrospectives found</p>
                    <p className="text-sm text-gray-400 mt-2">Archived retrospectives will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y">
                      {filteredRetros.map((retro) => (
                        <div key={retro.retrospective.id} className="p-4 hover:bg-gray-50">
                          <div className="flex flex-col sm:flex-row justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium text-gray-900">{retro.retrospective.title}</h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenRetro(retro)}>
                                      View Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditRetro(retro)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Title
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleActivateRetro(retro)}>
                                      Make Active Again
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Share</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteRetro(retro.retrospective.id)}
                                      disabled={isDeleting === retro.retrospective.id}
                                    >
                                      {isDeleting === retro.retrospective.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete"
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {formatDate(retro.retrospective.createdAt)}
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTemplateColorClass(
                                    retro.retrospective.template,
                                  )}`}
                                >
                                  {getTemplateLabel(retro.retrospective.template)}
                                </span>

                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                    retro.retrospective.isActive,
                                  )}`}
                                >
                                  {retro.retrospective.isActive ? "Active" : "Finished"}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  {retro.retrospective.assignedUsers &&
                                    retro.retrospective.assignedUsers.slice(0, 4).map((user, index) => (
                                      <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                        {user.avatarUrl ? (
                                          <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.userName} />
                                        ) : (
                                          <AvatarFallback className={getAvatarColor(user.userName)}>
                                            {getAvatarInitial(user.userName)}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                    ))}
                                  {retro.retrospective.assignedUsers && retro.retrospective.assignedUsers.length > 4 && (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                      +{retro.retrospective.assignedUsers.length - 4}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  onClick={() => handleOpenRetro(retro)}
                                >
                                  View Archive →
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Retrospective Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Retrospective</DialogTitle>
            <DialogDescription>Change the title of your retrospective.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter retrospective title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRetro}
              disabled={isUpdating === editingRetro?.retrospective.id || !newTitle.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpdating === editingRetro?.retrospective.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
