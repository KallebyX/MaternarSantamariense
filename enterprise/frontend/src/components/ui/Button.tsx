import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'link' | 'default'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95'

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md focus:ring-primary/50',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md focus:ring-secondary/50',
    outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring/50',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-ring/50',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md focus:ring-destructive/50',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md focus:ring-green-500/50',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md focus:ring-amber-500/50',
    info: 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md focus:ring-blue-500/50',
    link: 'text-primary underline-offset-4 hover:underline focus:ring-0',
    default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md focus:ring-secondary/50'
  }

  const sizes = {
    xs: 'h-7 px-2.5 text-xs rounded-md',
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    xl: 'h-12 px-8 text-lg'
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}