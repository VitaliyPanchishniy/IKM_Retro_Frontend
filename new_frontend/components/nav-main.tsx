"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
    isActive?: boolean
  }[]
}

interface NavMainProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[]
}

export function NavMain({ items, className, ...props }: NavMainProps) {
  return (
    <div className={cn("grid gap-1 p-2", className)} {...props}>
      <h3 className="px-2 py-1 text-sm font-medium text-muted-foreground transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:h-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
        Main
      </h3>
      {items.map((item, index) => (
        <NavCollapsible key={index} item={item} />
      ))}
    </div>
  )
}

interface NavCollapsibleProps {
  item: NavItem
}

function NavCollapsible({ item }: NavCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(item.isActive)
  const Icon = item.icon

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/nav-item">
      <div className="flex items-center">
        <Link
          href={item.url}
          className={cn(
            "flex h-9 flex-1 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            item.isActive && "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
            {item.title}
          </span>
        </Link>
        {item.items?.length ? (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        ) : null}
      </div>
      {item.items?.length ? (
        <CollapsibleContent className="grid gap-1 px-2 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:h-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
          {item.items.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.url}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                subItem.isActive && "bg-accent text-accent-foreground",
              )}
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-60" />
              <span>{subItem.title}</span>
            </Link>
          ))}
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}

