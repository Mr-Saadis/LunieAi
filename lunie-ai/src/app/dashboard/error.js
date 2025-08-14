'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-semibold bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
          Dashboard Error
        </h1>
        
        <p className="text-gray-600 mb-6">
          There was a problem loading your dashboard. This might be a temporary issue.
        </p>
        
        <div className="space-y-3">
          <Button onClick={reset} className="w-full bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Dashboard
          </Button>
          
          <Button variant="outline" asChild className="w-full ">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}