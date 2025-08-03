// src/app/dashboard/[chatbotId]/layout.jsx - CHATBOT-SPECIFIC LAYOUT
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  ArrowLeft, 
  Bot, 
  Database, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Play,
  ChevronRight,
  Home,
  User,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  TestTube,
  Sparkles,
  Crown
} from 'lucide-react'
import { toast } from 'sonner'

// 🔝 GLOBAL NAVIGATION (Top NavBar)
const globalNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Chatbots', href: '/dashboard/chatbots', icon: Bot },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Help', href: '/help', icon: HelpCircle }
]

// 📱 CHATBOT-SPECIFIC NAVIGATION (Left Sidebar)
const chatbotNavigation = [
  { 
    name: 'Overview', 
    href: '/overview', 
    icon: Home,
    description: 'Individual chatbot overview'
  },
  { 
    name: 'Training Data', 
    href: '/training', 
    icon: Database,
    description: 'Files, websites & content'
  },
  { 
    name: 'Conversations', 
    href: '/conversations', 
    icon: MessageSquare,
    description: 'Chat history & analytics'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3,
    description: 'Performance insights'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Chatbot configuration'
  },
  { 
    name: 'Playground', 
    href: '/playground', 
    icon: Play,
    description: 'Test your chatbot'
  }
]

const planConfig = {
  free: {
    name: 'Free',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: null
  },
  starter: {
    name: 'Starter',
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]',
    icon: Sparkles
  },
  pro: {
    name: 'Pro',
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/20',
    icon: Crown
  },
  enterprise: {
    name: 'Enterprise',
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/20',
    icon: Crown
  }
}

export default function ChatbotLayout({ children }) {
  const [chatbot, setChatbot] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const chatbotId = params.chatbotId
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      // Get chatbot
      if (chatbotId) {
        const { data: chatbotData, error } = await supabase
          .from('chatbots')
          .select('*')
          .eq('id', chatbotId)
          .eq('user_id', user.id)
          .single()

        if (error || !chatbotData) {
          toast.error('Chatbot not found or access denied')
          router.push('/dashboard')
          return
        }

        setChatbot(chatbotData)
      }

      setLoading(false)
    }

    fetchData()
  }, [chatbotId, router, supabase])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      router.push('/auth/login')
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const isGlobalPageActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    // Don't highlight global nav when we're in chatbot context
    return pathname?.startsWith(href) && !pathname?.includes(`/dashboard/${chatbotId}`)
  }

  const isChatbotPageActive = (href) => {
    const fullHref = `/dashboard/${chatbotId}${href}`
    return pathname === fullHref
  }

  const getCurrentPageTitle = () => {
    if (pathname?.includes('/training')) return 'Training Data'
    if (pathname?.includes('/conversations')) return 'Conversations'
    if (pathname?.includes('/analytics')) return 'Analytics'
    if (pathname?.includes('/settings')) return 'Settings'
    if (pathname?.includes('/playground')) return 'Playground'
    return 'Chatbot'
  }

  const userPlan = profile?.subscription_plan || 'free'
  const planInfo = planConfig[userPlan]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chatbot not found</h2>
          <p className="text-gray-600 mb-6">The chatbot you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">     

      <div className="flex">
        {/* 📱 LEFT SIDEBAR - CHATBOT NAVIGATION */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex grow flex-col overflow-y-auto bg-white border-r border-gray-200">
            {/* Chatbot Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            {/* Chatbot Info */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{chatbot.name}</h2>
                  <div className="flex items-center mt-1">
                    <Badge className={`text-xs ${chatbot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0`}>
                      {chatbot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Chatbot Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {chatbotNavigation.map((item) => {
                const isActive = isChatbotPageActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={`/dashboard/${chatbotId}${item.href}`}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#EBF6FC] to-[#F4CAF7]/10 text-[#94B9F9] shadow-sm border border-[#94B9F9]/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                      isActive ? 'text-[#94B9F9]' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-[#94B9F9]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div className="p-3 border-t border-gray-100 space-y-2">
              <Button asChild size="sm" className="w-full bg-[#94B9F9] hover:bg-[#94B9F9]/90 text-white">
                <Link href={`/dashboard/${chatbotId}/playground`}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Chatbot
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/dashboard/${chatbotId}/settings`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 📱 MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl">
              {/* Mobile Header */}
              <div className="flex h-16 items-center justify-between px-4 border-b">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-semibold">LunieAI</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobile Global Nav */}
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Navigation</h3>
                <div className="space-y-1">
                  {globalNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Chatbot Info */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{chatbot.name}</h3>
                    <Badge className={`text-xs ${chatbot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0`}>
                      {chatbot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mobile Chatbot Nav */}
              <div className="p-4">
                <div className="space-y-1">
                  {chatbotNavigation.map((item) => {
                    const isActive = isChatbotPageActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={`/dashboard/${chatbotId}${item.href}`}
                        className={`flex items-center px-3 py-3 text-sm rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-[#EBF6FC] text-[#94B9F9]' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={`w-4 h-4 mr-3 ${
                          isActive ? 'text-[#94B9F9]' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Quick Actions */}
                <div className="mt-6 space-y-2">
                  <Button asChild size="sm" className="w-full bg-[#94B9F9] hover:bg-[#94B9F9]/90 text-white">
                    <Link href={`/dashboard/${chatbotId}/playground`} onClick={() => setSidebarOpen(false)}>
                      <Play className="w-4 h-4 mr-2" />
                      Test Chatbot
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📄 MAIN CONTENT */}
        <div className="md:pl-64 flex-1">
          {/* Page Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}