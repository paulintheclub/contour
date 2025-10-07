"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorBoundaryProps {
  error: Error | string
  reset?: () => void
  title?: string
  description?: string
}

export function ErrorBoundary({ 
  error, 
  reset, 
  title = "Something went wrong",
  description 
}: ErrorBoundaryProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>
        <p className="text-gray-600 mb-4">
          {description || errorMessage}
        </p>
        {reset && (
          <Button onClick={reset} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function InlineError({ 
  error, 
  reset, 
  className = "" 
}: { 
  error: Error | string
  reset?: () => void
  className?: string 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className={`flex items-center justify-center p-4 text-center ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Error loading data</span>
        </div>
        <p className="text-xs text-gray-500">{errorMessage}</p>
        {reset && (
          <Button size="sm" variant="ghost" onClick={reset} className="text-xs">
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
