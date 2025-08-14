// components/layout/DashboardShell.jsx
'use client'

import { useUser } from '@/hooks/useUser'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function DashboardShell({ children }) {
  const { user, profile, loading, error } = useUser()

  if (loading) return <LoadingSpinner />
  if (error) throw error

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} profile={profile} />
      <div className="lg:pl-64">
        <TopNav user={user} profile={profile} />
        <main className="p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
