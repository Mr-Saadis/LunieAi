// src/components/chat/MemoryChatInterface.jsx - NEW COMPONENT
/**
 * 💬 Memory Chat Interface - NEW
 * A ready-to-use chat component with memory built-in
 * Use this instead of your existing chat component to get memory features
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw,
  Trash2,
  AlertCircle,
  Brain
} from 'lucide-react'
import { useMemoryChat } from '@/hooks/useMemoryChat'
import { MemoryIndicator } from './MemoryIndicator'

export function MemoryChatInterface({ 
  chatbotId, 
  chatbotConfig = {},
  onMessageSent,
  className = '',
  showMemoryIndicator = true
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const {
    messages,
    conversationId,
    loading,
    error,
    memoryInfo,
    sendMessage,
    clearConversation,
    hasActiveConversation
  } = useMemoryChat(chatbotId, {
    persistConversation: true,
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const result = await sendMessage(input)
    setInput('')
    
    // Callback for parent component
    if (onMessageSent && result.success) {
      onMessageSent(result)
    }
    
    // Focus back to input
    inputRef.current?.focus()
  }

  const handleClearConversation = async () => {
    if (confirm('Clear this conversation? This will start a new conversation with memory.')) {
      await clearConversation()
    }
  }

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header with Memory Indicator */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            {chatbotConfig.name || 'AI Assistant'}
            {memoryInfo.hasMemory && (
              <Brain className="w-4 h-4 text-blue-500" />
            )}
          </CardTitle>
          <Button 
            onClick={handleClearConversation} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Memory Status */}
        {showMemoryIndicator && (
          <MemoryIndicator
            hasMemory={memoryInfo.hasMemory}
            memoryLength={memoryInfo.memoryLength}
            messageCount={memoryInfo.messageCount}
            conversationId={conversationId}
            className="mt-2"
          />
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">
                  {chatbotConfig.welcome_message || 'Hello! How can I help you today?'}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  I'll remember our conversation to provide better assistance.
                </p>
                {chatbotConfig.suggested_messages && chatbotConfig.suggested_messages.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {chatbotConfig.suggested_messages.slice(0, 3).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(suggestion)}
                        disabled={loading}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble */}
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Message metadata */}
                  <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.role === 'assistant' && (
                      <>
                        {message.confidence && (
                          <span className="text-green-600">
                            {Math.round(message.confidence * 100)}% confident
                          </span>
                        )}
                        {message.memoryContext > 0 && (
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            {message.memoryContext > 1000 ? `${Math.round(message.memoryContext/1000)}k` : message.memoryContext}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Sources ({message.sources.length})
                        </summary>
                        <div className="mt-1 space-y-1 pl-4">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              <span className="font-medium">{source.title || source.source}</span>
                              {source.score && (
                                <span className="ml-2">({Math.round(source.score * 100)}% relevant)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                <Button onClick={retryLastMessage} variant="ghost" size="sm" className="ml-auto">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t p-4 bg-background/95 backdrop-blur">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
              autoComplete="off"
              maxLength={1000}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Memory context indicator */}
          {hasActiveConversation && (
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
              <Brain className="w-3 h-3" />
              <span>Conversation memory active - I remember our discussion</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MemoryChatInterface