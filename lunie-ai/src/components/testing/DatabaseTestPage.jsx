'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Database, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Bot,
  FileText,
  MessageCircle,
  User,
  RefreshCw,
  TestTube,
  Settings,
  Activity,
  AlertCircle,
  Zap,
  Target,
  Timer,
  BookOpen,
  MessageSquare
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

const testCategories = [
  {
    id: 'user',
    name: 'User Operations',
    icon: User,
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]',
    description: 'Test user authentication and profile operations'
  },
  {
    id: 'chatbot',
    name: 'Chatbot Operations',
    icon: Bot,
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/10',
    description: 'Test chatbot creation, updates, and deletion'
  },
  {
    id: 'training',
    name: 'Training Data',
    icon: BookOpen,
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/10',
    description: 'Test training data management and Q&A operations'
  }
]

export default function DatabaseTestPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
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

  const runTest = async (testName, testFunction, category = 'general') => {
    setTestResults(prev => ({ 
      ...prev, 
      [testName]: { 
        status: 'running',
        category,
        startTime: Date.now()
      } 
    }))
    
    try {
      const startTime = Date.now()
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'success', 
          result,
          duration: `${duration}ms`,
          category,
          completedAt: new Date().toISOString()
        } 
      }))
      
      return result
    } catch (error) {
      console.error(`Test ${testName} failed:`, error)
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          error: error.message,
          duration: 'Failed',
          category,
          completedAt: new Date().toISOString()
        } 
      }))
      
      throw error
    }
  }

  // Test Functions
  const testUserQueries = async () => {
    const tests = [
      ['Get Current User', () => getCurrentUser(), 'user'],
      ['Get User Profile', () => getUserProfile(user.id), 'user'],
      ['Get User with Profile', () => getCurrentUserWithProfile(), 'user'],
      ['Get Dashboard Stats', () => getDashboardStats(user.id), 'user']
    ]

    const results = {}
    for (const [name, testFn, category] of tests) {
      results[name] = await runTest(name, testFn, category)
    }
    return results
  }

  const testProfileUpdate = async () => {
    const originalName = profile.full_name
    const testName = `Test User ${Date.now()}`
    
    // Update profile
    await runTest('Update Profile', () => updateUserProfile(user.id, {
      full_name: testName
    }), 'user')
    
    // Verify update
    const updatedProfile = await runTest('Verify Profile Update', () => getUserProfile(user.id), 'user')
    
    // Restore original name
    await runTest('Restore Profile', () => updateUserProfile(user.id, {
      full_name: originalName
    }), 'user')
    
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
      }), 'chatbot')

      // Get chatbot by ID
      await runTest('Get Chatbot by ID', () => getChatbotById(createdChatbot.id, user.id), 'chatbot')

      // Update chatbot
      const updatedName = `Updated ${testData.chatbotName}`
      await runTest('Update Chatbot', () => updateChatbot(createdChatbot.id, user.id, {
        name: updatedName,
        description: 'Updated description'
      }), 'chatbot')

      // Get user chatbots
      await runTest('Get User Chatbots', () => getUserChatbots(user.id), 'chatbot')

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
      }), 'training')

      // Get training data
      await runTest('Get Training Data', () => getTrainingData(chatbotId, user.id), 'training')

      // Update training data
      await runTest('Update Training Data', () => updateTrainingData(createdTrainingData.id, user.id, {
        title: `Updated ${testData.trainingTitle}`,
        processing_status: 'completed'
      }), 'training')

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
      }), 'training')

      // Update Q&A pair
      await runTest('Update QA Pair', () => updateQAPair(createdQA.id, user.id, {
        answer: `Updated: ${testData.qaAnswer}`
      }), 'training')

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
      await runTest('Delete QA Pair', () => deleteQAPair(qaId, user.id), 'training')
    }
    
    if (trainingDataId) {
      await runTest('Delete Training Data', () => deleteTrainingData(trainingDataId, user.id), 'training')
    }
    
    if (chatbotId) {
      await runTest('Delete Chatbot', () => deleteChatbot(chatbotId, user.id), 'chatbot')
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults({})
    
    try {
      toast.info('🧪 Starting comprehensive database tests...')
      
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
      
      toast.success('🎉 All database tests completed successfully!')
      
    } catch (error) {
      toast.error(`❌ Some tests failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const runCategoryTests = async (category) => {
    setLoading(true)
    
    try {
      if (category === 'user') {
        await testUserQueries()
        await testProfileUpdate()
        toast.success('✅ User tests completed!')
      } else if (category === 'chatbot') {
        const chatbot = await testChatbotOperations()
        await runTest('Delete Test Chatbot', () => deleteChatbot(chatbot.id, user.id), 'chatbot')
        toast.success('✅ Chatbot tests completed!')
      } else if (category === 'training') {
        // Need a chatbot first
        const chatbot = await runTest('Create Test Chatbot', () => createChatbot(user.id, {
          name: 'Training Test Bot',
          description: 'For training tests',
          instructions: 'Test bot',
          ai_model: 'gpt-3.5-turbo'
        }), 'chatbot')
        
        const trainingData = await testTrainingDataOperations(chatbot.id)
        const qaData = await testQAOperations(chatbot.id)
        await testCleanup(chatbot.id, trainingData.id, qaData.id)
        toast.success('✅ Training data tests completed!')
      }
    } catch (error) {
      toast.error(`❌ ${category} tests failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults({})
    toast.info('🗑️ Test results cleared')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 animate-pulse text-blue-500" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Running</Badge>
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Passed</Badge>
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getTestsByCategory = (category) => {
    if (category === 'all') return Object.entries(testResults)
    return Object.entries(testResults).filter(([_, result]) => result.category === category)
  }

  const getCategoryStats = (category) => {
    const tests = getTestsByCategory(category)
    const total = tests.length
    const passed = tests.filter(([_, result]) => result.status === 'success').length
    const failed = tests.filter(([_, result]) => result.status === 'error').length
    const running = tests.filter(([_, result]) => result.status === 'running').length
    
    return { total, passed, failed, running }
  }

  const getOverallStats = () => {
    const allTests = Object.entries(testResults)
    return getCategoryStats('all')
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  const overallStats = getOverallStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Database Testing Suite</h1>
          <p className="text-gray-600">Test all database operations to ensure everything works correctly</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={clearResults} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Results
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {Object.keys(testResults).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{overallStats.total}</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TestTube className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Passed</p>
                  <p className="text-2xl font-semibold text-green-600 mt-1">{overallStats.passed}</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">{overallStats.failed}</p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">{overallStats.running}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Test Configuration */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Test Configuration
              </CardTitle>
              <CardDescription>
                Configure test data for operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chatbotName" className="text-sm font-medium">Chatbot Name</Label>
                <Input
                  id="chatbotName"
                  value={testData.chatbotName}
                  onChange={(e) => setTestData(prev => ({ ...prev, chatbotName: e.target.value }))}
                  placeholder="Test Bot"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="trainingTitle" className="text-sm font-medium">Training Title</Label>
                <Input
                  id="trainingTitle"
                  value={testData.trainingTitle}
                  onChange={(e) => setTestData(prev => ({ ...prev, trainingTitle: e.target.value }))}
                  placeholder="Test Training Data"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="qaQuestion" className="text-sm font-medium">Test Question</Label>
                <Input
                  id="qaQuestion"
                  value={testData.qaQuestion}
                  onChange={(e) => setTestData(prev => ({ ...prev, qaQuestion: e.target.value }))}
                  placeholder="What is this test about?"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Categories */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-gray-600" />
                Test Categories
              </CardTitle>
              <CardDescription>
                Run specific test categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testCategories.map((category) => {
                const stats = getCategoryStats(category.id)
                return (
                  <div key={category.id} className={`p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 ${category.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                          <category.icon className={`h-4 w-4 ${category.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    {stats.total > 0 && (
                      <div className="flex justify-between text-xs text-gray-600 mb-3">
                        <span>{stats.passed} passed</span>
                        <span>{stats.failed} failed</span>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => runCategoryTests(category.id)}
                      disabled={loading}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Run Tests
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Current User */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div><span className="font-medium">ID:</span> <span className="text-gray-600 text-xs font-mono">{user.id.slice(0, 8)}...</span></div>
                <div><span className="font-medium">Email:</span> <span className="text-gray-600">{user.email}</span></div>
                <div><span className="font-medium">Name:</span> <span className="text-gray-600">{profile?.full_name}</span></div>
                <div><span className="font-medium">Plan:</span> 
                  <Badge variant="outline" className="ml-2 capitalize">
                    {profile?.subscription_plan || 'free'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-gray-600" />
                    Test Results
                  </CardTitle>
                  <CardDescription>
                    {Object.keys(testResults).length > 0 
                      ? `${Object.keys(testResults).length} tests completed`
                      : 'No tests run yet'
                    }
                  </CardDescription>
                </div>
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-auto">
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="user" className="text-xs">User</TabsTrigger>
                    <TabsTrigger value="chatbot" className="text-xs">Chatbot</TabsTrigger>
                    <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Run Yet</h3>
                  <p className="text-gray-600 mb-6">Click "Run All Tests" or choose a specific category to start testing your database operations</p>
                  <Button onClick={runAllTests} disabled={loading} className="bg-green-600 hover:bg-green-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Testing
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getTestsByCategory(activeCategory).map(([testName, result]) => (
                    <div 
                      key={testName}
                      className={`p-4 rounded-lg border transition-colors ${
                        result.status === 'success' ? 'bg-green-50 border-green-200' :
                        result.status === 'error' ? 'bg-red-50 border-red-200' :
                        result.status === 'running' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-3 font-medium text-gray-900">{testName}</span>
                          <Badge variant="outline" className="ml-2 text-xs capitalize">
                            {result.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.duration && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Timer className="w-3 h-3 mr-1" />
                              {result.duration}
                            </span>
                          )}
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="text-sm text-red-700 mt-2 p-3 bg-red-100 rounded border">
                          <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="font-mono">{result.error}</span>
                          </div>
                        </div>
                      )}
                      
                      {result.result && result.status === 'success' && (
                        <div className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded border">
                          <div className="flex items-start">
                            <CheckCircle2 className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                            <span className="font-mono">
                              {typeof result.result === 'object' 
                                ? JSON.stringify(result.result, null, 2).slice(0, 200) + (JSON.stringify(result.result).length > 200 ? '...' : '')
                                : String(result.result).slice(0, 200) + (String(result.result).length > 200 ? '...' : '')
                              }
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {result.completedAt && (
                        <div className="text-xs text-gray-500 mt-2">
                          Completed: {new Date(result.completedAt).toLocaleTimeString()}
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