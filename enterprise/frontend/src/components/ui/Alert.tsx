import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  title?: string
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  title,
  onClose,
  className = ''
}) => {
  const variants = {
    default: {
      container: 'bg-muted border-border text-foreground',
      icon: <Info className="h-5 w-5" />
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const currentVariant = variants[variant]

  return (
    <div
      role="alert"
      className={`
        relative w-full rounded-lg border p-4 ${currentVariant.container} ${className}
      `}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          {currentVariant.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-semibold leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm opacity-90">
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Fechar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

Alert.displayName = 'Alert'
