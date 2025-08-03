// src/app/dashboard/[chatbotId]/overview/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Bot, Monitor, Smartphone, Tablet } from 'lucide-react'

// Import all components
import HeroSection from '@/components/dashboard/overview/HeroSection'
import StatsCards from '@/components/dashboard/overview/StatsCards'
import WeeklyPerformance from '@/components/dashboard/overview/WeeklyPerformance'
import PerformanceScore from '@/components/dashboard/overview/PerformanceScore'
import AnalyticsGrid from '@/components/dashboard/overview/AnalyticsGrid'
import PopularQuestions from '@/components/dashboard/overview/PopularQuestions'
import QuickActions from '@/components/dashboard/overview/QuickActions'
import PerformanceBanner from '@/components/dashboard/overview/PerformanceBanner'
import RecentActivity from '@/components/dashboard/overview/RecentActivity'

// Mock data generator
const generateMockData = () => ({
  chatbot: {
    id: '1',
    name: 'Customer Support AI',
    description: 'Intelligent customer service assistant',
    status: 'active',
    avatar_url: null,
    theme_color: '#94B9F9',
    ai_model: 'gpt-4o',
    created_at: '2024-01-15T10:30:00Z',
    total_conversations: 2847,
    total_messages: 18904,
    satisfaction_rating: 4.8,
    response_time: 1.2,
    accuracy_score: 94
  },
  analytics: {
    today: {
      conversations: 23,
      messages: 156,
      satisfaction: 4.9,
      avgResponseTime: 0.8
    },
    yesterday: {
      conversations: 31,
      messages: 198,
      satisfaction: 4.7,
      avgResponseTime: 1.1
    },
    weeklyData: [
      { day: 'Mon', conversations: 45, messages: 320, satisfaction: 4.6 },
      { day: 'Tue', conversations: 52, messages: 398, satisfaction: 4.8 },
      { day: 'Wed', conversations: 38, messages: 275, satisfaction: 4.7 },
      { day: 'Thu', conversations: 61, messages: 442, satisfaction: 4.9 },
      { day: 'Fri', conversations: 48, messages: 356, satisfaction: 4.5 },
      { day: 'Sat', conversations: 29, messages: 201, satisfaction: 4.8 },
      { day: 'Sun', conversations: 23, messages: 156, satisfaction: 4.9 }
    ],
    topCountries: [
      { country: 'United States', flag: '🇺🇸', conversations: 1240, percentage: 43.6 },
      { country: 'United Kingdom', flag: '🇬🇧', conversations: 486, percentage: 17.1 },
      { country: 'Canada', flag: '🇨🇦', conversations: 312, percentage: 11.0 },
      { country: 'Australia', flag: '🇦🇺', conversations: 198, percentage: 7.0 },
      { country: 'Germany', flag: '🇩🇪', conversations: 156, percentage: 5.5 }
    ],
    devices: [
      { type: 'Desktop', icon: Monitor, count: 1420, percentage: 49.9 },
      { type: 'Mobile', icon: Smartphone, count: 1138, percentage: 40.0 },
      { type: 'Tablet', icon: Tablet, count: 289, percentage: 10.1 }
    ],
    popularQuestions: [
      { question: 'How do I reset my password?', count: 234, trend: 'up' },
      { question: 'What are your business hours?', count: 189, trend: 'up' },
      { question: 'How can I track my order?', count: 167, trend: 'down' },
      { question: 'Do you offer refunds?', count: 145, trend: 'up' },
      { question: 'How to contact support?', count: 123, trend: 'stable' }
    ]
  }
})

export default function ChatbotOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/auth/login')
          return
        }

        // TODO: Replace with actual API call to fetch chatbot data
        // const { data: chatbotData, error } = await supabase
        //   .from('chatbots')
        //   .select('*')
        //   .eq('id', params.chatbotId)
        //   .eq('user_id', user.id)
        //   .single()

        // if (error) throw error
        // if (!chatbotData) throw new Error('Chatbot not found')

        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000))
        setData(generateMockData())

      } catch (error) {
        console.error('Error fetching chatbot data:', error)
        toast.error('Failed to load chatbot data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.chatbotId, router, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#94B9F9]/20 border-t-[#94B9F9] rounded-full animate-spin"></div>
          <Bot className="w-6 h-6 text-[#94B9F9] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chatbot not found</h3>
        <p className="text-gray-600">The chatbot you're looking for doesn't exist or has been deleted.</p>
      </div>
    )
  }

  const { chatbot, analytics } = data

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 md:p-6">
        {/* Hero Section */}
        <HeroSection chatbot={chatbot} />

        {/* Quick Stats */}
        <StatsCards chatbot={chatbot} analytics={analytics} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeeklyPerformance analytics={analytics} />
          <PerformanceScore chatbot={chatbot} />
        </div>

        {/* Analytics Grid */}
        <AnalyticsGrid analytics={analytics} />

        {/* Popular Questions */}
        <PopularQuestions analytics={analytics} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Performance Insights Banner */}
        <PerformanceBanner chatbot={chatbot} />

        {/* Recent Activity Feed */}
        <RecentActivity />
      </div>
    </TooltipProvider>
  )
}