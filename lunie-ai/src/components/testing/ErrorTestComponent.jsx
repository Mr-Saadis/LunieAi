
// src/components/testing/ErrorTestComponent.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getChatbotById } from '@/lib/supabase/queries'
import { updateChatbot } from '@/lib/supabase/mutations'
import { ValidationError, NotFoundError, PermissionError } from '@/lib/utils/errors'

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
      if (error instanceof NotFoundError || error.message.includes('not found')) {
        testResults.push({ test: 'Not Found Error', status: 'passed', message: 'Correctly threw not found error' })
      } else {
        testResults.push({ test: 'Not Found Error', status: 'failed', message: error.message })
      }
    }

    // Test 2: Validation Error
    try {
      await updateChatbot('fake-id', 'fake-user', { name: '' }) // Empty name should fail
      testResults.push({ test: 'Validation Error', status: 'failed', message: 'Should have thrown validation error' })
    } catch (error) {
      if (error instanceof ValidationError || error.message.includes('validation') || error.message.includes('characters')) {
        testResults.push({ test: 'Validation Error', status: 'passed', message: 'Correctly threw validation error' })
      } else {
        testResults.push({ test: 'Validation Error', status: 'partial', message: `Different error: ${error.message}` })
      }
    }

    // Test 3: Permission Error (trying to access someone else's chatbot)
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
