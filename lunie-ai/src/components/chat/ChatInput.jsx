
// src/components/chat/ChatInput.jsx
'use client'

import { useState, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'

export const ChatInput = forwardRef(function ChatInput({ 
  onSendMessage, 
  isLoading, 
  memoryInfo, 
  isWidget = false,
  placeholder = "Ask me anything...",
  maxLength = 1000 
}, ref) {
  const [inputMessage, setInputMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return
    
    onSendMessage(inputMessage.trim())
    setInputMessage('')
  }

  return (
    <div className={`flex-shrink-0 border-t border-gray-200 bg-white p-4 ${isWidget ? 'rounded-b-lg' : 'sticky bottom-0 z-10'}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            ref={ref}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50 rounded-full px-4"
            maxLength={maxLength}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full w-10 h-10 p-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
      
      {/* Footer info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>Powered by Lunie-Ai</span>
          {memoryInfo?.hasMemory && !isWidget && (
            <span>• Memory Active</span>
          )}
        </div>
        <span className={inputMessage.length > maxLength * 0.9 ? 'text-yellow-600' : ''}>
          {inputMessage.length}/{maxLength}
        </span>
      </div>
    </div>
  )
})
