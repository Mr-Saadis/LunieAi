// src/components/dashboard/home/QuickActionsGrid.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Plus,
  Upload,
  Globe,
  ArrowUpRight,
  Star,
  Clock,
  Zap
} from 'lucide-react'

export default function QuickActionsGrid() {
  const quickActions = [
    {
      title: 'Create Chatbot',
      description: 'Build your first AI assistant in minutes with our intuitive wizard',
      href: '/dashboard/chatbots/new',
      icon: Plus,
      gradient: 'from-[#94B9F9] to-[#F4CAF7]',
      bgGradient: 'from-[#94B9F9]/10 to-[#F4CAF7]/10',
      featured: true,
      estimatedTime: '5 min',
      popularity: 'Most Popular'
    },
    {
      title: 'Upload Training Files',
      description: 'Add documents, PDFs, and data files to train your chatbot',
      href: '/dashboard/training/upload',
      icon: Upload,
      gradient: 'from-[#F4CAF7] to-[#FB8A8F]',
      bgGradient: 'from-[#F4CAF7]/10 to-[#FB8A8F]/10',
      estimatedTime: '2 min',
      popularity: 'Quick Setup'
    },
    {
      title: 'Connect Website',
      description: 'Import content directly from your website for instant training',
      href: '/dashboard/training/website',
      icon: Globe,
      gradient: 'from-[#FB8A8F] to-[#94B9F9]',
      bgGradient: 'from-[#FB8A8F]/10 to-[#94B9F9]/10',
      estimatedTime: '3 min',
      popularity: 'Smart Import'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600 mt-1">Get started with these common tasks</p>
        </div>
        <Badge variant="outline" className="border-[#94B9F9]/20 text-[#94B9F9] bg-[#94B9F9]/5">
          <Star className="w-3 h-3 mr-1" />
          Popular Tasks
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className={`relative border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden ${
              action.featured ? 'ring-2 ring-[#94B9F9]/20 border-[#94B9F9]/30' : ''
            }`}
          >
            <Link href={action.href}>
              <CardContent className="p-6 relative">
                {/* Background Pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Featured Badge */}
                {action.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white border-0 text-xs shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {action.popularity}
                    </Badge>
                  </div>
                )}
                
                {/* Icon */}
                <div className={`relative h-16 w-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 mb-3 group-hover:text-[#94B9F9] transition-colors duration-300 text-lg">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {action.description}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#94B9F9] font-semibold group-hover:text-[#F4CAF7] transition-colors duration-300">
                      Get started
                      <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      {action.estimatedTime}
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-white/5 to-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}