'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Database, 
  Users, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  FileText,
  Globe
} from 'lucide-react'

const features = [
  {
    title: 'Smart Training Data',
    description: 'Upload files, add websites, or enter text to train your chatbot',
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Multi-Platform Integration',
    description: 'Deploy on websites, WhatsApp, Instagram, and more',
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Advanced Analytics',
    description: 'Track conversations, user engagement, and performance metrics',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Custom Actions',
    description: 'File uploads, lead collection, appointment booking and more',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
]

const quickStartSteps = [
  {
    step: 1,
    title: 'Create Your First Chatbot',
    description: 'Give your bot a name and customize its personality',
    icon: Bot
  },
  {
    step: 2,
    title: 'Add Training Data',
    description: 'Upload files, add website URLs, or enter text content',
    icon: FileText
  },
  {
    step: 3,
    title: 'Deploy & Share',
    description: 'Get your embed code and add the bot to your website',
    icon: Globe
  }
]

export default function DashboardHome() {
  const [stats, setStats] = useState({
    chatbots: 0,
    conversations: 0,
    messages: 0,
    trainingData: 0
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch user stats
        const { data: chatbots } = await supabase
          .from('chatbots')
          .select('id')
          .eq('user_id', user.id)

        // For now, we'll show 0 for everything since we haven't created chatbots yet
        setStats({
          chatbots: chatbots?.length || 0,
          conversations: 0,
          messages: 0,
          trainingData: 0
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const hasNoChatbots = stats.chatbots === 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {hasNoChatbots 
                ? "Ready to create your first AI chatbot?" 
                : `You have ${stats.chatbots} chatbot${stats.chatbots !== 1 ? 's' : ''} running`
              }
            </p>
          </div>
          <div className="hidden md:block">
            <Bot className="w-20 h-20 text-blue-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chatbots</p>
                <p className="text-3xl font-bold text-gray-900">{stats.chatbots}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversations}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.messages}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.trainingData}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {hasNoChatbots ? (
        <div className="space-y-8">
          {/* No Chatbots State */}
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Create Your First Chatbot
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating an AI chatbot trained on your business data. 
                It only takes a few minutes to set up.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href="/dashboard/chatbots/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Chatbot
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Follow these simple steps to get your chatbot up and running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quickStartSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    {index < quickStartSteps.length - 1 && (
                      <div className="ml-5 mt-6 border-l-2 border-gray-200 h-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">What You Can Do With LunieAI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg ${feature.bgColor} mr-4`}>
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first chatbot now and start engaging with your customers in minutes.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href="/dashboard/chatbots/new">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // This will show when user has chatbots (for future use)
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Your chatbots and recent conversations will appear here.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}