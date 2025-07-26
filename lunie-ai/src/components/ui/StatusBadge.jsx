
// src/components/ui/StatusBadge.jsx
export function StatusBadge({ status, size = "default" }) {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    error: { label: 'Error', className: 'bg-red-100 text-red-800' },
    processing: { label: 'Processing', className: 'bg-blue-100 text-blue-800' }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  const config = statusConfig[status] || statusConfig.inactive

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses[size]}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'active' ? 'bg-green-400' :
        status === 'processing' ? 'bg-blue-400' :
        status === 'pending' ? 'bg-yellow-400' :
        status === 'error' ? 'bg-red-400' : 'bg-gray-400'
      }`} />
      {config.label}
    </span>
  )
}
