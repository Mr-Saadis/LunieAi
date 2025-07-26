// src/app/dashboard/tests/quick/page.jsx
import { 
  QuickUserTest, 
  QuickChatbotTest, 
  QuickStatsTest,
  ErrorHandlingTest,
  RLSSecurityTest 
} from '@/components/testing/QuickTests'
import { PageHeader } from '@/components/ui/PageHeader'

export default function QuickTestsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Quick Database Tests"
        description="Fast individual tests for specific database operations"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tests', href: '/dashboard/tests' },
          { label: 'Quick Tests' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickUserTest />
        <QuickChatbotTest />
        <QuickStatsTest />
        <ErrorHandlingTest />
        <RLSSecurityTest />
      </div>
    </div>
  )
}