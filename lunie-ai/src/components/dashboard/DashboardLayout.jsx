//src/components/dashboard/DashboardLayout.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bot, 
  Home, 
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  TestTube,
  Sparkles,
  Crown
} from 'lucide-react'

// 🔝 GLOBAL NAVIGATION (Always visible)
const globalNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Overview & stats'
  },
  { 
    name: 'Chatbots', 
    href: '/dashboard/chatbots', 
    icon: Bot,
    description: 'Manage AI assistants'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User,
    description: 'Account settings'
  },
  { 
    name: 'Tests', 
    href: '/dashboard/tests', 
    icon: TestTube, 
    isDev: true,
    description: 'Database testing'
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

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
  const getUser = async () => {
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUser(data.user)
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  getUser()
}, [router])






const handleSignOut = async () => {
  try {
    const response = await fetch('/api/auth/signout', { method: 'POST' })
    
    if (response.ok) {
      toast.success('Signed out successfully')
      router.push('/auth/login')
    } else {
      throw new Error('Sign out failed')
    }
  } catch (error) {
    console.error('Sign out error:', error)
    toast.error('Error signing out')
    
    // Force redirect anyway
    router.push('/auth/login')
  }
}

  const ParrotLogo = ({ className = "w-10 h-10" }) => (
    <div className={`${className} relative flex items-center justify-center`}>
      <Image
        src="/Lunie.png"
        alt="LunieAI Logo"
        width={40}
        height={40}
        className="rounded-lg"
      />
    </div>
  )

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const isCurrentPage = (href) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    // Check if current path starts with the nav href but isn't a chatbot-specific route
    return pathname?.startsWith(href) && !pathname?.match(/\/dashboard\/[a-f0-9-]{36}\//)
  }

  const getCurrentPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname?.includes('/chatbots')) return 'Chatbots'
    if (pathname?.includes('/profile')) return 'Profile'
    if (pathname?.includes('/tests')) return 'Tests'
    
    const currentNav = globalNavigation.find(nav => isCurrentPage(nav.href))
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
      {/* 🔝 TOP NAVIGATION BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Global Nav */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center">
                <ParrotLogo className="w-10 h-10" />
                <span className="ml-3 text-xl font-semibold text-black">
                  LunieAI
                </span>
              </Link>

              {/* Global Navigation - Desktop */}
              <nav className="hidden md:flex space-x-6">
                {globalNavigation.map((item) => {
                  if (item.isDev && process.env.NODE_ENV === 'production') return null
                  const isActive = isCurrentPage(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'text-[#94B9F9] bg-[#EBF6FC]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 mr-2 ${
                        isActive ? 'text-[#94B9F9]' : 'text-gray-400'
                      }`} />
                      {item.name}
                      {item.isDev && (
                        <Badge variant="outline" className="ml-2 text-xs">DEV</Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right: Search, Notifications, User Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search - Desktop */}
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#FB8A8F] rounded-full"></span>
              </Button>

              {/* Create Chatbot - Quick Action */}
              {/* <Button asChild size="sm" className="hidden sm:flex bg-[#94B9F9] hover:bg-[#94B9F9]/90 text-white">
                <Link href="/dashboard/chatbots/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Link>
              </Button> */}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white text-xs">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-0" align="end">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white text-sm">
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

      {/* 📱 MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <div className="flex items-center">
                <ParrotLogo className="w-8 h-8" />
                <span className="ml-3 text-xl font-semibold">LunieAI</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="p-4">
              <div className="space-y-1">
                {globalNavigation.map((item) => {
                  if (item.isDev && process.env.NODE_ENV === 'production') return null
                  const isActive = isCurrentPage(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'text-[#94B9F9] bg-[#EBF6FC]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${
                        isActive ? 'text-[#94B9F9]' : 'text-gray-400'
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
              </div>

              {/* Mobile Quick Action */}
              <div className="mt-6 pt-6 border-t">
                <Button asChild className="w-full bg-[#94B9F9] hover:bg-[#94B9F9]/90 text-white">
                  <Link href="/dashboard/chatbots/new" onClick={() => setMobileMenuOpen(false)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Chatbot
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MAIN CONTENT */}
      <div className="flex-1">
        {/* Page Content */}
        <main className="px-2 sm:px-3 lg:px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}