
// src/components/chat/ChatHeader.jsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Clock, 
  Brain, 
  X, 
  Trash2,
  Minimize2
} from 'lucide-react'

export function ChatHeader({ 
  chatbot, 
  sessionId, 
  conversationId, 
  memoryInfo, 
  isWidget = false,
  onClose,
  onClear 
}) {
  return (
    <div className={`flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 ${isWidget ? 'rounded-t-lg' : 'sticky top-0 z-10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 text-sm truncate">
                {chatbot?.name || 'AI Assistant'}
              </h2>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                RAG Enabled
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="truncate">
                Connected • {isWidget ? 'Widget' : `Session: ${sessionId?.substring(5, 15)}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!isWidget && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isWidget && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">Conversation active</span>
        {memoryInfo?.hasMemory && (
          <>
            <span className="text-gray-300">•</span>
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Memory enabled</span>
          </>
        )}
        {conversationId && !isWidget && (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">ID: {conversationId.substring(0, 8)}...</span>
          </>
        )}
      </div>
    </div>
  )
}
