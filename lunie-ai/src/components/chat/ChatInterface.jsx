// src/components/chat/ChatInterface.jsx
/**
 * 💬 Chat Interface Component
 * Real-time chat with RAG-powered responses
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'

export default function ChatInterface({ chatbotId, chatbot = null }) {
  // State management
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  // Refs
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  /**
   * Send message to RAG pipeline
   */
  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return
    
    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    
    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }
    
    setMessages(prev => [...prev, tempUserMessage])
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatbotId,
          conversationId,
          context: {
            sessionId,
            metadata: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      // Update conversation ID if new
      if (data.data.conversationId && !conversationId) {
        setConversationId(data.data.conversationId)
      }
      
      // Replace temp user message and add AI response
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === tempUserMessage.id 
            ? { ...msg, status: 'delivered', id: `user_${Date.now()}` }
            : msg
        )
        
        // Add AI response
        updated.push({
          id: data.data.messageId,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          sources: data.data.sources || [],
          metadata: data.data.metadata || {},
          status: 'delivered'
        })
        
        return updated
      })
      
      // Show success feedback
      if (data.data.metadata.confidence < 0.5) {
        toast.warning('I\'m not very confident about this answer. You might want to rephrase your question.')
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      
      // Update user message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ))
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
        status: 'error'
      }])
      
      toast.error('Failed to send message: ' + error.message)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  /**
   * Retry failed message
   */
  const retryMessage = async (messageId) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setInputMessage(message.content)
      // Remove failed message
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  /**
   * Format timestamp
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  /**
   * Get status icon for message
   */
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

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span>{chatbot?.name || 'AI Assistant'}</span>
          <Badge variant="secondary" className="ml-auto">
            RAG Enabled
          </Badge>
        </CardTitle>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connected • Session: {sessionId.substring(5, 15)}</span>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    👋 Hello! I'm {chatbot?.name || 'your AI assistant'}.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    I can help answer questions based on the training data provided. 
                    Just ask me anything!
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gray-100'
                      : message.status === 'error'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className={`w-4 h-4 ${
                      message.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? message.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-600 text-white'
                        : message.status === 'error'
                        ? 'bg-red-50 border-red-200 border'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Sources (for AI messages) */}
                    {message.role === 'assistant' && message.sources?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Sources used:
                        </p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-white/50 rounded p-2 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {source.title || source.source}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(source.score * 100)}%
                                </Badge>
                              </div>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {source.excerpt}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata (for AI messages) */}
                    {message.role === 'assistant' && message.metadata && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        {message.metadata.confidence && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              message.metadata.confidence > 0.8 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : message.metadata.confidence > 0.5
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {Math.round(message.metadata.confidence * 100)}% confidence
                          </Badge>
                        )}
                        {message.metadata.chunks_used && (
                          <span>{message.metadata.chunks_used} sources</span>
                        )}
                        {message.metadata.processing_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {message.metadata.processing_time}ms
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Footer */}
                  <div
                    className={`mt-1 flex items-center gap-2 text-xs text-gray-500 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    {getStatusIcon(message.status)}
                    
                    {/* Retry button for failed messages */}
                    {message.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-1"
                        onClick={() => retryMessage(message.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          
          {/* Input Footer */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              Powered by RAG • {inputMessage.length}/1000 characters
            </span>
            {conversationId && (
              <span>
                Conversation: {conversationId.substring(0, 8)}...
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}