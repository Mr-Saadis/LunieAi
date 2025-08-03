// src/components/dashboard/home/DashboardStatsGrid.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Bot,
  MessageSquare,
  Users,
  Database,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react'

export default function DashboardStatsGrid({ stats }) {
  const statsData = [
    {
      title: 'Chatbots',
      value: stats.chatbots,
      icon: Bot,
      gradient: 'from-[#94B9F9] to-[#B8D4FD]',
      bgColor: 'bg-[#94B9F9]/10',
      iconColor: 'text-[#94B9F9]',
      trend: '+12%',
      trendLabel: 'this month',
      trendIcon: TrendingUp,
      trendColor: 'text-green-600'
    },
    {
      title: 'Conversations',
      value: stats.conversations,
      icon: MessageSquare,
      gradient: 'from-[#F4CAF7] to-[#F8D7F9]',
      bgColor: 'bg-[#F4CAF7]/10',
      iconColor: 'text-[#F4CAF7]',
      trend: '+8%',
      trendLabel: 'this week',
      trendIcon: Clock,
      trendColor: 'text-blue-600'
    },
    {
      title: 'Messages',
      value: stats.messages,
      icon: Users,
      gradient: 'from-[#FB8A8F] to-[#FDB5B7]',
      bgColor: 'bg-[#FB8A8F]/10',
      iconColor: 'text-[#FB8A8F]',
      trend: '+24%',
      trendLabel: 'today',
      trendIcon: Activity,
      trendColor: 'text-purple-600'
    },
    {
      title: 'Training Items',
      value: stats.trainingData,
      icon: Database,
      gradient: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      trend: 'Ready',
      trendLabel: 'to use',
      trendIcon: Database,
      trendColor: 'text-gray-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${stat.trendColor} bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border`}>
                <stat.trendIcon className="w-3 h-3" />
                <span className="font-medium">{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text transition-all duration-300">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{stat.trendLabel}</p>
            </div>
          </CardContent>
          
          {/* Floating decoration */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Card>
      ))}
    </div>
  )
}