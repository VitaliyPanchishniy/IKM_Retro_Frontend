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
import axios from "axios";
import API from '../../../lib/api';
import Header from "@/components/Header"

// Типы для ретроспектив
interface Retrospective {
  id: string
  title: string
  template: number
  createdAt: string
  isActive: boolean
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
  
    const userData = JSON.parse(storedUser)
    if (!userData.isLoggedIn) {
      router.push("/login?redirect=/dashboard")
      return
    }
  
    const fetchData = async () => {
      try {
        // // Получаем пользователя
        // const userResponse = await API.get('/api/account/self')
        // setUser(userResponse.data)
  
        // Получаем ретроспективы
        const retrosResponse = await API.get('/api/Retrospective')
  
        // Преобразуем в нужный формат
        const cleanedRetros: Retrospective[] = retrosResponse.data.map((item: any) => {
          const r = item.retrospective
          return {
            id: r.id,
            title: r.title,
            template: r.template,
            createdAt: r.createdAt,
            isActive: r.isActive,
          }
        })
  
        setRetrospectives(cleanedRetros)
      } catch (e) {
        console.error("Ошибка при получении данных с сервера:", e)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
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
    router.push(`/retrospective?name=${encodeURIComponent(retro.title)}&template=${encodeURIComponent(retro.template)}`)
  }

  const filteredRetros = retrospectives.filter((retro) => {
    const matchesSearch = retro.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate = selectedTemplate === "All Templates" || retro.template === Number(selectedTemplate)
    const matchesTab =
      activeTab === "created" ||
      (activeTab === "joined" && false) // В будущем здесь будет логика для присоединенных ретро
      // (activeTab === "archived" && retro.status === "archived")

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

  const getTemplateLabel = (template: number) => {
    switch (template) {
      case 2:
        return "Mad/Sad/Glad"
      case 1:
        return "Start/Stop/Continue"
      case 3:
        return "Start/Stop/Continue/Change"
      default:
        return template
    }
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
  }

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // const getAvatarColor = (name: string) => {
  //   const colors = [
  //     "bg-purple-100 text-purple-700",
  //     "bg-blue-100 text-blue-700",
  //     "bg-green-100 text-green-700",
  //     "bg-yellow-100 text-yellow-700",
  //     "bg-red-100 text-red-700",
  //   ]
  //   const index = name.charCodeAt(0) % colors.length
  //   return colors[index]
  // }

  // const handleLogout = async () => {
  //   try {
  //       await API.post('/api/account/logout');
  //       // После успешного выхода перенаправляем на страницу входа
  //       localStorage.clear();
  //       router.push('/login');
  //   } catch (error) {
  //       console.error('Ошибка при выходе:', error);
  //   }
  // };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this retrospective?");
    if (!confirmed) return;
  
    try {
      await API.delete(`/api/Retrospective/${id}`);
      setRetrospectives(prev => prev.filter(retro => retro.id !== id));
    } catch (error) {
      console.error("Error deleting retrospective", error);
      alert("Failed to delete the retrospective.");
    }
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
      <Header />

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
                    <option value="All Templates">All Templates</option>
                    <option value="1">Start/Stop/Continue</option>
                    <option value="2">Mad/Sad/Glad</option>
                    <option value="3">Start/Stop/Continue/Change</option>
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
                  {/* <TabsTrigger
                    value="archived"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:shadow-none"
                  >
                    Archived
                  </TabsTrigger> */}
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
                              <h3 className="font-medium text-gray-900">{retro.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(retro.id)}
                                    className="text-red-600 hover:bg-red-100"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                            </div>
                            <div className="mt-1 text-sm text-gray-500">{formatDate(retro.createdAt)}</div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  retro.template === 2
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getTemplateLabel(retro.template)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  retro.isActive,
                                )}`}
                              >
                                {retro.isActive ? "Active" : "Completed"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {/* {retro.users &&
                                  retro.users.slice(0, 4).map((user, index) => (
                                    <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                      <AvatarFallback className={getAvatarColor(user)}>
                                        {getAvatarInitial(user)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))} */}
                                {/* {retro.users && retro.users.length > 4 && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                    +{retro.users.length - 4}
                                  </div>
                                )} */}
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => handleOpenRetro(retro)}
                              >
                                {retro.isActive ? "Open Board →" : "View Summary →"}
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
                              <h3 className="font-medium text-gray-900">{retro.title}</h3>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">{formatDate(retro.createdAt)}</div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  retro.template === 2
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getTemplateLabel(retro.template)}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  retro.isActive,
                                )}`}
                              >
                                {retro.isActive ? "Active" : "Completed"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {/* {retro.users &&
                                  retro.users.slice(0, 4).map((user, index) => (
                                    <Avatar key={index} className="h-7 w-7 border-2 border-white">
                                      <AvatarFallback className={getAvatarColor(user)}>
                                        {getAvatarInitial(user)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))} */}
                                {/* {retro.users && retro.users.length > 4 && (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
                                    +{retro.users.length - 4}
                                  </div>
                                )} */}
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
