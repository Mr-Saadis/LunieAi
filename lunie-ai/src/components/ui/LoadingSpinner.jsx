
// src/components/ui/LoadingSpinner.jsx
export function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={`border-2 border-blue-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`} />
  )
}