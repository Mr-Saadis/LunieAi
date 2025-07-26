// src/components/ui/EmptyState.jsx
import { Button } from '@/components/ui/button'

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ""
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button {...action.props}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

