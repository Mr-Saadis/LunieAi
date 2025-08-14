//src/components/dashboard/DashboardHome.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Star,
  Eye,
  Edit,
  Play,
  MoreHorizontal,
  Calendar,
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  ExternalLink,
  Copy,
  Download,
  Filter,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { User, Heart, Coffee, Smile, Shield, Headphones, BookOpen, Laptop, Lightbulb, Briefcase, Home, Camera, Music, Phone, Mail, ShoppingCart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const CHAT_ICONS = {
  'Bot': Bot,
  'User': User,
  'Sparkles': Sparkles,
  'Heart': Heart,
  'Star': Star,
  'Coffee': Coffee,
  'Zap': Zap,
  'Smile': Smile,
  'Shield': Shield,
  'Headphones': Headphones,
  'Book': BookOpen,
  'Lightbulb': Lightbulb,
  'Rocket': Rocket,
  'Target': Target,
  'Briefcase': Briefcase,
  'Globe': Globe,
  'Home': Home,
  'Camera': Camera,
  'Music': Music,
  'Phone': Phone,
  'Mail': Mail,
  'Shopping Cart': ShoppingCart,
  'Laptop': Laptop,
  'Message': MessageSquare
}

const quickActions = [
  {
    title: 'Create Chatbot',
    description: 'Build your first AI assistant in minutes',
    href: '/dashboard/chatbots/new',
    icon: Plus,
    gradient: 'from-[#94B9F9] to-[#F4CAF7]',
    featured: true,
    estimatedTime: '5 min'
  },
  {
    title: 'Upload Training Files',
    description: 'Add documents to train your chatbot',
    href: '/dashboard/training/upload',
    icon: Upload,
    gradient: 'from-[#F4CAF7] to-[#FB8A8F]',
    estimatedTime: '2 min'
  },
  {
    title: 'Connect Website',
    description: 'Import content from your website',
    href: '/dashboard/training/website',
    icon: Globe,
    gradient: 'from-[#FB8A8F] to-[#94B9F9]',
    estimatedTime: '3 min'
  }
]

const features = [
  {
    title: 'Smart Training',
    description: 'Upload files, add websites, or enter text manually',
    icon: Database,
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]',
    improvement: '+15%'
  },
  {
    title: 'Multi-Platform',
    description: 'Deploy on websites, WhatsApp, and social media',
    icon: MessageSquare,
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/20',
    improvement: '+23%'
  },
  {
    title: 'Analytics',
    description: 'Track conversations and improve performance',
    icon: BarChart3,
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/20',
    improvement: '+31%'
  }
]

const recentActivities = [
  {
    type: 'chatbot_created',
    title: 'New chatbot created',
    description: 'Customer Support Bot',
    time: '2 hours ago',
    icon: Bot,
    color: 'text-[#94B9F9]',
    status: 'success'
  },
  {
    type: 'file_uploaded',
    title: 'Training file uploaded',
    description: 'FAQ_Document.pdf',
    time: '1 day ago',
    icon: FileText,
    color: 'text-[#F4CAF7]',
    status: 'success'
  },
  {
    type: 'conversation',
    title: 'High engagement conversation',
    description: '15 messages exchanged',
    time: '2 days ago',
    icon: MessageSquare,
    color: 'text-[#FB8A8F]',
    status: 'success'
  },
  {
    type: 'error',
    title: 'Processing failed',
    description: 'Document.pdf - file too large',
    time: '3 days ago',
    icon: AlertCircle,
    color: 'text-red-500',
    status: 'error'
  }
]

const notifications = [
  {
    id: 1,
    title: 'Weekly Summary Ready',
    description: 'Your weekly analytics report is now available',
    time: '1 hour ago',
    type: 'info',
    unread: true
  },
  {
    id: 2,
    title: 'New Feature: Voice Responses',
    description: 'Add voice capabilities to your chatbots',
    time: '2 days ago',
    type: 'feature',
    unread: true
  },
  {
    id: 3,
    title: 'Storage Limit Warning',
    description: 'You\'re using 80% of your storage limit',
    time: '3 days ago',
    type: 'warning',
    unread: false
  }
]

const getChatIcon = (iconName) => {
  const IconComponent = CHAT_ICONS[iconName] || Bot
  return IconComponent
}

