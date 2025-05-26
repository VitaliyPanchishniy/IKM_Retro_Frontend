"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MoveRight } from "lucide-react"

interface ConvertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConvert: (data: {
    status: number
    priority: number
    assignedUserId: string
    details?: string
    description?: string
  }) => Promise<boolean>
  itemContent: string
  setItemContent: (content: string) => void
  isSaving: boolean
  user: any
}

export function ConvertDialog({
  open,
  onOpenChange,
  onConvert,
  itemContent,
  setItemContent,
  isSaving,
  user,
}: ConvertDialogProps) {
  const [convertPriority, setConvertPriority] = useState<string>("1")
  const [convertStatus, setConvertStatus] = useState<string>("0")
  const [details, setDetails] = useState("")

  const handleConvert = async () => {
    const success = await onConvert({
      status: Number.parseInt(convertStatus),
      priority: Number.parseInt(convertPriority),
      assignedUserId: user?.id || "",
      details,
      description: itemContent,
    })

    if (success) {
      // Reset form
      setConvertPriority("1")
      setConvertStatus("0")
      setDetails("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Action Item</DialogTitle>
          <DialogDescription>
            Convert this card to an action item. Set the title, details, priority and status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="convert-title" className="text-right">
              Title
            </Label>
            <Input
              id="convert-title"
              value={itemContent}
              onChange={(e) => setItemContent(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="convert-details" className="text-right">
              Details
            </Label>
            <Input
              id="convert-details"
              placeholder="Additional details or description"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select value={convertPriority} onValueChange={setConvertPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Low</SelectItem>
                <SelectItem value="1">Medium</SelectItem>
                <SelectItem value="2">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={convertStatus} onValueChange={setConvertStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Not Started</SelectItem>
                <SelectItem value="1">In Progress</SelectItem>
                <SelectItem value="2">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MoveRight className="mr-2 h-4 w-4" />}
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
