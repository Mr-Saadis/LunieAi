// src/components/dashboard/home/FeaturesShowcase.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Database,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react'

export default function FeaturesShowcase() {
  const features = [
    {
      title: 'Smart Training',
      description: 'Upload files, add websites, or enter text manually. Our AI understands context and learns from your data.',
      icon: Database,
      color: 'text-[#94B9F9]',
      bgColor: 'bg-[#94B9F9]/10',
      borderColor: 'border-[#94B9F9]/20',
      improvement: '+15%',
      metric: 'accuracy'
    },
    {
      title: 'Multi-Platform',
      description: 'Deploy seamlessly on websites, WhatsApp, social media, and more with one-click integration.',
      icon: MessageSquare,
      color: 'text-[#F4CAF7]',
      bgColor: 'bg-[#F4CAF7]/10',
      borderColor: 'border-[#F4CAF7]/20',
      improvement: '+23%',
      metric: 'engagement'
    },
    {
      title: 'Analytics',
      description: 'Track conversations, monitor performance, and get insights to continuously improve your chatbot.',
      icon: BarChart3,
      color: 'text-[#FB8A8F]',
      bgColor: 'bg-[#FB8A8F]/10',
      borderColor: 'border-[#FB8A8F]/20',
      improvement: '+31%',
      metric: 'efficiency'
    }
  ]

  return (
    <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#F4CAF7] to-[#FB8A8F] rounded-full blur-3xl"></div>
      </div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold">
              <Target className="w-6 h-6 mr-3 text-[#94B9F9]" />
              Why Choose LunieAI?
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Powerful features designed to boost your customer experience
            </CardDescription>
          </div>
          <div className="hidden md:block">
            <Badge className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Powered
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`relative p-6 rounded-2xl border-2 ${feature.borderColor} ${feature.bgColor} hover:scale-105 transition-all duration-300 group cursor-pointer`}
            >
              {/* Icon with animation */}
              <div className={`h-16 w-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 border ${feature.borderColor}`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h4 className="font-bold text-gray-900 mb-3 text-xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Improvement Badge */}
                <Badge 
                  variant="outline" 
                  className={`${feature.color} ${feature.borderColor} bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {feature.improvement} {feature.metric}
                </Badge>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-white/40 to-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-white/20 to-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Ready to experience these features?</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-[#94B9F9] font-medium">
            <Zap className="w-4 h-4" />
            <span>Get started in under 5 minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}