// src/components/dashboard/home/GettingStartedSection.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Bot,
  Plus,
  FileText,
  Rocket
} from 'lucide-react'

export default function GettingStartedSection() {
  return (
    <Card className="relative border-2 border-dashed border-gray-200 hover:border-[#94B9F9]/40 transition-all duration-300 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9]/5 via-transparent to-[#F4CAF7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="relative p-8 lg:p-12 text-center">
        <div className="relative">
          {/* Animated Bot Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#94B9F9]/10 to-[#F4CAF7]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
            <Bot className="h-12 w-12 text-[#94B9F9] group-hover:animate-bounce" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#F4CAF7]/30 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#FB8A8F]/20 rounded-full animate-pulse"></div>
        </div>
        
        <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#94B9F9] group-hover:to-[#F4CAF7] group-hover:bg-clip-text transition-all duration-300">
          Create Your First AI Chatbot
        </h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-lg">
          Transform your customer experience with an intelligent chatbot trained on your business data. 
          Setup takes just a few minutes, and you'll have your AI assistant ready to help customers 24/7.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Link href="/dashboard/chatbots/new">
              <Plus className="w-5 h-5 mr-2" />
              Create New Chatbot
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            asChild 
            className="border-gray-300 hover:border-[#94B9F9] hover:bg-[#94B9F9]/5 hover:text-[#94B9F9] transition-all duration-200"
          >
            <Link href="/help">
              <FileText className="w-5 h-5 mr-2" />
              Learn How
            </Link>
          </Button>
        </div>
        
        {/* Progress Steps */}
        <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#94B9F9] text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
            Create
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#F4CAF7] text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
            Train
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#FB8A8F] text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</div>
            Deploy
          </div>
        </div>
      </CardContent>
    </Card>
  )
}