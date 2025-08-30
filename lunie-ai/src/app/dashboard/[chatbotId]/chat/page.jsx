// import LoginForm from '@/components/auth/LoginForm'
'use client'

import React from 'react'
import ChatInterface from '@/components/chat/ChatInterface'
import { useParams } from 'next/navigation'


export default function ChatPage() {
  
  const params = useParams()
  const chatbotId = params?.chatbotId || '123'

  return <ChatInterface 
  chatbotId={chatbotId}  // ← Make sure this is set
  chatbot={{ name: "My Assistant" }}
/>
}