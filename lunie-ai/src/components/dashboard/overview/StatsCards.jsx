// src/components/dashboard/overview/StatsCards.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  MessageSquare,
  Send,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'

export default function StatsCards({ chatbot, analytics }) {
  const getChangePercentage = (current, previous) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change) => {
    if (change > 0) return TrendingUp
    if (change < 0) return TrendingDown
    return Activity
  }

  // Calculate changes
  const conversationChange = getChangePercentage(analytics.today.conversations, analytics.yesterday.conversations)
  const messageChange = getChangePercentage(analytics.today.messages, analytics.yesterday.messages)
  const satisfactionChange = getChangePercentage(analytics.today.satisfaction, analytics.yesterday.satisfaction)
  const responseTimeChange = getChangePercentage(analytics.yesterday.avgResponseTime, analytics.today.avgResponseTime)

  const stats = [
    {
      title: 'Total Conversations',
      value: chatbot.total_conversations.toLocaleString(),
      change: conversationChange,
      icon: MessageSquare,
      color: 'from-[#94B9F9] to-[#B8D4FD]',
      bgColor: 'bg-[#94B9F9]/10'
    },
    {
      title: 'Total Messages',
      value: chatbot.total_messages.toLocaleString(),
      change: messageChange,
      icon: Send,
      color: 'from-[#F4CAF7] to-[#F8D7F9]',
      bgColor: 'bg-[#F4CAF7]/10'
    },
    {
      title: 'Satisfaction Score',
      value: chatbot.satisfaction_rating.toFixed(1),
      suffix: '/5.0',
      change: satisfactionChange,
      icon: Star,
      color: 'from-[#FB8A8F] to-[#FDB5B7]',
      bgColor: 'bg-[#FB8A8F]/10'
    },
    {
      title: 'Avg Response Time',
      value: chatbot.response_time.toFixed(1),
      suffix: 's',
      change: responseTimeChange,
      icon: Zap,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const ChangeIcon = getChangeIcon(stat.change)
        return (
          <Card key={index} className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.includes('emerald') ? 'text-emerald-600' : stat.color.includes('94B9F9') ? 'text-[#94B9F9]' : stat.color.includes('F4CAF7') ? 'text-[#F4CAF7]' : 'text-[#FB8A8F]'}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getChangeColor(stat.change)}`}>
                  <ChangeIcon className="w-4 h-4" />
                  <span className="font-medium">{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && <span className="text-lg text-gray-500">{stat.suffix}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}