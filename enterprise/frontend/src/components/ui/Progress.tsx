import React from 'react'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'default' | 'lg'
  animated?: boolean
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  showValue = false,
  variant = 'default',
  size = 'default',
  animated = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variants = {
    default: 'bg-primary',
    success: 'bg-green-600',
    warning: 'bg-amber-500',
    danger: 'bg-destructive'
  }

  const sizes = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-3'
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${sizes[size]} ${className}`}>
        <div
          className={`
            ${variants[variant]} ${sizes[size]} rounded-full
            transition-all duration-500 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground mt-1 block">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}