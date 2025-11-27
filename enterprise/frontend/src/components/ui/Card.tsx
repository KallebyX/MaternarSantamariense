import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  onClick?: () => void
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick
}) => {
  const variants = {
    default: 'bg-card text-card-foreground border border-border shadow-sm',
    bordered: 'bg-card text-card-foreground border-2 border-border',
    elevated: 'bg-card text-card-foreground border-0 shadow-lg',
    ghost: 'bg-transparent',
    interactive: 'bg-card text-card-foreground border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200'
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : ''

  return (
    <div
      className={`
        rounded-lg
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverClasses}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`pt-0 ${className}`}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`flex items-center pt-0 ${className}`}>
      {children}
    </div>
  )
}

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'