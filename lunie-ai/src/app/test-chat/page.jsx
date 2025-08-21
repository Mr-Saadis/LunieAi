'use client'

import { useState } from 'react'

export default function TestChatPage() {
  const [chatbotId, setChatbotId] = useState('')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const testChat = async () => {
    if (!message.trim() || !chatbotId.trim()) {
      alert('Please enter both message and chatbot ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chatbotId })
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Chat API</h1>
      
      <div>
        <label className="block font-medium mb-2">Chatbot ID:</label>
        <input
          className="w-full p-2 border rounded"
          value={chatbotId}
          onChange={(e) => setChatbotId(e.target.value)}
          placeholder="Enter your chatbot ID"
        />
      </div>
      
      <div>
        <label className="block font-medium mb-2">Message:</label>
        <input
          className="w-full p-2 border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hello! How are you?"
        />
      </div>
      
      <button
        onClick={testChat}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Chat'}
      </button>
      
      {response && (
        <div>
          <label className="block font-medium mb-2">Response:</label>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {response}
          </pre>
        </div>
      )}
    </div>
  )
}