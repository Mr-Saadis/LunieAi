// src/components/widget/ChatWidget.jsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ChatInterface from '@/components/chat/ChatInterface'
import { MessageSquare, X, Minimize2 } from 'lucide-react'

/**
 * Embeddable Chat Widget for websites
 * Features: floating button, expandable chat, mobile responsive
 */
export default function ChatWidget({ 
  chatbotId,
  config = {},
  onClose 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  // Default configuration
  const widgetConfig = {
    position: 'bottom-right',
    theme: 'default',
    primaryColor: '#3B82F6',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    showPoweredBy: true,
    maxHeight: '500px',
    maxWidth: '400px',
    ...config
  }

  // Position classes
  const getPositionClasses = () => {
    switch (widgetConfig.position) {
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  // Handle chat toggle
  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false)
      setIsMinimized(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
      setHasNewMessage(false)
    }
  }

  // Handle minimize
  const minimizeChat = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  // Handle close completely
  const closeWidget = () => {
    setIsMinimized(false)
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  // Handle new messages when minimized
  useEffect(() => {
    if (isMinimized || !isOpen) {
      // This would be triggered by message events
      // For now, we'll simulate it
      const timer = setTimeout(() => {
        if (!isOpen) {
          setHasNewMessage(true)
        }
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isMinimized, isOpen])

  // Custom styles based on config
  const customStyles = {
    '--widget-primary-color': widgetConfig.primaryColor,
    '--widget-max-height': widgetConfig.maxHeight,
    '--widget-max-width': widgetConfig.maxWidth,
  }

  return (
    <div 
      className={`fixed z-50 ${getPositionClasses()}`}
      style={customStyles}
    >
      {/* Chat Interface */}
      {isOpen && !isMinimized && (
        <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
          <div 
            className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
            style={{ 
              height: widgetConfig.maxHeight,
              width: widgetConfig.maxWidth,
              maxHeight: '90vh',
              maxWidth: '90vw'
            }}
          >
            <ChatInterface
              chatbotId={chatbotId}
              isWidget={true}
              widgetConfig={widgetConfig}
              onClose={minimizeChat}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Minimized Chat Bar */}
      {isMinimized && (
        <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between" onClick={toggleChat}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: widgetConfig.primaryColor }}
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Chat Assistant</div>
                  <div className="text-xs text-gray-500">Click to continue...</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  closeWidget()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-0"
        style={{ 
          backgroundColor: widgetConfig.primaryColor,
          color: 'white'
        }}
      >
        {/* New message indicator */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>

      {/* Powered by (if enabled) */}
      {widgetConfig.showPoweredBy && (isOpen || isMinimized) && (
        <div className="mt-2 text-center">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Powered by Lunie-Ai
          </a>
        </div>
      )}
    </div>
  )
}