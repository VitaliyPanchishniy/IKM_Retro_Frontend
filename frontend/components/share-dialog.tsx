"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Loader2 } from "lucide-react"
import { retrospectiveApi } from "@/lib/api-service"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  retrospectiveId: string
}

export function ShareDialog({ open, onOpenChange, retrospectiveId }: ShareDialogProps) {
  const [inviteCode, setInviteCode] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inviteUrl = `${window.location.origin}/join?code=${inviteCode}`

  useEffect(() => {
    if (open && retrospectiveId) {
      generateInviteCode()
    }
  }, [open, retrospectiveId])

  const generateInviteCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const invite = await retrospectiveApi.createInvite(retrospectiveId)
      setInviteCode(invite.code)
    } catch (error) {
      console.error("Error generating invite code:", error)
      setError("Failed to generate invite code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Retrospective</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2">Generating invite code...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm my-4">
            {error}
            <Button variant="link" className="p-0 h-auto text-red-600 ml-2" onClick={generateInviteCode}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <div className="flex items-center gap-2">
                  <Input id="invite-code" value={inviteCode} readOnly className="font-mono text-center text-lg" />
                </div>
                <p className="text-sm text-gray-500">
                  Share this code with your team members to join this retrospective.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-link">Invite Link</Label>
                <div className="flex items-center gap-2">
                  <Input id="invite-link" value={inviteUrl} readOnly className="text-sm" />
                  <Button size="icon" variant="outline" onClick={copyToClipboard} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-start">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" className="bg-purple-600 hover:bg-purple-700" onClick={copyToClipboard}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
