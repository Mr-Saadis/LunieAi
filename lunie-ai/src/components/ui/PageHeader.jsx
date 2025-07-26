// src/components/ui/PageHeader.jsx
import { Button } from '@/components/ui/button'

export function PageHeader({ 
  title, 
  description, 
  action,
  breadcrumb,
  className = ""
}) {
  return (
    <div className={`border-b border-gray-200 pb-6 mb-8 ${className}`}>
      {breadcrumb && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-gray-700">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>
        {action && (
          <Button {...action.props}>
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}