// // src/components/chat/ChatInterface.jsx 

// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { useMemoryChat } from '@/hooks/useMemoryChat'
// import { MemoryIndicator } from '@/components/chat/MemoryIndicator'

// import { 
//   Send, 
//   Bot, 
//   User, 
//   Loader2, 
//   Clock, 
//   CheckCircle2, 
//   AlertTriangle,
//   Brain,
//   Zap,
//   Target,
//   RefreshCw,
//   MessageSquare,
//   Sparkles
// } from 'lucide-react'
// import { toast } from 'sonner'

// export default function ChatInterface({ chatbotId, chatbot = null }) {
//   // State management
//   const [messages, setMessages] = useState([])
//   const [inputMessage, setInputMessage] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [conversationId, setConversationId] = useState(null)
//   const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
//   // Refs
//   const scrollAreaRef = useRef(null)
//   const inputRef = useRef(null)
//   const {
//     messages1,
//     conversationId1,
//     loading,
//     memoryInfo,
//     sendMessage1,
//     clearConversation
//   } = useMemoryChat(chatbotId)
  
//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight
//       }
//     }
//   }, [messages])

//   // Focus input on mount
//   useEffect(() => {
//     inputRef.current?.focus()
//   }, [])

//   /**
//    * Send message to RAG pipeline
//    */
//   const sendMessage = async (e) => {
//     e.preventDefault()
    
//     if (!inputMessage.trim() || isLoading) return
    
//     const userMessage = inputMessage.trim()
//     setInputMessage('')
//     setIsLoading(true)
    
//     // Add user message to UI immediately
//     const tempUserMessage = {
//       id: `temp_${Date.now()}`,
//       role: 'user',
//       content: userMessage,
//       timestamp: new Date().toISOString(),
//       status: 'sending'
//     }
    
//     setMessages(prev => [...prev, tempUserMessage])
    
//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           chatbotId,
//           conversationId,
//           context: {
//             sessionId,
//             metadata: {
//               userAgent: navigator.userAgent,
//               timestamp: new Date().toISOString()
//             }
//           }
//         }),
//       })
      
//       const data = await response.json()
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to send message')
//       }
      
//       // Update conversation ID if new
//       if (data.data.conversationId && !conversationId) {
//         setConversationId(data.data.conversationId)
//       }
      
//       // Replace temp user message and add AI response
//       setMessages(prev => {
//         const updated = prev.map(msg => 
//           msg.id === tempUserMessage.id 
//             ? { ...msg, status: 'delivered', id: `user_${Date.now()}` }
//             : msg
//         )
        
//         // Add AI response
//         updated.push({
//           id: data.data.messageId,
//           role: 'assistant',
//           content: data.data.message,
//           timestamp: new Date().toISOString(),
//           sources: data.data.sources || [],
//           metadata: data.data.metadata || {},
//           status: 'delivered'
//         })
        
//         return updated
//       })
      
//       // Show success feedback
//       if (data.data.metadata.confidence < 0.5) {
//         toast.warning('Response confidence is low. Consider rephrasing your question.')
//       }
      
//     } catch (error) {
//       console.error('Chat error:', error)
      
//       // Update user message status to failed
//       setMessages(prev => prev.map(msg => 
//         msg.id === tempUserMessage.id 
//           ? { ...msg, status: 'failed' }
//           : msg
//       ))
      
//       // Add error message
//       setMessages(prev => [...prev, {
//         id: `error_${Date.now()}`,
//         role: 'assistant',
//         content: `I apologize for the inconvenience. ${error.message}`,
//         timestamp: new Date().toISOString(),
//         status: 'error'
//       }])
      
//       toast.error('Failed to send message: ' + error.message)
//     } finally {
//       setIsLoading(false)
//       inputRef.current?.focus()
//     }
//   }

//   /**
//    * Retry failed message
//    */
//   const retryMessage = async (messageId) => {
//     const message = messages.find(m => m.id === messageId)
//     if (message) {
//       setInputMessage(message.content)
//       setMessages(prev => prev.filter(m => m.id !== messageId))
//     }
//   }

//   /**
//    * Format timestamp
//    */
//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString([], { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     })
//   }

//   /**
//    * Get status icon for message
//    */
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'sending':
//         return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
//       case 'delivered':
//         return <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
//       case 'failed':
//         return <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
//       default:
//         return null
//     }
//   }

