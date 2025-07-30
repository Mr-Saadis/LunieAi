'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bot, 
  Home, 
  MessageSquare, 
  Database, 
  BarChart3, 
  Settings, 
  HelpCircle,
  LogOut,
  User,
  Menu,
  X,
  Plus,
  TestTube,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  Crown
} from 'lucide-react'

const navigation = [
  { 
    name: 'Overview', 
    href: '/dashboard', 
    icon: Home,
    description: 'Dashboard overview'
  },
  { 
    name: 'Chatbots', 
    href: '/dashboard/chatbots', 
    icon: Bot,
    description: 'Manage your AI assistants'
  },
  { 
    name: 'Conversations', 
    href: '/dashboard/conversations', 
    icon: MessageSquare,
    description: 'Chat history & analytics'
  },
  { 
    name: 'Training Data', 
    href: '/dashboard/training', 
    icon: Database,
    description: 'Files, websites & content'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    description: 'Performance insights'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Account preferences'
  },
  { 
    name: 'Tests', 
    href: '/dashboard/tests', 
    icon: TestTube, 
    isDev: true,
    description: 'Database testing suite'
  },
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

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

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
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const isCurrentPage = (href) => {
    return pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
  }

  const getCurrentPageTitle = () => {
    const currentNav = navigation.find(nav => isCurrentPage(nav.href))
    return currentNav?.name || 'Dashboard'
  }

  const userPlan = profile?.subscription_plan || 'free'
  const planInfo = planConfig[userPlan]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl">
            {/* Mobile header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  LunieAI
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                if (item.isDev && process.env.NODE_ENV === 'production') return null
                const isActive = isCurrentPage(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#EBF6FC] to-[#F4CAF7]/10 text-[#94B9F9] shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                      isActive ? 'text-[#94B9F9]' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {item.isDev && (
                      <Badge variant="outline" className="text-xs">DEV</Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white border-r border-gray-200/60">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
            <div className="w-9 h-9 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              LunieAI
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navigation.map((item) => {
              if (item.isDev && process.env.NODE_ENV === 'production') return null
              const isActive = isCurrentPage(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#EBF6FC] to-[#F4CAF7]/10 text-[#94B9F9] shadow-sm border border-[#94B9F9]/20'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-4 transition-colors ${
                    isActive ? 'text-[#94B9F9]' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                  {item.isDev && (
                    <Badge variant="outline" className="text-xs">DEV</Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#94B9F9]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Action */}
          <div className="p-4 border-t border-gray-100">
            <Link href="/dashboard/chatbots/new">
              <Button className="w-full bg-[#2777fc] hover:bg-[#fb8a8f] text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Chatbot
              </Button>
            </Link>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white text-sm font-medium">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <div className="flex items-center mt-1">
                  {planInfo.icon && <planInfo.icon className="w-3 h-3 mr-1 text-gray-500" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planInfo.bgColor} ${planInfo.color}`}>
                    {planInfo.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-x-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getCurrentPageTitle()}
                  </h1>
                  {planInfo.icon && userPlan !== 'free' && (
                    <Badge className={`${planInfo.bgColor} ${planInfo.color} border-0`}>
                      <planInfo.icon className="w-3 h-3 mr-1" />
                      {planInfo.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-x-4">
                {/* Search */}
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#FB8A8F] rounded-full"></span>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-0" align="end">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <Badge className={`mt-1 ${planInfo.bgColor} ${planInfo.color} border-0 text-xs`}>
                            {planInfo.icon && <planInfo.icon className="w-3 h-3 mr-1" />}
                            {planInfo.name} Plan
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="cursor-pointer">
                          <User className="mr-3 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings" className="cursor-pointer">
                          <Settings className="mr-3 h-4 w-4" />
                          Account Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/help" className="cursor-pointer">
                          <HelpCircle className="mr-3 h-4 w-4" />
                          Help & Support
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    
                    <div className="border-t border-gray-100 py-1">
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}