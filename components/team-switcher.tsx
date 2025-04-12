"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Team {
  name: string
  logo: React.ComponentType<{ className?: string }>
  plan: string
}

interface TeamSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  teams: Team[]
}

export function TeamSwitcher({ teams, className, ...props }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(teams[0])

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn(
              "w-full justify-between transition-[padding] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:w-9 group-[[data-collapsed=true]]/sidebar-wrapper:px-0",
              className,
            )}
            {...props}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedTeam && (
                <Avatar className="h-5 w-5">
                  {React.createElement(selectedTeam.logo, {
                    className: "h-4 w-4",
                  })}
                  <AvatarFallback>{selectedTeam.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <span className="truncate transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0">
                {selectedTeam.name}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-[opacity,margin] ease-linear group-[[data-collapsed=true]]/sidebar-wrapper:opacity-0 group-[[data-collapsed=true]]/sidebar-wrapper:w-0 group-[[data-collapsed=true]]/sidebar-wrapper:overflow-hidden group-[[data-collapsed=true]]/sidebar-wrapper:m-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup heading="Teams">
                {teams.map((team) => (
                  <CommandItem
                    key={team.name}
                    onSelect={() => {
                      setSelectedTeam(team)
                      setOpen(false)
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      {React.createElement(team.logo, {
                        className: "h-4 w-4",
                      })}
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {team.name}
                    <Check
                      className={cn("ml-auto h-4 w-4", selectedTeam.name === team.name ? "opacity-100" : "opacity-0")}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>Add a new team to manage products and customers.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input id="name" placeholder="Acme Inc." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

