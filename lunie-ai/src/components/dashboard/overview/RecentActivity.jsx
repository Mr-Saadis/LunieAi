// src/components/dashboard/overview/RecentActivity.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Activity,
  RefreshCw,
  MessageSquare,
  Settings,
  Star,
  CheckCircle,
  Zap,
  Clock
} from 'lucide-react'

export default function RecentActivity() {
  const activities = [
    {
      time: '2 minutes ago',
      action: 'New conversation started',
      user: 'Anonymous User',
      location: 'United States 🇺🇸',
      type: 'conversation',
      color: 'from-green-400 to-green-600'
    },
    {
      time: '15 minutes ago',
      action: 'Training data updated',
      user: 'System',
      location: 'Auto-update',
      type: 'system',
      color: 'from-blue-400 to-blue-600'
    },
    {
      time: '1 hour ago',
      action: 'High satisfaction rating received',
      user: 'Customer #2847',
      location: 'Canada 🇨🇦',
      type: 'feedback',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      time: '2 hours ago',
      action: 'Multiple conversations resolved',
      user: 'AI Assistant',
      location: 'Various',
      type: 'success',
      color: 'from-purple-400 to-purple-600'
    },
    {
      time: '3 hours ago',
      action: 'New integration activated',
      user: 'Admin',
      location: 'Dashboard',
      type: 'integration',
      color: 'from-pink-400 to-pink-600'
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'conversation': return MessageSquare
      case 'system': return Settings
      case 'feedback': return Star
      case 'success': return CheckCircle
      case 'integration': return Zap
      default: return Activity
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Activity className="w-5 h-5 mr-3 text-[#94B9F9]" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest interactions and system updates</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type)
            return (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.user} • {activity.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}