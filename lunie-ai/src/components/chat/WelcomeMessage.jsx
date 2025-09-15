
// src/components/chat/WelcomeMessage.jsx
'use client'

import { MessageSquare } from 'lucide-react'

export function WelcomeMessage({ chatbot, isWidget = false }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">
        Welcome to {chatbot?.name || 'AI Assistant'}
      </h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
        {isWidget 
          ? "Hi! I'm here to help answer your questions. What can I assist you with today?"
          : "I'm here to help you find information from our knowledge base. Ask me anything, and I'll provide accurate answers with sources."
        }
      </p>
    </div>
  )
}
