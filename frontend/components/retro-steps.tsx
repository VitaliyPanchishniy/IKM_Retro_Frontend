"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"



interface RetroStepsProps {
  currentStep: number
  onStepChange: (step: number) => void
}

export function RetroSteps({ currentStep, onStepChange }: RetroStepsProps) {
  const steps = [
    { id: 1, name: "Reflect" },
    { id: 2, name: "Group" },
    { id: 3, name: "Vote" },
    { id: 4, name: "Discuss" },
  ]

  return (
    <div className="flex items-center justify-center bg-white border-b">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <Button
              variant="ghost"
              className={cn(
                "relative px-4 py-2 rounded-none border-b-2 border-transparent transition-colors",
                currentStep === step.id && "border-purple-600 bg-purple-100 text-purple-700 font-medium",
                currentStep > step.id && "text-gray-500",
              )}
              onClick={() => onStepChange(step.id)}
            >
              <span className="mr-2">{step.id}.</span>
              {step.name}
            </Button>

            {index < steps.length - 1 && (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