//   /**
//    * Get confidence badge styling
//    */
//   const getConfidenceBadge = (confidence) => {
//     if (!confidence) return null
    
//     const percentage = Math.round(confidence * 100)
//     let className = 'text-xs'
    
//     if (confidence >= 0.8) {
//       className += ' bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
//     } else if (confidence >= 0.6) {
//       className += ' bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
//     } else {
//       className += ' bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
//     }
    
//     return (
//       <Badge variant="outline" className={className}>
//         {percentage}%
//       </Badge>
//     )
//   }

//   return (
//     <div className="h-screen flex flex-col bg-white">
//       {/* FIXED HEADER - Yahan fixed rahega */}
//       <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 sticky top-0 z-10">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] flex items-center justify-center">
//                 <Bot className="w-5 h-5 text-white" />
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white"></div>
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h2 className="font-semibold text-gray-900 text-sm">
//                   {chatbot?.name || 'My Assistant'}
//                 </h2>
//                 <Badge variant="outline" className="text-xs bg-[#94B9F9]/10 text-[#94B9F9] border-[#94B9F9]/20">
//                   RAG Enabled
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
//                 <span>Connected • Session: {sessionId.substring(5, 15)}</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="text-right text-xs text-gray-500">
//             {conversationId && (
//               <div>ID: {conversationId.substring(0, 8)}...</div>
//             )}
//           </div>
//         </div>

//         {/* Conversation Status */}
//         <div className="mt-3 flex items-center gap-2">
//           <Clock className="w-4 h-4 text-gray-400" />
//           <span className="text-xs text-gray-600">Conversation active</span>
//           {memoryInfo.hasMemory && (
//             <>
//               <span className="text-gray-300">•</span>
//               <Brain className="w-4 h-4 text-[#F4CAF7]" />
//               <span className="text-xs text-gray-600">Memory enabled</span>
//             </>
//           )}
//         </div>
//       </div>

//       {/* SCROLLABLE MESSAGES AREA - Sirf yahan scroll hoga */}
//       <div className="flex-1 overflow-hidden bg-gray-50">
//         <ScrollArea ref={scrollAreaRef} className="h-full">
//           <div className="p-4 space-y-4 min-h-full">
//             {/* Welcome Message */}
//             {messages.length === 0 && (
//               <div className="text-center py-8">
//                 <div className="w-16 h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-full flex items-center justify-center mx-auto mb-4">
//                   <MessageSquare className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2">
//                   Welcome to {chatbot?.name || 'AI Assistant'}
//                 </h3>
//                 <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
//                   I'm here to help you find information from our knowledge base. 
//                   Ask me anything, and I'll provide accurate answers with sources.
//                 </p>
//               </div>
//             )}

//             {/* Messages */}
//             {messages.map((message) => (
//               <div key={message.id} className="flex items-start space-y-0">
//                 {message.role === 'user' ? (
//                   // USER MESSAGE (Right aligned)
//                   <div className="w-full flex justify-end">
//                     <div className="max-w-[75%] flex items-end gap-2">
//                       <div className="flex flex-col items-end">
//                         {/* Message bubble */}
//                         <div
//                           className={`px-4 py-2 rounded-2xl rounded-br-md max-w-full ${
//                             message.status === 'failed'
//                               ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
//                               : 'bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white'
//                           }`}
//                         >
//                           <p className="text-sm leading-relaxed break-words">
//                             {message.content}
//                           </p>
//                         </div>
                        
//                         {/* Message footer */}
//                         <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
//                           <span>{formatTime(message.timestamp)}</span>
//                           {getStatusIcon(message.status)}
//                           {message.status === 'failed' && (
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="text-xs h-auto p-1 text-[#EF4444] hover:bg-[#EF4444]/10"
//                               onClick={() => retryMessage(message.id)}
//                             >
//                               <RefreshCw className="w-3 h-3" />
//                             </Button>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* User avatar */}
//                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
//                         <User className="w-4 h-4 text-gray-600" />
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // ASSISTANT MESSAGE (Left aligned)
//                   <div className="w-full flex justify-start">
//                     <div className="max-w-[85%] flex items-start gap-3">
//                       {/* Bot avatar */}
//                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] flex items-center justify-center flex-shrink-0">
//                         <Bot className="w-4 h-4 text-white" />
//                       </div>
                      
