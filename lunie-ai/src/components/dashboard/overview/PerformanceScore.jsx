// src/components/dashboard/overview/PerformanceScore.jsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Crown
} from 'lucide-react'

export default function PerformanceScore({ chatbot }) {
  return (
    <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center text-xl">
          <Target className="w-5 h-5 mr-2 text-[#94B9F9]" />
          Performance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-full opacity-10"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center border-4 border-gradient-to-r from-[#94B9F9] to-[#F4CAF7]">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{chatbot.accuracy_score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Accuracy</span>
            <span className="font-medium text-gray-900">{chatbot.accuracy_score}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Response Time</span>
            <span className="font-medium text-gray-900">{chatbot.response_time}s</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Satisfaction</span>
            <span className="font-medium text-gray-900">{chatbot.satisfaction_rating}/5</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300">
            <Crown className="w-3 h-3 mr-1" />
            Excellent Performance
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}