// src/components/dashboard/overview/QuickActions.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  MessageSquare,
  Settings,
  ArrowUpRight
} from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      title: 'View Analytics',
      description: 'Detailed insights and performance metrics',
      icon: BarChart3,
      color: '#94B9F9',
      bgColor: 'from-[#94B9F9]/20 to-[#94B9F9]/30',
      hoverColor: 'group-hover:bg-[#94B9F9] group-hover:text-white group-hover:border-[#94B9F9]'
    },
    {
      title: 'View Conversations',
      description: 'Browse and manage chat history',
      icon: MessageSquare,
      color: '#F4CAF7',
      bgColor: 'from-[#F4CAF7]/20 to-[#F4CAF7]/30',
      hoverColor: 'group-hover:bg-[#F4CAF7] group-hover:text-white group-hover:border-[#F4CAF7]'
    },
    {
      title: 'Customize Bot',
      description: 'Update settings and training data',
      icon: Settings,
      color: '#FB8A8F',
      bgColor: 'from-[#FB8A8F]/20 to-[#FB8A8F]/30',
      hoverColor: 'group-hover:bg-[#FB8A8F] group-hover:text-white group-hover:border-[#FB8A8F]'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <Card key={index} className="border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className={`w-16 h-16 bg-gradient-to-br ${action.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-8 h-8" style={{ color: action.color }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{action.description}</p>
            <Button variant="outline" className={`w-full ${action.hoverColor}`}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              {action.title.split(' ')[0] === 'View' ? action.title.split(' ')[1] : action.title.split(' ')[0]}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}