//                       <div className="flex flex-col">
//                         {/* Message bubble */}
//                         <div
//                           className={`px-4 py-3 rounded-2xl rounded-tl-md ${
//                             message.status === 'error'
//                               ? 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'
//                               : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
//                           }`}
//                         >
//                           <p className="text-sm leading-relaxed break-words">
//                             {message.content}
//                           </p>

//                           {/* Metadata badges */}
//                           {message.role === 'assistant' && message.metadata && (
//                             <div className="mt-3 flex flex-wrap gap-2">
//                               {getConfidenceBadge(message.metadata.confidence)}
                              
//                               {message.metadata.chunks_used && (
//                                 <Badge variant="outline" className="text-xs">
//                                   {message.metadata.chunks_used} sources
//                                 </Badge>
//                               )}
                              
//                               {message.metadata.processing_time && (
//                                 <Badge variant="outline" className="text-xs">
//                                   <Clock className="w-3 h-3 mr-1" />
//                                   {message.metadata.processing_time}ms
//                                 </Badge>
//                               )}

//                               {message.metadata.memory_enhanced && (
//                                 <Badge variant="outline" className="text-xs bg-[#F4CAF7]/10 text-[#F4CAF7] border-[#F4CAF7]/20">
//                                   Memory
//                                 </Badge>
//                               )}
//                             </div>
//                           )}

//                           {/* Sources */}
//                           {message.sources?.length > 0 && (
//                             <div className="mt-3 pt-3 border-t border-gray-100">
//                               <h4 className="text-xs font-medium text-gray-600 mb-2">
//                                 Sources ({message.sources.length})
//                               </h4>
//                               <div className="space-y-1">
//                                 {message.sources.map((source, idx) => (
//                                   <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
//                                     <div className="flex items-center justify-between mb-1">
//                                       <span className="font-medium text-gray-700 truncate">
//                                         {source.title || source.source}
//                                       </span>
//                                       <span className="text-gray-500">
//                                         {Math.round(source.score * 100)}%
//                                       </span>
//                                     </div>
//                                     <p className="text-gray-600 line-clamp-2">
//                                       {source.excerpt}
//                                     </p>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         {/* Message footer */}
//                         <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
//                           <span>{formatTime(message.timestamp)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* Typing Indicator */}
//             {isLoading && (
//               <div className="w-full flex justify-start">
//                 <div className="flex items-start gap-3">
//                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] flex items-center justify-center">
//                     <Bot className="w-4 h-4 text-white" />
//                   </div>
//                   <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="flex gap-1">
//                         <div className="w-2 h-2 bg-[#94B9F9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                         <div className="w-2 h-2 bg-[#F4CAF7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                         <div className="w-2 h-2 bg-[#FB8A8F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                       </div>
//                       <span className="text-xs text-gray-500">Thinking...</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Extra space at bottom for better scrolling */}
//             <div className="h-4"></div>
//           </div>
//         </ScrollArea>
//       </div>

//       {/* FIXED FOOTER - Yahan bhi fixed rahega */}
//       <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 sticky bottom-0 z-10">
//         <form onSubmit={sendMessage} className="flex items-center gap-3">
//           <div className="flex-1 relative">
//             <Input
//               ref={inputRef}
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               placeholder="Ask me anything..."
//               disabled={isLoading}
//               className="border-gray-200 focus:border-[#94B9F9] focus:ring-[#94B9F9]/20 bg-gray-50 rounded-full px-4"
//               maxLength={1000}
//             />
//           </div>
//           <Button
//             type="submit"
//             disabled={isLoading || !inputMessage.trim()}
//             size="sm"
//             className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white border-0 rounded-full w-10 h-10 p-0"
//           >
//             {isLoading ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Send className="w-4 h-4" />
//             )}
//           </Button>
//         </form>
        
//         {/* Footer info */}
//         <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
//           <div className="flex items-center gap-3">
//             <span>Powered by Lunie-Ai</span>
//             {memoryInfo.hasMemory && (
//               <span>• Memory Active</span>
//             )}
//           </div>
//           <span className={inputMessage.length > 900 ? 'text-[#F59E0B]' : ''}>
//             {inputMessage.length}/1000
//           </span>
//         </div>
//       </div>
//     </div>
//   )
// }



