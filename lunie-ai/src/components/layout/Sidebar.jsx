
// components/layout/Sidebar.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { navigationItems, planConfig } from '@/lib/constants'

export function Sidebar({ user, profile }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const planInfo = planConfig[profile?.subscription_plan] || planConfig.free

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <img src="/Lunie.png" alt="LunieAI" className="h-8 w-8" />
          {!collapsed && <span className="font-bold text-xl">LunieAI</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem 
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
              {profile?.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              <Badge variant="secondary" className="mt-1">
                {planInfo.icon && <planInfo.icon className="w-3 h-3 mr-1" />}
                {planInfo.name}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-white"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '→' : '←'}
      </Button>
    </div>
  )
}
