// src/components/dashboard/overview/PopularQuestions.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Lightbulb,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronRight
} from 'lucide-react'

export default function PopularQuestions({ analytics }) {
  const getTrendIcon = (trend) => {
    if (trend === 'up') return { icon: TrendingUp, color: 'text-green-600' }
    if (trend === 'down') return { icon: TrendingDown, color: 'text-red-600' }
    return { icon: Activity, color: 'text-gray-600' }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Lightbulb className="w-5 h-5 mr-3 text-[#FB8A8F]" />
              Popular Questions
            </CardTitle>
            <CardDescription>Most frequently asked questions by your users</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analytics.popularQuestions.map((question, index) => {
            const { icon: TrendIcon, color } = getTrendIcon(question.trend)
            
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FB8A8F]/20 to-[#FB8A8F]/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-[#FB8A8F]">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{question.question}</p>
                    <p className="text-sm text-gray-600">{question.count} times asked</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 ${color}`}>
                    <TrendIcon className="w-4 h-4" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}