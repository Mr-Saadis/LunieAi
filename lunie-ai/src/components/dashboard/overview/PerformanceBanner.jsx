// src/components/dashboard/overview/PerformanceBanner.jsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Flame,
  Share2,
  Download
} from 'lucide-react'

export default function PerformanceBanner({ chatbot }) {
  return (
    <Card className="border-gray-200 bg-gradient-to-r from-[#94B9F9]/5 via-[#F4CAF7]/5 to-[#FB8A8F]/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9]/10 via-[#F4CAF7]/10 to-[#FB8A8F]/10 rounded-lg"></div>
      <CardContent className="relative p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">🚀 Outstanding Performance!</h3>
              <p className="text-gray-600">Your chatbot is performing exceptionally well with a {chatbot.satisfaction_rating}/5 satisfaction rating</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-[#94B9F9] text-[#94B9F9] hover:bg-[#94B9F9] hover:text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Share Report
            </Button>
            <Button className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}