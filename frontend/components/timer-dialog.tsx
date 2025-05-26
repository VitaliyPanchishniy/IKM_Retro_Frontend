"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Minus, Plus } from "lucide-react"

interface TimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartTimer?: (minutes: number) => void
  onStopTimer?: () => void
  isTimerRunning?: boolean
}

export function TimerDialog({ open, onOpenChange, onStartTimer, onStopTimer, isTimerRunning }: TimerDialogProps) {
  const [duration, setDuration] = useState(5)

  const handleStartTimer = () => {
    if (onStartTimer) {
      onStartTimer(duration)
    }
    onOpenChange(false)
  }

  const handleStopTimer = () => {
    if (onStopTimer) {
      onStopTimer()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Timer</DialogTitle>
          <DialogDescription>Set a timer for the current phase of your retrospective.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isTimerRunning ? (
            <div className="space-y-4">
              <p className="text-center">Timer is currently running.</p>
              <Button className="w-full" onClick={handleStopTimer}>
                Stop Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Button variant="outline" size="icon" onClick={() => setDuration(Math.max(1, duration - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-24 text-center">
                  <span className="text-2xl font-bold">{duration}</span>
                  <span className="ml-1">min</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setDuration(Math.min(60, duration + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full" onClick={handleStartTimer}>
                Start Timer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
