// src/components/dashboard/home/SidebarWidgets.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  Settings,
  Crown,
  Zap,
  Bell,
  Bot,
  BarChart3,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react'

export default function SidebarWidgets({ profile, notifications, usagePercentage }) {
  const quickLinks = [
    {
      title: 'Manage Chatbots',
      href: '/dashboard/chatbots',
      icon: Bot,
      color: 'text-[#94B9F9]'
    },
    {
      title: 'View Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'text-[#FB8A8F]'
    },
    {
      title: 'Documentation',
      href: '/help',
      icon: FileText,
      color: 'text-gray-600'
    },
    {
      title: 'Profile Settings',
      href: '/dashboard/profile',
      icon: Settings,
      color: 'text-[#F4CAF7]'
    }
  ]

  const weeklyStats = [
    { label: 'Response time', value: '2.1s', trend: 'up', color: 'text-green-500' },
    { label: 'Accuracy rate', value: '94.2%', trend: 'up', color: 'text-green-500' },
    { label: 'Active users', value: '1,247', trend: 'up', color: 'text-green-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Account Status Widget */}
      <Card className="border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#94B9F9]/10 to-[#F4CAF7]/10 p-1">
          <CardHeader className="bg-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-4 h-4 text-white" />
              </div>
              Account Status
            </CardTitle>
          </CardHeader>
        </div>
        
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Plan</span>
            <Badge className={`${
              profile?.subscription_plan === 'free' ? 'bg-gray-100 text-gray-700' :
              profile?.subscription_plan === 'starter' ? 'bg-[#94B9F9]/10 text-[#94B9F9] border-[#94B9F9]/20' :
              profile?.subscription_plan === 'pro' ? 'bg-[#F4CAF7]/10 text-[#F4CAF7] border-[#F4CAF7]/20' :
              'bg-[#FB8A8F]/10 text-[#FB8A8F] border-[#FB8A8F]/20'
            } border capitalize`}>
              {profile?.subscription_plan === 'pro' && <Crown className="w-3 h-3 mr-1" />}
              {profile?.subscription_plan || 'Free'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Usage this month</span>
              <span className="font-medium">{profile?.usage_current_month || 0} / {profile?.usage_limit || 100}</span>
            </div>
            <div className="relative">
              <Progress value={usagePercentage} className="h-3" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] rounded-full opacity-20"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="font-medium">{usagePercentage.toFixed(0)}% used</span>
              <span>{profile?.usage_limit || 100}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-[#94B9F9]/20 text-[#94B9F9] hover:bg-[#94B9F9]/10" 
              disabled
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/dashboard/profile">
                <Settings className="w-4 h-4 mr-2" />
                Manage Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Widget */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F4CAF7] to-[#FB8A8F] rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-4 h-4 text-white" />
              </div>
              Notifications
            </div>
            <Badge variant="outline" className="text-xs border-[#94B9F9]/20 text-[#94B9F9]">
              {notifications?.filter(n => n.unread).length || 2} new
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {(notifications || [
            {
              id: 1,
              title: 'Weekly Summary Ready',
              description: 'Your weekly analytics report is now available',
              time: '1 hour ago',
              unread: true
            },
            {
              id: 2,
              title: 'New Feature: Voice Responses',
              description: 'Add voice capabilities to your chatbots',
              time: '2 days ago',
              unread: true
            }
          ]).slice(0, 3).map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                notification.unread 
                  ? 'border-[#94B9F9]/20 bg-gradient-to-r from-[#94B9F9]/5 to-[#F4CAF7]/5' 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
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
          
          <Button variant="ghost" size="sm" className="w-full hover:bg-gray-50">
            View All Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links Widget */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-2">
          {quickLinks.map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                  <link.icon className={`w-4 h-4 ${link.color}`} />
                </div>
                <span className="text-sm font-medium">{link.title}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Help & Support Widget */}
      <Card className="border-gray-200 bg-gradient-to-br from-[#94B9F9]/5 to-[#F4CAF7]/5 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Access our comprehensive guides, tutorials, and community support
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="w-full border-[#94B9F9]/20 hover:bg-[#94B9F9]/10"
              >
                <Link href="/help">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link href="/community">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats Widget */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="w-5 h-5 mr-2 text-[#94B9F9]" />
            This Week
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-1">{stat.value}</span>
                  <TrendingUp className={`w-3 h-3 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-[#94B9F9] font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Performance trending up
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}