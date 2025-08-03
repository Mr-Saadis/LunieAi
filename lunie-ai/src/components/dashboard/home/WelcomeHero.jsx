// src/components/dashboard/home/WelcomeHero.jsx
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Sparkles,
  Rocket,
  FileText,
  Plus,
  RefreshCw,
  Bot
} from 'lucide-react'

export default function WelcomeHero({ 
  userName, 
  hasNoChatbots, 
  stats, 
  refreshing, 
  onRefresh 
}) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] via-[#F4CAF7] to-[#FB8A8F] opacity-5 rounded-3xl"></div>
      <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#94B9F9] to-[#F4CAF7] bg-clip-text text-transparent">
                      {getGreeting()}, {userName}! 👋
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                      {hasNoChatbots 
                        ? "Ready to build your first AI chatbot? Let's create something amazing!" 
                        : `You have ${stats.chatbots} active chatbot${stats.chatbots !== 1 ? 's' : ''} working for you`
                      }
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions in Header */}
                <div className="hidden lg:flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRefresh} 
                    disabled={refreshing}
                    className="border-gray-300 hover:border-[#94B9F9] hover:text-[#94B9F9] transition-all duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    asChild 
                    size="sm" 
                    className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link href="/dashboard/chatbots/new">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chatbot
                    </Link>
                  </Button>
                </div>
              </div>
              
              {hasNoChatbots && (
                <div className="flex flex-wrap gap-4 mt-8">
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Link href="/dashboard/chatbots/new">
                      <Rocket className="w-5 h-5 mr-2" />
                      Create Your First Chatbot
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild 
                    className="border-gray-300 hover:border-[#94B9F9] hover:bg-[#94B9F9]/5 transition-all duration-200"
                  >
                    <Link href="/help">
                      <FileText className="w-5 h-5 mr-2" />
                      View Documentation
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {!hasNoChatbots && (
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-40 h-40 bg-gradient-to-br from-[#94B9F9]/10 to-[#F4CAF7]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-20 h-20 text-[#94B9F9]" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#94B9F9]/20 to-[#F4CAF7]/20 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[#F4CAF7]/20 to-[#FB8A8F]/20 rounded-full blur-xl opacity-60 animate-float"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-[#94B9F9]/15 to-[#F4CAF7]/15 rounded-full blur-xl opacity-40 animate-float-delayed"></div>
      </div>
    </div>
  )
}