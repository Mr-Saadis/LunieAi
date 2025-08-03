// src/components/dashboard/overview/AnalyticsGrid.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Globe,
  PieChart,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

export default function AnalyticsGrid({ analytics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Countries */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Globe className="w-5 h-5 mr-3 text-[#94B9F9]" />
            Top Countries
          </CardTitle>
          <CardDescription>Where your conversations are coming from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.topCountries.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <p className="font-medium text-gray-900">{country.country}</p>
                  <p className="text-sm text-gray-600">{country.conversations.toLocaleString()} conversations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{country.percentage}%</p>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] h-2 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Device Analytics */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <PieChart className="w-5 h-5 mr-3 text-[#F4CAF7]" />
            Device Usage
          </CardTitle>
          <CardDescription>How users access your chatbot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.devices.map((device, index) => {
            const IconComponent = device.icon
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{device.type}</p>
                    <p className="text-sm text-gray-600">{device.count.toLocaleString()} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{device.percentage}%</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-[#F4CAF7] to-[#FB8A8F] h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Sessions</span>
              <span className="font-medium text-gray-900">
                {analytics.devices.reduce((sum, device) => sum + device.count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}