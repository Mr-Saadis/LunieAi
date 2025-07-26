
// src/components/testing/RLSTestComponent.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function RLSSecurityTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const testRLSSecurity = async () => {
    setLoading(true)
    const supabase = createClient()
    const testResults = []

    try {
      // Test 1: User can only see their own profile
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')

      if (profileError) {
        testResults.push({ test: 'Profile RLS', status: 'failed', message: profileError.message })
      } else if (profiles.length === 1) {
        testResults.push({ test: 'Profile RLS', status: 'passed', message: 'Can only see own profile' })
      } else {
        testResults.push({ test: 'Profile RLS', status: 'failed', message: `Seeing ${profiles.length} profiles, should see 1` })
      }

      // Test 2: User can only see their own chatbots
      const { data: chatbots, error: chatbotError } = await supabase
        .from('chatbots')
        .select('*')

      if (chatbotError) {
        testResults.push({ test: 'Chatbot RLS', status: 'failed', message: chatbotError.message })
      } else {
        testResults.push({ test: 'Chatbot RLS', status: 'passed', message: `Can see ${chatbots.length} chatbots (user's own)` })
      }

      // Test 3: Try to access training data (should only see user's)
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_data')
        .select('*')

      if (trainingError) {
        testResults.push({ test: 'Training Data RLS', status: 'failed', message: trainingError.message })
      } else {
        testResults.push({ test: 'Training Data RLS', status: 'passed', message: `Can see ${trainingData.length} training items` })
      }

      // Test 4: Try to access conversations (should only see user's)
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')

      if (convError) {
        testResults.push({ test: 'Conversation RLS', status: 'failed', message: convError.message })
      } else {
        testResults.push({ test: 'Conversation RLS', status: 'passed', message: `Can see ${conversations.length} conversations` })
      }

    } catch (error) {
      testResults.push({ test: 'RLS General', status: 'failed', message: error.message })
    }

    setResults(testResults)
    setLoading(false)

    const passed = testResults.filter(r => r.status === 'passed').length
    const total = testResults.length
    
    if (passed === total) {
      toast.success(`✅ All ${total} RLS security tests passed!`)
    } else {
      toast.error(`❌ ${passed}/${total} RLS security tests passed`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RLS Security Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testRLSSecurity} disabled={loading}>
          {loading ? 'Testing...' : 'Test RLS Security'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded text-sm ${
                  result.status === 'passed' ? 'bg-green-50 border border-green-200' :
                  result.status === 'failed' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="font-medium">{result.test}</div>
                <div className="text-xs mt-1">{result.message}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}