"use client"

import type * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Project {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavProjectsProps extends React.HTMLAttributes<HTMLDivElement> {
  projects: Project[]
}

export function NavProjects({ projects, className, ...props }: NavProjectsProps) {
  return (
    <div className={cn("grid gap-1 p-2", className)} {...props}>
      <div className="flex items-center gap-1">
        <h3 className="flex-1 px-2 py-1 text-sm font-medium text-muted-foreground transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:h-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
          Projects
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add project</span>
        </Button>
      </div>
      {projects.map((project, index) => {
        const Icon = project.icon

        return (
          <Link
            key={index}
            href={project.url}
            className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
            <span className="transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
              {project.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

