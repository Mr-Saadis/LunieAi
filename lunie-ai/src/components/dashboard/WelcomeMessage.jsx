// src/components/dashboard/WelcomeMessage.jsx
"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function WelcomeMessage({ user }) {
  const [showWelcome, setShowWelcome] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const isWelcome = searchParams.get('welcome')
    if (isWelcome === 'true') {
      setShowWelcome(true)
      toast.success('🎉 Welcome to LunieAI! Your account has been set up successfully.')
      
      // Remove the welcome parameter from URL
      const newUrl = new URL(window.location)
      newUrl.searchParams.delete('welcome')
      router.replace(newUrl.pathname, { scroll: false })
    }
  }, [searchParams, router])

  if (!showWelcome) return null

  const isOAuthUser = user?.app_metadata?.provider !== 'email'
  const provider = user?.app_metadata?.provider

  return (
    <Card className="mb-8 border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Welcome to LunieAI! 🎉
              </h3>
              <div className="text-green-700 space-y-2">
                <p>
                  Your account has been successfully created
                  {isOAuthUser && provider && (
                    <span> using {provider === 'google' ? 'Google' : provider === 'azure' ? 'Microsoft' : provider}</span>
                  )}!
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>You're ready to create your first AI chatbot</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <Button size="sm" asChild>
                  <a href="/dashboard/chatbots/new">
                    Create Your First Chatbot
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowWelcome(false)}>
                  I'll do this later
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWelcome(false)}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Update your src/components/dashboard/DashboardHome.jsx
// Add this import at the top:
// import { WelcomeMessage } from './WelcomeMessage'

// And add this component right after the welcome header:
// <WelcomeMessage user={user} profile={profile} />