
// src/components/widget/WidgetPage.jsx
'use client'

import { useEffect, useState } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'

/**
 * Standalone widget page component
 */
export default function WidgetPage({ chatbot }) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
      
      // Configure iframe resizing
      const resizeObserver = new ResizeObserver(() => {
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'WIDGET_RESIZE',
            height: document.body.scrollHeight
          }, '*')
        }
      })

      resizeObserver.observe(document.body)

      return () => resizeObserver.disconnect()
    }
  }, [])

  const widgetConfig = {
    ...chatbot.widget_config,
    showPoweredBy: true,
    maxHeight: '100%',
    maxWidth: '100%'
  }

  return (
    <div className="h-screen w-full">
      <ChatInterface
        chatbotId={chatbot.id}
        chatbot={chatbot}
        isWidget={true}
        widgetConfig={widgetConfig}
        className="h-full border-0 rounded-none"
      />
    </div>
  )
}