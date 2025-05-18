"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Play, Pause, RotateCcw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TimerDialog({ open, onOpenChange }: TimerDialogProps) {
  const [minutes, setMinutes] = useState<string>("")
  const [seconds, setSeconds] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [timeUp, setTimeUp] = useState<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsRunning(false)
            setTimeUp(true)
            return 0
          }
          return prevSeconds - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStart = () => {
    if (!minutes.trim()) return

    const totalSeconds = Number.parseInt(minutes) * 60
    setSeconds(totalSeconds)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(Number.parseInt(minutes) * 60)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Clock className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timer-minutes">Set Timer (minutes)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="timer-minutes"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="5"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  disabled={isRunning}
                />
                {!isRunning ? (
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleStart}
                    disabled={!minutes.trim()}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={handlePause}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </div>

            {(isRunning || (!isRunning && seconds > 0)) && (
              <div className="text-center">
                <div className="text-3xl font-mono font-bold mb-2">{formatTime(seconds)}</div>
                <div className="flex justify-center gap-2">
                  {!isRunning && seconds > 0 && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsRunning(true)}>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={timeUp} onOpenChange={setTimeUp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Time's Up!</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="text-5xl mb-4">⏰</div>
            <p>The timer has ended. Time to wrap up!</p>
          </div>
          <DialogFooter>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setTimeUp(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
