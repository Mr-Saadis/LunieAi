'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Database, 
  Users, 
  TrendingUp,
  ArrowRight,
  FileText,
  Globe,
  Upload,
  ArrowUpRight,
  Sparkles,
  Rocket,
  Target,
  Zap,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Crown,
  Star
} from 'lucide-react'

const quickActions = [
  {
    title: 'Create Chatbot',
    description: 'Build your first AI assistant in minutes',
    href: '/dashboard/chatbots/new',
    icon: Plus,
    gradient: 'from-[#94B9F9] to-[#F4CAF7]',
    featured: true
  },
  {
    title: 'Upload Training Files',
    description: 'Add documents to train your chatbot',
    href: '/dashboard/training/upload',
    icon: Upload,
    gradient: 'from-[#F4CAF7] to-[#FB8A8F]'
  },
  {
    title: 'Connect Website',
    description: 'Import content from your website',
    href: '/dashboard/training/website',
    icon: Globe,
    gradient: 'from-[#FB8A8F] to-[#94B9F9]'
  }
]

const features = [
  {
    title: 'Smart Training',
    description: 'Upload files, add websites, or enter text manually',
    icon: Database,
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]'
  },
  {
    title: 'Multi-Platform',
    description: 'Deploy on websites, WhatsApp, and social media',
    icon: MessageSquare,
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/20'
  },
  {
    title: 'Analytics',
    description: 'Track conversations and improve performance',
    icon: BarChart3,
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/20'
  }
]

