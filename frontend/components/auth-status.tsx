"use client"

import { useEffect, useState } from "react"
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
import { Settings, LayoutGrid } from "lucide-react"
import axios from "axios"

interface User {
  name: string
  email: string
  isLoggedIn: boolean
}

export function AuthStatus() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (
            userData.isLoggedIn &&
            typeof userData.name === "string" &&
            typeof userData.email === "string"
          ) {
            setUser(userData)
          } else {
            setUser(null)
          }
        } catch (e) {
          console.error("Error parsing user data:", e)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()
    window.addEventListener("storage", checkAuth)
    window.addEventListener("auth-change", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("auth-change", checkAuth)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        try {
          await axios.post("http://localhost:5014/account/logout", {
            refreshToken: refreshToken,
          })
          console.log("Logout successful")
        } catch (apiError) {
          console.error("API logout error:", apiError)
        }
      }

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            isLoggedIn: false,
          }),
        )
      }

      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return null
  }

  if (!user) {
    return (
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
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {(user.name?.charAt(0) || "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name || "Unknown User"}</p>
            <p className="text-sm text-muted-foreground">{user.email || "No Email"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/create">Create Retrospective</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <div className="flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              My Retrospectives
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
