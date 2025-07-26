"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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

import { TestTube} from 'lucide-react'


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
  ChevronRight,
  Zap
} from 'lucide-react'
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
  { name: 'Chatbots', href: '/dashboard/chatbots', icon: Bot, current: false },
  { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare, current: false },
  { name: 'Training Data', href: '/dashboard/training', icon: Database, current: false },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: false },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: false },
  // Add these test navigation items
  { name: 'Database Tests', href: '/dashboard/tests', icon: TestTube, current: false, isDev: true },
  { name: 'Quick Tests', href: '/dashboard/tests/quick', icon: Zap, current: false, isDev: true },
]

const quickActions = [
  { name: 'Create Chatbot', href: '/dashboard/chatbots/new', icon: Plus, color: 'bg-blue-500' },
  { name: 'Upload Files', href: '/dashboard/training/upload', icon: Database, color: 'bg-green-500' },
  { name: 'View Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'bg-purple-500' },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Get user profile
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Bot className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">LunieAI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="mt-6 px-3">
              {navigation.map((item) => {
  // Hide dev items in production
  if (item.isDev && process.env.NODE_ENV === 'production') {
    return null
  }
  
  return (
    <li key={item.name}>
      <Link
        href={item.href}
        className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-colors ${
          item.current
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
        }`}
      >
        <item.icon className={`h-5 w-5 shrink-0 ${
          item.current ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-700'
        }`} />
        {item.name}
        {item.isDev && (
          <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
            DEV
          </span>
        )}
      </Link>
    </li>
  )
})}

            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Bot className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">LunieAI</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-colors ${
                          item.current
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 ${
                          item.current ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-700'
                        }`} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Quick Actions */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {quickActions.map((action) => (
                    <li key={action.name}>
                      <Link
                        href={action.href}
                        className="text-gray-700 hover:text-blue-700 hover:bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-colors"
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium text-white ${action.color}`}>
                          <action.icon className="h-3 w-3" />
                        </span>
                        <span className="truncate">{action.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Help */}
              <li className="mt-auto">
                <Link
                  href="/help"
                  className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors"
                >
                  <HelpCircle className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-blue-700" />
                  Help & Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 shadow-sm lg:px-6">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden lg:flex lg:items-center lg:gap-x-2">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                {profile?.subscription_plan && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    profile.subscription_plan === 'free' 
                      ? 'bg-gray-100 text-gray-800'
                      : profile.subscription_plan === 'pro'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    <Zap className="w-3 h-3 mr-1" />
                    {profile.subscription_plan}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}