// src/components/dashboard/overview/HeroSection.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CheckCircle,
  Play,
  Settings,
  Sparkles,
  Calendar
} from 'lucide-react'

export default function HeroSection({ chatbot }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] via-[#F4CAF7] to-[#FB8A8F] opacity-10 rounded-3xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl blur-sm opacity-30"></div>
              <Avatar className="relative w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={chatbot.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white text-2xl font-bold">
                  {chatbot.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
                <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-gray-600 max-w-md">{chatbot.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Sparkles className="w-4 h-4 text-[#94B9F9]" />
                  <span className="font-medium">{chatbot.ai_model.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(chatbot.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
              <Play className="w-4 h-4 mr-2" />
              Test Chatbot
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}