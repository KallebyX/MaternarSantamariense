import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'destructive' | 'outline' | 'info'
  size?: 'sm' | 'default' | 'lg'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  dot = false
}) => {
  const variants = {
    default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    warning: 'bg-amber-100 text-amber-800',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    info: 'bg-blue-100 text-blue-800'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium transition-colors
      ${sizes[size]} ${variants[variant]} ${className}
    `}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'