const recentActivities = [
  {
    type: 'chatbot_created',
    title: 'New chatbot created',
    description: 'Customer Support Bot',
    time: '2 hours ago',
    icon: Bot,
    color: 'text-[#94B9F9]'
  },
  {
    type: 'file_uploaded',
    title: 'Training file uploaded',
    description: 'FAQ_Document.pdf',
    time: '1 day ago',
    icon: FileText,
    color: 'text-[#F4CAF7]'
  },
  {
    type: 'conversation',
    title: 'New conversation',
    description: '15 messages exchanged',
    time: '2 days ago',
    icon: MessageSquare,
    color: 'text-[#FB8A8F]'
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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profile)

        // Get chatbots count
        const { data: chatbots } = await supabase
          .from('chatbots')
          .select('id')
          .eq('user_id', user.id)

        setStats({
          chatbots: chatbots?.length || 0,
          conversations: Math.floor(Math.random() * 100), // Mock data
          messages: Math.floor(Math.random() * 1000), // Mock data
          trainingData: Math.floor(Math.random() * 20) // Mock data
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const hasNoChatbots = stats.chatbots === 0
  const userName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-[#EBF6FC] via-white to-[#F4CAF7]/20 rounded-2xl border border-gray-100 p-8 lg:p-12">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {getGreeting()}, {userName}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {hasNoChatbots 
                        ? "Ready to build your first AI chatbot?" 
                        : `You have ${stats.chatbots} active chatbot${stats.chatbots !== 1 ? 's' : ''} working for you`
                      }
                    </p>
                  </div>
                </div>
                
                {hasNoChatbots && (
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button asChild className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg">
                      <Link href="/dashboard/chatbots/new">
                        <Rocket className="w-4 h-4 mr-2" />
                        Create Your First Chatbot
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="border-gray-200 hover:bg-gray-50">
                      <Link href="/help">
                        <FileText className="w-4 h-4 mr-2" />
                        View Documentation
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {!hasNoChatbots && (
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#94B9F9]/20 to-[#F4CAF7]/20 rounded-full flex items-center justify-center">
                    <Bot className="w-16 h-16 text-[#94B9F9]" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#F4CAF7]/30 to-[#FB8A8F]/30 rounded-full blur-xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-gradient-to-br from-[#94B9F9]/20 to-[#F4CAF7]/20 rounded-full blur-xl opacity-40"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Chatbots</p>
                <p className="text-3xl font-bold text-gray-900">{stats.chatbots}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </div>
              </div>
              <div className="h-12 w-12 bg-[#EBF6FC] rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-[#94B9F9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversations}</p>
                <div className="flex items-center text-xs text-blue-600">
                  <Clock className="w-3 h-3 mr-1" />
                  This month
                </div>
              </div>
              <div className="h-12 w-12 bg-[#F4CAF7]/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#F4CAF7]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.messages}</p>
                <div className="flex items-center text-xs text-purple-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Total sent
                </div>
              </div>
              <div className="h-12 w-12 bg-[#FB8A8F]/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-[#FB8A8F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Training Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.trainingData}</p>
                <div className="flex items-center text-xs text-gray-600">
                  <Database className="w-3 h-3 mr-1" />
                  Sources
                </div>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {hasNoChatbots ? (
            <>
              {/* Getting Started */}
              <Card className="border-2 border-dashed border-gray-200 hover:border-[#94B9F9]/30 transition-colors duration-200">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#EBF6FC] to-[#F4CAF7]/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="h-10 w-10 text-[#94B9F9]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Create Your First AI Chatbot
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Get started by creating an intelligent chatbot trained on your business data. 
                    It takes just a few minutes to set up and deploy.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg">
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Chatbot
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="border-gray-200">
                      <Link href="/help">
                        <FileText className="w-5 h-5 mr-2" />
                        Learn How
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Get Started
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <Card key={index} className={`border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group overflow-hidden ${action.featured ? 'ring-2 ring-[#94B9F9]/20' : ''}`}>
                      <Link href={action.href}>
                        <CardContent className="p-6 relative">
                          {action.featured && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white border-0 text-xs">
                                Popular
                              </Badge>
                            </div>
                          )}
                          <div className={`h-14 w-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                            <action.icon className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#94B9F9] transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            {action.description}
                          </p>
                          <div className="flex items-center text-sm text-[#94B9F9] font-medium">
                            Get started
                            <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Features Overview */}
              <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-[#94B9F9]" />
                    Why Choose LunieAI?
                  </CardTitle>
                  <CardDescription>
                    Powerful features to help you build better customer experiences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                      <div key={index} className="text-center">
                        <div className={`h-12 w-12 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Content when user has chatbots
            <div className="space-y-8">
              {/* Recent Activity */}
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-gray-600" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>
                    Your latest chatbot interactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          activity.color === 'text-[#94B9F9]' ? 'bg-[#EBF6FC]' :
                          activity.color === 'text-[#F4CAF7]' ? 'bg-[#F4CAF7]/20' :
                          'bg-[#FB8A8F]/20'
                        }`}>
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Your chatbots' performance this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-[#EBF6FC]">
                      <div className="text-2xl font-bold text-[#94B9F9]">94%</div>
                      <div className="text-xs text-gray-600 mt-1">Response Rate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#F4CAF7]/20">
                      <div className="text-2xl font-bold text-[#F4CAF7]">2.3s</div>
                      <div className="text-xs text-gray-600 mt-1">Avg Response</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[#FB8A8F]/20">
                      <div className="text-2xl font-bold text-[#FB8A8F]">87%</div>
                      <div className="text-xs text-gray-600 mt-1">Satisfaction</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-100">
                      <div className="text-2xl font-bold text-gray-700">156</div>
                      <div className="text-xs text-gray-600 mt-1">Total Chats</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <Badge className={`${
                  profile?.subscription_plan === 'free' ? 'bg-gray-100 text-gray-700' :
                  profile?.subscription_plan === 'starter' ? 'bg-[#EBF6FC] text-[#94B9F9]' :
                  profile?.subscription_plan === 'pro' ? 'bg-[#F4CAF7]/20 text-[#F4CAF7]' :
                  'bg-[#FB8A8F]/20 text-[#FB8A8F]'
                } border-0 capitalize`}>
                  {profile?.subscription_plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                  {profile?.subscription_plan || 'Free'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage this month</span>
                  <span className="font-medium">{profile?.usage_current_month || 0} / {profile?.usage_limit || 100}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((profile?.usage_current_month || 0) / (profile?.usage_limit || 100)) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" disabled>
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/chatbots" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-3 text-[#94B9F9]" />
                  <span className="text-sm font-medium">Manage Chatbots</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/dashboard/training" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-3 text-[#F4CAF7]" />
                  <span className="text-sm font-medium">Training Data</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/dashboard/analytics" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-3 text-[#FB8A8F]" />
                  <span className="text-sm font-medium">View Analytics</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/help" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm font-medium">Documentation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="border-gray-200 bg-gradient-to-br from-[#EBF6FC] to-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check out our guides and tutorials to get the most out of LunieAI
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/help">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documentation
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}