const getThemeColorName = (color) => {
  const colorNames = {
    '#94B9F9': 'Blue',
    '#F4CAF7': 'Purple',
    '#FB8A8F': 'Coral',
    '#10B981': 'Green',
    '#F59E0B': 'Orange',
    '#EF4444': 'Red',
    '#6366F1': 'Indigo',
    '#EC4899': 'Pink',
    '#14B8A6': 'Teal',
    '#06B6D4': 'Cyan',
    '#84CC16': 'Lime',
    '#F43F5E': 'Rose'
  }
  return colorNames[color] || 'Custom'
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    chatbots: 0,
    conversations: 0,
    messages: 0,
    trainingData: 0
  })
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [chatbots, setChatbots] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  //   const fetchData = async () => {
  //  try {
  //    setLoading(true)

  //    // Fetch user profile
  //    const profileResponse = await fetch('/api/user/profile')
  //    if (profileResponse.ok) {
  //      const profileData = await profileResponse.json()
  //      setUser(profileData.user)
  //      setProfile(profileData.profile)
  //    }

  //    // Fetch dashboard stats
  //    const statsResponse = await fetch('/api/dashboard/stats')
  //    if (statsResponse.ok) {
  //      const statsData = await statsResponse.json()
  //      setStats(statsData)
  //    }

  //    // Fetch recent chatbots
  //    const chatbotsResponse = await fetch('/api/chatbots?limit=6')
  //    if (chatbotsResponse.ok) {
  //      const chatbotsData = await chatbotsResponse.json()
  //      setChatbots(chatbotsData.chatbots || [])
  //    }

  //  } catch (error) {
  //    console.error('Error fetching dashboard data:', error)
  //    toast.error('Failed to load dashboard data')
  //  } finally {
  //    setLoading(false)
  //  }
  // }

  // Update the fetchData function in your DashboardHome.jsx
  // Replace the existing fetchData function with this:

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUser(profileData.user)
        setProfile(profileData.profile)
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent chatbots - UPDATED TO HANDLE NEW API FORMAT
      const chatbotsResponse = await fetch('/api/chatbots?limit=6')
      if (chatbotsResponse.ok) {
        const chatbotsData = await chatbotsResponse.json()

        // Handle both old and new API response formats
        if (chatbotsData.success && chatbotsData.data) {
          // New refactored API format
          setChatbots(chatbotsData.data.chatbots || [])
        } else if (chatbotsData.chatbots) {
          // Old API format (fallback)
          setChatbots(chatbotsData.chatbots || [])
        } else {
          console.warn('Unexpected chatbots API response format:', chatbotsData)
          setChatbots([])
        }
      } else {
        console.error('Failed to fetch chatbots:', chatbotsResponse.status)
        const errorData = await chatbotsResponse.json()
        console.error('Error details:', errorData)
        toast.error('Failed to load chatbots')
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }


  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    toast.success('Dashboard refreshed')
  }

  const handleChatbotSelect = (chatbotId) => {
    router.push(`/dashboard/${chatbotId}/overview`)
  }

  const duplicateChatbot = async (chatbot) => {
    toast.success(`Creating copy of ${chatbot.name}...`)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getUsagePercentage = () => {
    const current = profile?.usage_current_month || 0
    const limit = profile?.usage_limit || 100
    return Math.min((current / limit) * 100, 100)
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
  const usagePercentage = getUsagePercentage()

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-4 lg:px-0">
      {/* Mobile-Optimized Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-[#EBF6FC] via-white to-[#F4CAF7]/20 rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="relative z-10">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {getGreeting()}, {userName}! 👋
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {hasNoChatbots
                          ? "Ready to build your first AI chatbot?"
                          : `You have ${stats.chatbots} active chatbot${stats.chatbots !== 1 ? 's' : ''} working for you`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:hidden">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 w-full sm:w-auto">
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Chatbot
                      </Link>
                    </Button>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Chatbot
                      </Link>
                    </Button>
                  </div>
                </div>

                {hasNoChatbots && (
                  <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:gap-3 sm:space-y-0 mt-6">
                    <Button asChild className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg w-full sm:w-auto">
                      <Link href="/dashboard/chatbots/new">
                        <Rocket className="w-4 h-4 mr-2" />
                        Create Your First Chatbot
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto">
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
                  <div className="w-24 h-24 xl:w-32 xl:h-32 bg-gradient-to-br from-[#94B9F9]/20 to-[#F4CAF7]/20 rounded-full flex items-center justify-center">
                    <Bot className="w-12 h-12 xl:w-16 xl:h-16 text-[#94B9F9]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#F4CAF7]/30 to-[#FB8A8F]/30 rounded-full blur-xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-[#94B9F9]/20 to-[#F4CAF7]/20 rounded-full blur-xl opacity-40"></div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-gray-200 hover:shadow-md transition-all duration-200 group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Chatbots</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.chatbots}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-[#EBF6FC] rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform self-end sm:self-auto">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#94B9F9]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-all duration-200 group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.conversations}</p>
                <div className="flex items-center text-xs text-blue-600">
                  <Clock className="w-3 h-3 mr-1" />
                  +8%
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-[#F4CAF7]/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform self-end sm:self-auto">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#F4CAF7]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-all duration-200 group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Messages</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.messages}</p>
                <div className="flex items-center text-xs text-purple-600">
                  <Activity className="w-3 h-3 mr-1" />
                  +24%
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-[#FB8A8F]/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform self-end sm:self-auto">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#FB8A8F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-md transition-all duration-200 group">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Training Items</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.trainingData}</p>
                <div className="flex items-center text-xs text-gray-600">
                  <Database className="w-3 h-3 mr-1" />
                  Ready
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform self-end sm:self-auto">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Content - Spans 3 columns */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
          {hasNoChatbots ? (
            <>
              {/* Getting Started - Mobile Optimized */}
              <Card className="border-2 border-dashed border-gray-200 hover:border-[#94B9F9]/30 transition-colors duration-200">
                <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#EBF6FC] to-[#F4CAF7]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-[#94B9F9]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    Create Your First AI Chatbot
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                    Get started by creating an intelligent chatbot trained on your business data.
                    Setup takes just a few minutes, and you'll be chatting with your AI assistant in no time.
                  </p>
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-4 justify-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg w-full sm:w-auto">
                      <Link href="/dashboard/chatbots/new">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Chatbot
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="border-gray-200 w-full sm:w-auto">
                      <Link href="/help">
                        <FileText className="w-5 h-5 mr-2" />
                        Learn How
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile-Optimized Quick Actions */}
              <div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Get started with these common tasks</p>
                  </div>
                  <Badge variant="outline" className="text-xs self-start sm:self-auto">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {quickActions.map((action, index) => (
                    <Card key={index} className={`border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group overflow-hidden ${action.featured ? 'ring-2 ring-[#94B9F9]/20' : ''}`}>
                      <Link href={action.href}>
                        <CardContent className="p-4 sm:p-6 relative">
                          {action.featured && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white border-0 text-xs">
                                Popular
                              </Badge>
                            </div>
                          )}
                          <div className={`h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
                            <action.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#94B9F9] transition-colors text-sm sm:text-base">
                            {action.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                            {action.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs sm:text-sm text-[#94B9F9] font-medium">
                              Get started
                              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <span className="text-xs text-gray-500">{action.estimatedTime}</span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Mobile-Optimized Features Overview */}
              <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Target className="w-5 h-5 mr-2 text-[#94B9F9]" />
                    Why Choose LunieAI?
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Powerful features designed to boost your customer experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                      <div key={index} className="text-center group">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{feature.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">{feature.description}</p>
                        <Badge variant="outline" className="text-xs text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {feature.improvement} efficiency
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Mobile-Optimized Chatbots List */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Bot className="w-5 h-5 mr-2 text-[#94B9F9]" />
                        Your Chatbots
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Manage and monitor your AI assistants
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button asChild size="sm" className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 w-full sm:w-auto">
                        <Link href="/dashboard/chatbots/new">
                          <Plus className="w-4 h-4 mr-2" />
                          New Chatbot
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">


                    



                    {chatbots.slice(0, 3).map((chatbot) => {
                      // Use a default icon since chat_icon doesn't exist in DB yet
                      const ChatIconComponent = getChatIcon('Bot') // Default to Bot icon

                      return (
                        <div
                          key={chatbot.id}
                          className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => handleChatbotSelect(chatbot.id)}
                        >
                          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: chatbot.theme_color || '#94B9F9' }}
                            >
                              <ChatIconComponent className="w-5 h-5 text-white" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 group-hover:text-[#94B9F9] transition-colors text-sm sm:text-base truncate">
                                {chatbot.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {chatbot.description || 'No description'}
                              </p>
                              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Updated {new Date(chatbot.updated_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {chatbot.total_conversations || 0} conversations
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                            <Badge className={`${chatbot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0 text-xs`}>
                              {chatbot.is_active ? 'Active' : 'Inactive'}
                            </Badge>

                            <div className="flex items-center space-x-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/dashboard/${chatbot.id}/training`)
                                  }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Training
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/dashboard/${chatbot.id}/playground`)
                                  }}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Test Chatbot
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    duplicateChatbot(chatbot)
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/dashboard/${chatbot.id}/analytics`)
                                  }}>
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Analytics
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#94B9F9] group-hover:translate-x-1 transition-all hidden sm:block" />
                            </div>
                          </div>
                        </div>
                      )
                    })}


                  </div>

                  {chatbots.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/chatbots">
                          View All {chatbots.length} Chatbots
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mobile-Optimized Recent Activity */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Activity className="w-5 h-5 mr-2 text-gray-600" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Latest interactions and system updates
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className="w-full sm:w-auto text-xs"
                      >
                        {showAllActivities ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show All
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/analytics">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {(showAllActivities ? recentActivities : recentActivities.slice(0, 3)).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.status === 'success' ? (
                          activity.color === 'text-[#94B9F9]' ? 'bg-[#EBF6FC]' :
                            activity.color === 'text-[#F4CAF7]' ? 'bg-[#F4CAF7]/20' :
                              'bg-[#FB8A8F]/20'
                        ) : 'bg-red-50'
                          }`}>
                          <activity.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <p className="font-medium text-gray-900 group-hover:text-[#94B9F9] transition-colors text-sm sm:text-base truncate">
                              {activity.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {activity.status === 'success' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                              {activity.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{activity.time}</p>
                            {activity.status === 'error' && (
                              <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mobile-Optimized Performance Overview */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <BarChart3 className="w-5 h-5 mr-2 text-[#94B9F9]" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your chatbots' performance this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-[#EBF6FC] group hover:scale-105 transition-transform">
                      <div className="text-xl sm:text-2xl font-bold text-[#94B9F9]">94%</div>
                      <div className="text-xs text-gray-600 mt-1">Response Rate</div>
                      <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2%
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-[#F4CAF7]/20 group hover:scale-105 transition-transform">
                      <div className="text-xl sm:text-2xl font-bold text-[#F4CAF7]">2.3s</div>
                      <div className="text-xs text-gray-600 mt-1">Avg Response</div>
                      <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        -0.2s
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-[#FB8A8F]/20 group hover:scale-105 transition-transform">
                      <div className="text-xl sm:text-2xl font-bold text-[#FB8A8F]">87%</div>
                      <div className="text-xs text-gray-600 mt-1">Satisfaction</div>
                      <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5%
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-100 group hover:scale-105 transition-transform">
                      <div className="text-xl sm:text-2xl font-bold text-gray-700">156</div>
                      <div className="text-xs text-gray-600 mt-1">Total Chats</div>
                      <div className="flex items-center justify-center mt-2 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Mobile-Optimized Right Sidebar */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          {/* Mobile-Optimized Account Status */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Current Plan</span>
                <Badge className={`${profile?.subscription_plan === 'free' ? 'bg-gray-100 text-gray-700' :
                  profile?.subscription_plan === 'starter' ? 'bg-[#EBF6FC] text-[#94B9F9]' :
                    profile?.subscription_plan === 'pro' ? 'bg-[#F4CAF7]/20 text-[#F4CAF7]' :
                      'bg-[#FB8A8F]/20 text-[#FB8A8F]'
                  } border-0 capitalize text-xs`}>
                  {profile?.subscription_plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                  {profile?.subscription_plan || 'Free'}
                </Badge>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Usage this month</span>
                  <span className="font-medium">{profile?.usage_current_month || 0} / {profile?.usage_limit || 100}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{usagePercentage.toFixed(0)}% used</span>
                  <span>{profile?.usage_limit || 100}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                  <Link href="/dashboard/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Notifications Panel */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
                  Notifications
                </div>
                <Badge variant="outline" className="text-xs">
                  {notifications.filter(n => n.unread).length} new
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {notifications.slice(0, showAllNotifications ? notifications.length : 3).map((notification) => (
                <div key={notification.id} className={`p-2 sm:p-3 rounded-lg border transition-colors hover:bg-gray-50 ${notification.unread ? 'border-[#94B9F9]/20 bg-[#EBF6FC]/30' : 'border-gray-100'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-[#94B9F9] rounded-full ml-2 mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex flex-col space-y-2">
                {notifications.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                  >
                    {showAllNotifications ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View All Notifications
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Quick Links */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Link href="/dashboard/chatbots" className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-3 text-[#94B9F9]" />
                  <span className="text-xs sm:text-sm font-medium">Manage Chatbots</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/dashboard/analytics" className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-3 text-[#FB8A8F]" />
                  <span className="text-xs sm:text-sm font-medium">View Analytics</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/help" className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium">Documentation</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/dashboard/profile" className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-3 text-[#F4CAF7]" />
                  <span className="text-xs sm:text-sm font-medium">Profile Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Help & Support */}
          <Card className="border-gray-200 bg-gradient-to-br from-[#EBF6FC] to-white">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Need Help?</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Access our comprehensive guides, tutorials, and community support
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild className="w-full text-xs">
                    <Link href="/help">
                      <FileText className="w-4 h-4 mr-2" />
                      Documentation
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="w-full text-xs">
                    <Link href="/community">
                      <Users className="w-4 h-4 mr-2" />
                      Join Community
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-Optimized Quick Stats */}
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Response time</span>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-medium">2.1s</span>
                    <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Accuracy rate</span>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-medium">94.2%</span>
                    <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Active users</span>
                  <div className="flex items-center">
                    <span className="text-xs sm:text-sm font-medium">1,247</span>
                    <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}