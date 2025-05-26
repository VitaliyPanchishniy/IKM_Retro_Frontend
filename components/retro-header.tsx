"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Share2 } from "lucide-react"

interface RetroHeaderProps {
  retroName: string
  remainingVotes: number
  timerRunning: boolean
  timeRemaining: number
  user: any
  onShareClick: () => void
  onTimerClick: () => void
}

export function RetroHeader({
  retroName,
  remainingVotes,
  timerRunning,
  timeRemaining,
  user,
  onShareClick,
  onTimerClick,
}: RetroHeaderProps) {
  const formatTimeRemaining = () => {
    if (!timeRemaining) return "00:00"
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
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
            <div className="ml-4 text-lg font-medium text-gray-900">{retroName}</div>
          </div>
          <div className="flex items-center gap-2">
            {timerRunning && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTimeRemaining()}</span>
              </div>
            )}

            <div className="text-sm text-gray-600 mr-2">
              <span className="font-medium">{remainingVotes}</span> votes remaining
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" onClick={onTimerClick}>
                    <Clock className="h-4 w-4" />
                    {timerRunning ? "Stop Timer" : "Start Timer"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set a timer for the current retrospective phase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" className="gap-1" onClick={onShareClick}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/logout">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
