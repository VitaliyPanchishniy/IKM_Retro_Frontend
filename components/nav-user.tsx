"use client"

import type * as React from "react"
import Link from "next/link"
import { MoreHorizontal, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  name: string
  email: string
  avatar: string
}

interface NavUserProps extends React.HTMLAttributes<HTMLDivElement> {
  user: User
}

export function NavUser({ user, className, ...props }: NavUserProps) {
  return (
    <div className={cn("flex w-full items-center gap-2", className)} {...props}>
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium leading-none">{user.name}</span>
        </div>
        <span className="text-xs leading-none text-muted-foreground">{user.email}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="#">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

