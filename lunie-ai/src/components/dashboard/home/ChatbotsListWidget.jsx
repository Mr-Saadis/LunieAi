// src/components/dashboard/home/ChatbotsListWidget.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import {
  Bot,
  Plus,
  MoreHorizontal,
  ArrowRight,
  Edit,
  Play,
  Copy,
  BarChart3,
  Clock,
  MessageSquare,
  Filter,
  Sparkles
} from 'lucide-react'

export default function ChatbotsListWidget({ 
  chatbots, 
  onChatbotSelect, 
  onDuplicateChatbot, 
  router 
}) {
  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center mr-3">
                <Bot className="w-4 h-4 text-white" />
              </div>
              Your Chatbots
            </CardTitle>
            <CardDescription className="mt-2">
              Manage and monitor your AI assistants
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-gray-300 hover:border-[#94B9F9]">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              asChild 
              size="sm" 
              className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 shadow-lg"
            >
              <Link href="/dashboard/chatbots/new">
                <Plus className="w-4 h-4 mr-2" />
                New Chatbot
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {chatbots.slice(0, 3).map((chatbot, index) => (
            <div 
              key={chatbot.id}
              className="relative p-4 border border-gray-200 rounded-xl hover:shadow-xl hover:border-[#94B9F9]/30 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => onChatbotSelect(chatbot.id)}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#94B9F9]/5 to-[#F4CAF7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Animated chatbot icon */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#94B9F9] transition-colors duration-300 text-lg">
                        {chatbot.name}
                      </h3>
                      <Badge className={`${
                        chatbot.is_active 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } border`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          chatbot.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {chatbot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600">
                      {chatbot.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Updated {new Date(chatbot.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {Math.floor(Math.random() * 50) + 10} conversations
                      </div>
                      <div className="flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {Math.floor(Math.random() * 30) + 85}% accuracy
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Quick action buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/${chatbot.id}/playground`)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#94B9F9]/10 hover:text-[#94B9F9]"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${chatbot.id}/training`)
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Training
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${chatbot.id}/playground`)
                      }}>
                        <Play className="w-4 h-4 mr-2" />
                        Test Chatbot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateChatbot(chatbot)
                      }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/${chatbot.id}/analytics`)
                      }}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#94B9F9] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-[#F4CAF7]/20 to-[#FB8A8F]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
        
        {chatbots.length > 3 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              asChild
              className="border-gray-300 hover:border-[#94B9F9] hover:text-[#94B9F9] transition-colors duration-200"
            >
              <Link href="/dashboard/chatbots">
                View All {chatbots.length} Chatbots
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}