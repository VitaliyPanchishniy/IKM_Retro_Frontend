"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartTimer?: (minutes: number) => void
  onStopTimer?: () => void
  isTimerRunning?: boolean
}

export function TimerDialog({ open, onOpenChange, onStartTimer, onStopTimer, isTimerRunning }: TimerDialogProps) {
  const [duration, setDuration] = useState(5)
  const baseTimes = [1, 5, 10, 15, 30, 60]

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value > 0 && value <= 60) {
      setDuration(value)
    } else if (e.target.value === "") {
      setDuration(0)
    }
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
              <div className="flex flex-col items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={duration === 0 ? "" : duration}
                  onChange={handleInputChange}
                  className="w-32 text-center text-2xl font-bold"
                  placeholder="Minutes"
                />
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {baseTimes.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => setDuration(time)}
                      className="w-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                <span className="text-sm text-gray-500 mt-1">minutes</span>
              </div>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleStartTimer}
                disabled={duration < 1 || duration > 60}
              >
                Start Timer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
