"use client"

import { useDroppable } from "@dnd-kit/core"
import { PlusCircle } from "lucide-react"

interface ActionItemsDropZoneProps {
  isVisible: boolean
}

export function ActionItemsDropZone({ isVisible }: ActionItemsDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "action-items-drop-zone",
    data: {
      type: "action-items-zone",
    },
  })

  if (!isVisible) return null

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-4 right-4 w-64 h-32 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${
        isOver
          ? "border-purple-500 bg-purple-50 scale-105"
          : "border-gray-300 bg-gray-50 hover:border-purple-300 hover:bg-purple-25"
      }`}
    >
      <div className="text-center">
        <PlusCircle className={`h-8 w-8 mx-auto mb-2 ${isOver ? "text-purple-600" : "text-gray-400"}`} />
        <p className={`text-sm font-medium ${isOver ? "text-purple-600" : "text-gray-500"}`}>
          {isOver ? "Drop to create Action Item" : "Drag cards here to create Action Items"}
        </p>
      </div>
    </div>
  )
}
