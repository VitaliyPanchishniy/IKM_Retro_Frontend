"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import API from '../lib/api';
import { Settings, LayoutGrid } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      setIsAuthenticated(false)
      return
    }else{
      setIsAuthenticated(true)
    }


    const fetchData = async () => {
      try {
        const userResponse = await API.get('/api/account/self', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUser(userResponse.data)
      } catch (e) {
        console.error("Ошибка при получении данных с сервера:", e)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await API.post('/api/account/logout')
      localStorage.clear()
      router.push('/login')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-bold text-indigo-700">
                Retro<span className="text-purple-600">IKM</span>
              </span>
            </Link>
            {isAuthenticated ? (
              <nav className="ml-10 flex space-x-4">
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/templates" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Templates
                </Link>
                <Link href="/teams" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Teams
                </Link>
              </nav>
            ) : (
              <nav className="container flex items-center gap-6 justify-between px-4 md:px-6">
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full ml-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {user?.userName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.userName}</p>
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
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
