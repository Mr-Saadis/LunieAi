// src/components/testing/QuickTests.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { 
  getCurrentUserWithProfile,
  getUserChatbots,
  getDashboardStats,
  getChatbotById
} from '@/lib/supabase/queries'
import { 
  createChatbot,
  updateUserProfile,
  updateChatbot
} from '@/lib/supabase/mutations'

export function QuickUserTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const testUserOperations = async () => {
    setLoading(true)
    try {
      const { user, profile } = await getCurrentUserWithProfile()
      setResult({ user, profile })
      toast.success('✅ User operations work!')
    } catch (error) {
      toast.error('❌ User test failed: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick User Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testUserOperations} disabled={loading}>
          {loading ? 'Testing...' : 'Test User Operations'}
        </Button>
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <div><strong>User ID:</strong> {result.user.id}</div>
            <div><strong>Email:</strong> {result.user.email}</div>
            <div><strong>Name:</strong> {result.profile.full_name}</div>
            <div><strong>Plan:</strong> {result.profile.subscription_plan}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QuickChatbotTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const testChatbotOperations = async () => {
    setLoading(true)
    try {
      const { user } = await getCurrentUserWithProfile()
      
      // Create test chatbot
      const chatbot = await createChatbot(user.id, {
        name: `Quick Test Bot ${Date.now()}`,
        description: 'A quick test chatbot',
        instructions: 'You are a helpful assistant.'
      })
      
      // Get user chatbots
      const { chatbots } = await getUserChatbots(user.id)
      
      setResult({ created: chatbot, total: chatbots.length })
      toast.success('✅ Chatbot operations work!')
    } catch (error) {
      toast.error('❌ Chatbot test failed: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Chatbot Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testChatbotOperations} disabled={loading}>
          {loading ? 'Testing...' : 'Test Chatbot Creation'}
        </Button>
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <div><strong>Created:</strong> {result.created.name}</div>
            <div><strong>ID:</strong> {result.created.id}</div>
            <div><strong>Total Chatbots:</strong> {result.total}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QuickStatsTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const testStats = async () => {
    setLoading(true)
    try {
      const { user } = await getCurrentUserWithProfile()
      const stats = await getDashboardStats(user.id)
      setResult(stats)
      toast.success('✅ Stats operations work!')
    } catch (error) {
      toast.error('❌ Stats test failed: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testStats} disabled={loading}>
          {loading ? 'Testing...' : 'Test Dashboard Stats'}
        </Button>
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm space-y-1">
            <div><strong>Chatbots:</strong> {result.totalChatbots}</div>
            <div><strong>Conversations:</strong> {result.totalConversations}</div>
            <div><strong>Messages:</strong> {result.totalMessages}</div>
            <div><strong>Training Data:</strong> {result.totalTrainingData}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ErrorHandlingTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const testErrorHandling = async () => {
    setLoading(true)
    const testResults = []

    // Test 1: Not Found Error
    try {
      await getChatbotById('non-existent-id', 'fake-user-id')
      testResults.push({ test: 'Not Found Error', status: 'failed', message: 'Should have thrown error' })
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        testResults.push({ test: 'Not Found Error', status: 'passed', message: 'Correctly threw not found error' })
      } else {
        testResults.push({ test: 'Not Found Error', status: 'failed', message: error.message })
      }
    }

    // Test 2: Validation Error
    try {
      const { user } = await getCurrentUserWithProfile()
      await updateChatbot('fake-id', user.id, { name: '' }) // Empty name should fail
      testResults.push({ test: 'Validation Error', status: 'failed', message: 'Should have thrown validation error' })
    } catch (error) {
      if (error.message.includes('characters') || error.message.includes('required')) {
        testResults.push({ test: 'Validation Error', status: 'passed', message: 'Correctly threw validation error' })
      } else {
        testResults.push({ test: 'Validation Error', status: 'partial', message: `Different error: ${error.message}` })
      }
    }

    // Test 3: Permission Error (trying to access someone else's data)
    try {
      await getChatbotById('real-but-not-owned-id', 'different-user-id')
      testResults.push({ test: 'Permission Error', status: 'failed', message: 'Should have thrown permission error' })
    } catch (error) {
      testResults.push({ test: 'Permission Error', status: 'passed', message: 'Correctly prevented unauthorized access' })
    }

    setResults(testResults)
    setLoading(false)

    const passed = testResults.filter(r => r.status === 'passed').length
    const total = testResults.length
    
    if (passed === total) {
      toast.success(`✅ All ${total} error handling tests passed!`)
    } else {
      toast.warning(`⚠️ ${passed}/${total} error handling tests passed`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Handling Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testErrorHandling} disabled={loading}>
          {loading ? 'Testing...' : 'Test Error Handling'}
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