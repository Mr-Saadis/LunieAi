// components/LunieAiWidget.js
'use client'

import { useEffect } from 'react'

export default function LunieAiWidget({ chatbotId, config = {} }) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Widget configuration
    window.LunieAiConfig = {
      chatbotId: chatbotId,
      domain: window.location.origin,
      apiUrl: 'https://lunie-ai.vercel.app',
      position: 'bottom-right',
      primaryColor: '#3B82F6',
      welcomeMessage: 'Hi! Kaise help kar sakta hun?',
      ...config
    }

    // Script load kare
    const script = document.createElement('script')
    script.src = `${window.LunieAiConfig.apiUrl}/widget.js`
    script.async = true
    script.onload = () => {
      if (window.LunieAiWidget) {
        window.LunieAiWidget.init(window.LunieAiConfig)
      }
    }
    document.head.appendChild(script)

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[src*="widget.js"]')
      if (existingScript) existingScript.remove()
      
      const widgetContainer = document.getElementById('lunieai-widget-container')
      if (widgetContainer) widgetContainer.remove()
    }
  }, [chatbotId, config])

  return null
}