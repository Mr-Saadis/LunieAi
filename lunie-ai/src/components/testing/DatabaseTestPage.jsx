'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/ui/PageHeader'
import { toast } from 'sonner'
import { 
  Database, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Bot,
  FileText,
  MessageCircle,
  User,
  Trash2,
  RefreshCw
} from 'lucide-react'

// Import all our database functions
import {
  getUserProfile,
  getCurrentUser,
  getCurrentUserWithProfile,
  getUserChatbots,
  getChatbotById,
  getDashboardStats,
  getTrainingData,
  getConversations
} from '@/lib/supabase/queries'

import {
  updateUserProfile,
  createChatbot,
  updateChatbot,
  deleteChatbot,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
  createQAPair,
  updateQAPair,
  deleteQAPair
} from '@/lib/supabase/mutations'

export default function DatabaseTestPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    chatbotName: 'Test Bot',
    chatbotDescription: 'A test chatbot for database testing',
    trainingTitle: 'Test Training Data',
    trainingContent: 'This is test content for training the chatbot.',
    qaQuestion: 'What is this test about?',
    qaAnswer: 'This is a test to verify database operations work correctly.'
  })

  const supabase = createClient()

  useEffect(() => {
    const initUser = async () => {
      try {
        const { user, profile } = await getCurrentUserWithProfile()
        setUser(user)
        setProfile(profile)
      } catch (error) {
        console.error('Failed to get user:', error)
      }
    }
    initUser()
  }, [])

  const runTest = async (testName, testFunction) => {
    setTestResults(prev => ({ ...prev, [testName]: { status: 'running' } }))
    
    try {
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'success', 
          result,
          duration: `${duration}ms`
        } 
      }))
      
      toast.success(`✅ ${testName} passed`)
      return result
    } catch (error) {
      console.error(`Test ${testName} failed:`, error)
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          error: error.message,
          duration: 'Failed'
        } 
      }))
      
      toast.error(`❌ ${testName} failed: ${error.message}`)
      throw error
    }
  }

  // Test Functions
  const testUserQueries = async () => {
    const tests = [
      ['Get Current User', () => getCurrentUser()],
      ['Get User Profile', () => getUserProfile(user.id)],
      ['Get User with Profile', () => getCurrentUserWithProfile()],
      ['Get Dashboard Stats', () => getDashboardStats(user.id)]
    ]

    const results = {}
    for (const [name, testFn] of tests) {
      results[name] = await runTest(name, testFn)
    }
    return results
  }

  const testProfileUpdate = async () => {
    const originalName = profile.full_name
    const testName = `Test User ${Date.now()}`
    
    // Update profile
    await runTest('Update Profile', () => updateUserProfile(user.id, {
      full_name: testName
    }))
    
    // Verify update
    const updatedProfile = await runTest('Verify Profile Update', () => getUserProfile(user.id))
    
    // Restore original name
    await runTest('Restore Profile', () => updateUserProfile(user.id, {
      full_name: originalName
    }))
    
    return { testName, updatedProfile }
  }

  const testChatbotOperations = async () => {
    let createdChatbot = null
    
    try {
      // Create chatbot
      createdChatbot = await runTest('Create Chatbot', () => createChatbot(user.id, {
        name: testData.chatbotName,
        description: testData.chatbotDescription,
        instructions: 'You are a helpful test assistant.',
        ai_model: 'gpt-3.5-turbo',
        theme_color: '#3b82f6'
      }))

      // Get chatbot by ID
      await runTest('Get Chatbot by ID', () => getChatbotById(createdChatbot.id, user.id))

      // Update chatbot
      const updatedName = `Updated ${testData.chatbotName}`
      await runTest('Update Chatbot', () => updateChatbot(createdChatbot.id, user.id, {
        name: updatedName,
        description: 'Updated description'
      }))

      // Get user chatbots
      await runTest('Get User Chatbots', () => getUserChatbots(user.id))

      return createdChatbot
    } catch (error) {
      if (createdChatbot) {
        // Cleanup on error
        try {
          await deleteChatbot(createdChatbot.id, user.id)
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError)
        }
      }
      throw error
    }
  }

  const testTrainingDataOperations = async (chatbotId) => {
    let createdTrainingData = null
    
    try {
      // Create training data
      createdTrainingData = await runTest('Create Training Data', () => createTrainingData(chatbotId, user.id, {
        type: 'text',
        title: testData.trainingTitle,
        content: testData.trainingContent
      }))

      // Get training data
      await runTest('Get Training Data', () => getTrainingData(chatbotId, user.id))

      // Update training data
      await runTest('Update Training Data', () => updateTrainingData(createdTrainingData.id, user.id, {
        title: `Updated ${testData.trainingTitle}`,
        processing_status: 'completed'
      }))

      return createdTrainingData
    } catch (error) {
      if (createdTrainingData) {
        try {
          await deleteTrainingData(createdTrainingData.id, user.id)
        } catch (cleanupError) {
          console.error('Training data cleanup failed:', cleanupError)
        }
      }
      throw error
    }
  }

  const testQAOperations = async (chatbotId) => {
    let createdQA = null
    
    try {
      // Create Q&A pair
      createdQA = await runTest('Create QA Pair', () => createQAPair(chatbotId, user.id, {
        question: testData.qaQuestion,
        answer: testData.qaAnswer,
        category: 'test'
      }))

      // Update Q&A pair
      await runTest('Update QA Pair', () => updateQAPair(createdQA.id, user.id, {
        answer: `Updated: ${testData.qaAnswer}`
      }))

      return createdQA
    } catch (error) {
      if (createdQA) {
        try {
          await deleteQAPair(createdQA.id, user.id)
        } catch (cleanupError) {
          console.error('QA cleanup failed:', cleanupError)
        }
      }
      throw error
    }
  }

  const testCleanup = async (chatbotId, trainingDataId, qaId) => {
    // Delete in reverse order
    if (qaId) {
      await runTest('Delete QA Pair', () => deleteQAPair(qaId, user.id))
    }
    
    if (trainingDataId) {
      await runTest('Delete Training Data', () => deleteTrainingData(trainingDataId, user.id))
    }
    
    if (chatbotId) {
      await runTest('Delete Chatbot', () => deleteChatbot(chatbotId, user.id))
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults({})
    
    try {
      // Step 1: User and Profile Tests
      await testUserQueries()
      await testProfileUpdate()
      
      // Step 2: Chatbot Operations
      const chatbot = await testChatbotOperations()
      
      // Step 3: Training Data Operations
      const trainingData = await testTrainingDataOperations(chatbot.id)
      
      // Step 4: Q&A Operations
      const qaData = await testQAOperations(chatbot.id)
      
      // Step 5: Cleanup
      await testCleanup(chatbot.id, trainingData.id, qaData.id)
      
      toast.success('🎉 All database tests passed!')
      
    } catch (error) {
      toast.error('❌ Some tests failed. Check the results below.')
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults({})
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Database Testing Suite"
        description="Test all database operations to ensure everything works correctly"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Database Tests' }
        ]}
        action={{
          label: 'Run All Tests',
          icon: Play,
          props: {
            onClick: runAllTests,
            disabled: loading,
            className: 'bg-green-600 hover:bg-green-700'
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Test Configuration
              </CardTitle>
              <CardDescription>
                Configure test data for database operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chatbotName">Test Chatbot Name</Label>
                <Input
                  id="chatbotName"
                  value={testData.chatbotName}
                  onChange={(e) => setTestData(prev => ({ ...prev, chatbotName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="trainingTitle">Training Data Title</Label>
                <Input
                  id="trainingTitle"
                  value={testData.trainingTitle}
                  onChange={(e) => setTestData(prev => ({ ...prev, trainingTitle: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="qaQuestion">Test Question</Label>
                <Input
                  id="qaQuestion"
                  value={testData.qaQuestion}
                  onChange={(e) => setTestData(prev => ({ ...prev, qaQuestion: e.target.value }))}
                />
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={runAllTests} 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
                
                <Button onClick={clearResults} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {profile?.full_name}</div>
              <div><strong>Plan:</strong> {profile?.subscription_plan}</div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                {Object.keys(testResults).length > 0 
                  ? `${Object.keys(testResults).length} tests completed`
                  : 'No tests run yet'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Run All Tests" to start testing your database operations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(testResults).map(([testName, result]) => (
                    <div 
                      key={testName}
                      className={`p-4 rounded-lg border ${
                        result.status === 'success' ? 'bg-green-50 border-green-200' :
                        result.status === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-2 font-medium">{testName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{result.duration}</span>
                      </div>
                      
                      {result.error && (
                        <div className="text-sm text-red-600 mt-2">
                          {result.error}
                        </div>
                      )}
                      
                      {result.result && result.status === 'success' && (
                        <div className="text-xs text-gray-600 mt-2">
                          {typeof result.result === 'object' 
                            ? JSON.stringify(result.result, null, 2).slice(0, 200) + '...'
                            : String(result.result).slice(0, 200)
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}