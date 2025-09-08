// src/components/chat/MemoryIndicator.jsx - NEW COMPONENT
/**
 * 🧠 Memory Indicator Component - NEW
 * Shows memory status in your existing chat interface
 */

// import React from 'react'
// import { Badge } from '@/components/ui/badge'
// import { Brain, Clock, MessageSquare } from 'lucide-react'

// src/components/chat/MemoryIndicator.jsx - NEW COMPONENT
/**
 * 🧠 Memory Indicator Component - NEW
 * Shows memory status in your existing chat interface
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Brain, Clock, MessageSquare } from 'lucide-react'

export function MemoryIndicator({ 
  hasMemory = false,
  memoryLength = 0,
  messageCount = 0,
  conversationId = null,
  className = ''
}) {
  if (!hasMemory && !conversationId) {
    return null
  }

  const formatMemorySize = (length) => {
    if (length > 1000) {
      return `${Math.round(length / 1000)}k chars`
    }
    return `${length} chars`
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      {hasMemory && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Brain className="w-3 h-3" />
          Memory: {formatMemorySize(memoryLength)}
        </Badge>
      )}
      
      {messageCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {messageCount} messages
        </Badge>
      )}
      
      {conversationId && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Conversation active
        </Badge>
      )}
    </div>
  )
}

export default MemoryIndicator
