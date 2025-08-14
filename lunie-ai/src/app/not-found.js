import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Search className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}