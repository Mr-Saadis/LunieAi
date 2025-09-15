
// src/components/chat/TypingIndicator.jsx
'use client'

import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="w-full flex justify-start">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0ms' }}
              />
              <div 
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" 
                style={{ animationDelay: '150ms' }}
              />
              <div 
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" 
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="text-xs text-gray-500">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
  )
}