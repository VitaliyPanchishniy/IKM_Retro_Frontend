"use client"

import { useState } from "react"
import { QrCode, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  retroName: string
}

export function InviteDialog({ open, onOpenChange, retroName }: InviteDialogProps) {
  const [copied, setCopied] = useState(false)

  // In a real app, this would be a real URL
  const inviteUrl = `https://retrosync.app/join/${encodeURIComponent(retroName)}/${Math.random().toString(36).substring(2, 8)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Others</DialogTitle>
          <DialogDescription>
            Share this link with your team members to invite them to this retrospective.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Invite Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input value={inviteUrl} readOnly className="w-full" />
                <p className="text-xs text-gray-500">Anyone with this link can join your retrospective session.</p>
              </div>
              <Button
                type="button"
                size="icon"
                className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="qr" className="mt-4">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="border p-4 rounded-lg bg-white">
                <QrCode className="h-48 w-48" />
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Scan this QR code with your phone camera to join the retrospective.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

