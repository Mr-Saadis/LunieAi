// src/components/chat/MessageBubble.jsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/utils/formatters'
import { 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react'

export function MessageBubble({ message, onRetry, isWidget = false }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      case 'failed':
        return <AlertTriangle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  const getConfidenceBadge = (confidence) => {
    if (!confidence) return null
    
    const percentage = Math.round(confidence * 100)
    let className = 'text-xs'
    
    if (confidence >= 0.8) {
      className += ' bg-green-100 text-green-700 border-green-200'
    } else if (confidence >= 0.6) {
      className += ' bg-yellow-100 text-yellow-700 border-yellow-200'
    } else {
      className += ' bg-red-100 text-red-700 border-red-200'
    }
    
    return (
      <Badge variant="outline" className={className}>
        {percentage}%
      </Badge>
    )
  }

  if (message.role === 'user') {
    return (
      <div className="w-full flex justify-end">
        <div className={`max-w-[75%] flex items-end gap-2 ${isWidget ? 'max-w-[90%]' : ''}`}>
          <div className="flex flex-col items-end">
            <div
              className={`px-4 py-2 rounded-2xl rounded-br-md max-w-full ${
                message.status === 'failed'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
            </div>
            
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <span>{formatTime(message.timestamp)}</span>
              {getStatusIcon(message.status)}
              {message.status === 'failed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1 text-red-500 hover:bg-red-50"
                  onClick={() => onRetry(message.id)}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-start">
      <div className={`max-w-[85%] flex items-start gap-3 ${isWidget ? 'max-w-[95%]' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl rounded-tl-md ${
              message.status === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
            }`}
          >
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>

            {/* Metadata badges */}
            {message.role === 'assistant' && message.metadata && (
              <div className="mt-3 flex flex-wrap gap-2">
                {getConfidenceBadge(message.metadata.confidence)}
                
                {message.metadata.chunks_used && (
                  <Badge variant="outline" className="text-xs">
                    {message.metadata.chunks_used} sources
                  </Badge>
                )}
                
                {message.metadata.processing_time && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {message.metadata.processing_time}ms
                  </Badge>
                )}

                {message.metadata.memory_enhanced && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    Memory
                  </Badge>
                )}
              </div>
            )}

            {/* Sources */}
            {message.sources?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-600 mb-2">
                  Sources ({message.sources.length})
                </h4>
                <div className="space-y-1">
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700 truncate">
                          {source.title || source.source}
                        </span>
                        <span className="text-gray-500">
                          {Math.round(source.score * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {source.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
