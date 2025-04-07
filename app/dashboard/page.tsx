"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  ArrowUpRight,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Типы для ретроспектив
interface Retrospective {
  id: string
  name: string
  template: string
  createdAt: string
  participants: number
  status: "active" | "completed" | "archived"
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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
            name: "Sprint 42 Retrospective",
            template: "glad-sad-mad",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            participants: 5,
            status: "completed",
          },
          {
            id: "retro-2",
            name: "Q2 Team Review",
            template: "start-stop-continue",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            participants: 8,
            status: "completed",
          },
          {
            id: "retro-3",
            name: "Project Alpha Retrospective",
            template: "start-stop-continue-change",
            createdAt: new Date().toISOString(),
            participants: 3,
            status: "active",
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

  const handleContinueRetro = (retro: Retrospective) => {
    router.push(`/retrospective?name=${encodeURIComponent(retro.name)}&template=${encodeURIComponent(retro.template)}`)
  }

  const filteredRetros = retrospectives.filter((retro) => retro.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const activeRetros = filteredRetros.filter((retro) => retro.status === "active")
  const completedRetros = filteredRetros.filter((retro) => retro.status === "completed")
  const archivedRetros = filteredRetros.filter((retro) => retro.status === "archived")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold">RetroSync</span>
            </Link>
          </div>
        </header>
        <div className="container flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your retrospectives.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold">RetroSync</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Retrospectives</h1>
            <p className="text-muted-foreground">Manage and view all your retrospective sessions</p>
          </div>
          <Button onClick={handleCreateRetro} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" /> Create New Retrospective
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search retrospectives..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({activeRetros.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedRetros.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedRetros.length})</TabsTrigger>
          </TabsList>

          {["active", "completed", "archived"].map((status) => (
            <TabsContent key={status} value={status} className="w-full">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRetros
                    .filter((retro) => retro.status === status)
                    .map((retro) => (
                      <Card key={retro.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl truncate">{retro.name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleContinueRetro(retro)}>Continue</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteRetro(retro.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription>
                            {retro.template === "glad-sad-mad" && "Glad, Sad, Mad"}
                            {retro.template === "start-stop-continue" && "Start, Stop, Continue"}
                            {retro.template === "start-stop-continue-change" && "Start, Stop, Continue, Change"}
                            {retro.template === "custom" && "Custom Template"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(retro.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{retro.participants} participants</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {status === "active"
                                  ? "In progress"
                                  : status === "completed"
                                    ? "Completed"
                                    : "Archived"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full" onClick={() => handleContinueRetro(retro)}>
                            Continue <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Template</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Created</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Participants</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRetros
                        .filter((retro) => retro.status === status)
                        .map((retro) => (
                          <tr key={retro.id} className="border-t">
                            <td className="p-3">
                              <div className="font-medium">{retro.name}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {formatDate(retro.createdAt)} • {retro.participants} participants
                              </div>
                            </td>
                            <td className="p-3 hidden md:table-cell">
                              {retro.template === "glad-sad-mad" && "Glad, Sad, Mad"}
                              {retro.template === "start-stop-continue" && "Start, Stop, Continue"}
                              {retro.template === "start-stop-continue-change" && "Start, Stop, Continue, Change"}
                              {retro.template === "custom" && "Custom Template"}
                            </td>
                            <td className="p-3 hidden md:table-cell">{formatDate(retro.createdAt)}</td>
                            <td className="p-3 hidden md:table-cell">{retro.participants}</td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleContinueRetro(retro)}>
                                  Continue
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => handleDeleteRetro(retro.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {filteredRetros.filter((retro) => retro.status === status).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No retrospectives found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}

