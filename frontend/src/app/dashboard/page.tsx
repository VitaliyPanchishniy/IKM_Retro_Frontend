"use client"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

// Типы для ретроспектив
interface Retrospective {
  id: string
  name: string
  template: string
  createdAt: string
  participants: number
  status: "active" | "completed" | "archived"
  users?: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("created")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState("All Templates")

  // Проверка авторизации
  useEffect(() => {
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

      // Загрузка ретроспектив пользователя
      const storedRetros = localStorage.getItem(`retros_${userData.email}`)
      if (storedRetros) {
        setRetrospectives(JSON.parse(storedRetros))
      } else {
        // Если у пользователя нет ретроспектив, создаем демо-данные
        const demoRetros: Retrospective[] = [
          {
            id: "retro-1",
            name: "Q1 Product Team Retro",
            template: "mad-sad-glad",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            participants: 5,
            status: "active",
            users: ["John", "Sarah", "Mike"],
          },
          {
            id: "retro-2",
            name: "Sprint 23 Retrospective",
            template: "start-stop-continue",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            participants: 8,
            status: "archived",
            users: ["Alex", "Emma"],
          },
          {
            id: "retro-3",
            name: "Design Team Weekly",
            template: "mad-sad-glad",
            createdAt: new Date().toISOString(),
            participants: 3,
            status: "active",
            users: ["Lisa", "David", "Anna", "Mark"],
          },
        ]
        setRetrospectives(demoRetros)
        localStorage.setItem(`retros_${userData.email}`, JSON.stringify(demoRetros))
      }
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/login?redirect=/dashboard")
      return
    }

    setIsLoading(false)
  }, [router])

  const handleCreateRetro = () => {
    router.push("/create")
  }

  const handleDeleteRetro = (id: string) => {
    const updatedRetros = retrospectives.filter((retro) => retro.id !== id)
    setRetrospectives(updatedRetros)

    if (user) {
      localStorage.setItem(`retros_${user.email}`, JSON.stringify(updatedRetros))
    }
  }

  const handleOpenRetro = (retro: Retrospective) => {
    router.push(`/retrospective?name=${encodeURIComponent(retro.name)}&template=${encodeURIComponent(retro.template)}`)
  }

  const filteredRetros = retrospectives.filter((retro) => {
    const matchesSearch = retro.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate =
      selectedTemplate === "All Templates" || retro.template === selectedTemplate.toLowerCase().replace(/\//g, "-")
    const matchesTab =
      activeTab === "created" ||
      (activeTab === "joined" && false) || // В будущем здесь будет логика для присоединенных ретро
      (activeTab === "archived" && retro.status === "archived")

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

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case "mad-sad-glad":
        return "Mad/Sad/Glad"
      case "start-stop-continue":
        return "Start/Stop/Continue"
      case "start-stop-continue-change":
        return "Start/Stop/Continue/Change"
      default:
        return template
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
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
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your retrospectives.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-indigo-700">
                  Retro<span className="text-purple-600">IKM</span>
                </span>
              </Link>
              <nav className="ml-10 flex space-x-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600"
                >
                  Dashboard
                </Link>
                <Link href="/templates" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Templates
                </Link>
                <Link href="/teams" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Teams
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">Help & Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/logout">Log out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Retrospectives</h1>
              <p className="text-sm text-gray-500">Manage and organize your team retrospectives</p>
            </div>
            <Button onClick={handleCreateRetro} className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" /> Create New Retro
            </Button>
          </div>

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
                    <option>Mad/Sad/Glad</option>
                    <option>Start/Stop/Continue</option>
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
                    Created by me
                  </TabsTrigger>
                  <TabsTrigger
                    value="joined"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none"
                  >
                    Joined
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none"
                  >
                    Archived
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
                      <div key={retro.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{retro.name}</h3>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">{formatDate(retro.createdAt)}</div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  retro.template === "mad-sad-glad"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getTemplateLabel(retro.template)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  retro.status,
                                )}`}
                              >
                                {retro.status.charAt(0).toUpperCase() + retro.status.slice(1)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {retro.users &&
                                  retro.users.slice(0, 4).map((user, index) => (
                                    <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                      <AvatarFallback className={getAvatarColor(user)}>
                                        {getAvatarInitial(user)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                {retro.users && retro.users.length > 4 && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                    +{retro.users.length - 4}
                                  </div>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => handleOpenRetro(retro)}
                              >
                                {retro.status === "archived" ? "View Archive →" : "Open Board →"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="joined" className="p-0">
                <div className="py-12 text-center">
                  <p className="text-gray-500">No joined retrospectives found</p>
                  <p className="text-sm text-gray-400 mt-2">Retrospectives you join will appear here</p>
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
                      <div key={retro.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-gray-900">{retro.name}</h3>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">{formatDate(retro.createdAt)}</div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  retro.template === "mad-sad-glad"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getTemplateLabel(retro.template)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  retro.status,
                                )}`}
                              >
                                {retro.status.charAt(0).toUpperCase() + retro.status.slice(1)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {retro.users &&
                                  retro.users.slice(0, 4).map((user, index) => (
                                    <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                      <AvatarFallback className={getAvatarColor(user)}>
                                        {getAvatarInitial(user)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                {retro.users && retro.users.length > 4 && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                    +{retro.users.length - 4}
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

            {filteredRetros.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-center border-t">
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 bg-purple-50 text-purple-600 border-purple-500"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">
                    3
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-md">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