// src/components/chat/ChatInterface.jsx 
'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMemoryChat } from '@/hooks/useMemoryChat'
import { MemoryIndicator } from '@/components/chat/MemoryIndicator'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInput } from '@/components/chat/ChatInput'
import { WelcomeMessage } from '@/components/chat/WelcomeMessage'
import { useChat } from '@/hooks/useChat'
import { chatService } from '@/services/chatService'
import { generateSessionId } from '@/utils/helpers'
import { toast } from 'sonner'

import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'

// Component Props Interface
const ChatInterfaceProps = {
  chatbotId: String,
  chatbot: Object,
  isWidget: Boolean,
  onClose: Function,
  widgetConfig: Object,
  className: String
}

/**
 * Enhanced Chat Interface with improved architecture
 * Supports both dashboard and embeddable widget modes
 */
export default function ChatInterface({ 
  chatbotId, 
  chatbot = null, 
  isWidget = false,
  onClose,
  widgetConfig = {},
  className = ""
}) {
  // Custom hook for chat state management
  const {
    messages,
    isLoading,
    conversationId,
    sessionId,
    sendMessage: sendChatMessage,
    retryMessage,
    clearMessages,
    error: chatError
  } = useChat(chatbotId)

  // Memory chat hook (keeping for backward compatibility)
  const {
    messages: memoryMessages,
    conversationId: memoryConversationId,
    loading: memoryLoading,
    memoryInfo,
    sendMessage: sendMemoryMessage,
    clearConversation
  } = useMemoryChat(chatbotId)

  // Refs for DOM elements
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)
  const messageEndRef = useRef(null)

  // Computed values
  const displayMessages = useMemo(() => {
    return messages.length > 0 ? messages : memoryMessages
  }, [messages, memoryMessages])

  const isProcessing = useMemo(() => {
    return isLoading || memoryLoading
  }, [isLoading, memoryLoading])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [displayMessages, scrollToBottom])

  // Focus input on mount
  useEffect(() => {
    if (!isWidget && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isWidget])

  // Handle message sending with improved error handling
  const handleSendMessage = useCallback(async (messageContent) => {
    if (!messageContent.trim() || isProcessing) return

    try {
      const success = await sendChatMessage(messageContent)
      
      if (!success && chatError) {
        toast.error(`Failed to send message: ${chatError}`)
      }
    } catch (error) {
      console.error('Message send error:', error)
      toast.error('An unexpected error occurred')
    }
  }, [sendChatMessage, isProcessing, chatError])

  // Handle message retry
  const handleRetryMessage = useCallback(async (messageId) => {
    try {
      await retryMessage(messageId)
    } catch (error) {
      console.error('Retry error:', error)
      toast.error('Failed to retry message')
    }
  }, [retryMessage])

  // Clear conversation handler
  const handleClearConversation = useCallback(() => {
    clearMessages()
    clearConversation()
    toast.success('Conversation cleared')
  }, [clearMessages, clearConversation])

  // Widget-specific styling
  const containerClasses = useMemo(() => {
    const baseClasses = "flex flex-col bg-white"
    const widgetClasses = isWidget 
      ? "h-[500px] w-[350px] rounded-lg shadow-lg border border-gray-200" 
      : "h-screen"
    return `${baseClasses} ${widgetClasses} ${className}`
  }, [isWidget, className])

  return (
    <div className={containerClasses}>
      {/* Header Component */}
      <ChatHeader 
        chatbot={chatbot}
        sessionId={sessionId}
        conversationId={conversationId}
        memoryInfo={memoryInfo}
        isWidget={isWidget}
        onClose={onClose}
        onClear={handleClearConversation}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-4 min-h-full">
            {/* Welcome Message */}
            {displayMessages.length === 0 && (
              <WelcomeMessage 
                chatbot={chatbot}
                isWidget={isWidget}
              />
            )}

            {/* Message List */}
            {displayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={handleRetryMessage}
                isWidget={isWidget}
              />
            ))}

            {/* Typing Indicator */}
            {isProcessing && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messageEndRef} />

            {/* Extra space for better scrolling */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Component */}
      <ChatInput
        ref={inputRef}
        onSendMessage={handleSendMessage}
        isLoading={isProcessing}
        memoryInfo={memoryInfo}
        isWidget={isWidget}
        placeholder={widgetConfig.placeholder || "Ask me anything..."}
        maxLength={widgetConfig.maxLength || 1000}
      />
    </div>
  )
}