// src/components/widget/WidgetLoader.jsx
'use client'

import { useEffect, useState } from 'react'
import ChatWidget from './ChatWidget'

/**
 * Widget Loader for external websites
 * Handles initialization and configuration from embed script
 */
export function WidgetLoader({ embedConfig }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeWidget = async () => {
      try {
        // Validate required configuration
        if (!embedConfig?.chatbotId) {
          throw new Error('Chatbot ID is required')
        }

        // Fetch chatbot configuration from API
        const response = await fetch(`/api/widget/config/${embedConfig.chatbotId}`, {
          headers: {
            'Authorization': `Bearer ${embedConfig.apiKey || ''}`,
            'Origin': window.location.origin
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load widget configuration')
        }

        const widgetConfig = await response.json()
        setConfig(widgetConfig)
        setIsLoaded(true)
      } catch (err) {
        console.error('Widget initialization error:', err)
        setError(err.message)
      }
    }

    initializeWidget()
  }, [embedConfig])

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 max-w-xs z-50">
        <div className="font-medium">Widget Error</div>
        <div>{error}</div>
      </div>
    )
  }

  if (!isLoaded || !config) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    )
  }

  return (
    <ChatWidget
      chatbotId={embedConfig.chatbotId}
      config={config}
    />
  )
}
