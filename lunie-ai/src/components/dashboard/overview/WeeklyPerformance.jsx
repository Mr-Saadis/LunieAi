// src/components/dashboard/overview/WeeklyPerformance.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Filter,
  RefreshCw,
  Star
} from 'lucide-react'

export default function WeeklyPerformance({ analytics }) {
  return (
    <Card className="lg:col-span-2 border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BarChart3 className="w-5 h-5 mr-3 text-[#94B9F9]" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Conversations and satisfaction trends over the past week</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              7 Days
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analytics.weeklyData.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 text-sm font-medium text-gray-600">{day.day}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                      <div 
                        className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(day.conversations / 70) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.conversations}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{day.satisfaction}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}