import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  progress?: boolean
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast Item Component
const ToastItem: React.FC<{
  toast: Toast
  onClose: (id: string) => void
}> = ({ toast, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(100)
  const startTimeRef = useRef(Date.now())
  const durationRef = useRef(toast.duration || 5000)

  useEffect(() => {
    if (!toast.progress) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, 100 - (elapsed / durationRef.current) * 100)
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [toast.progress])

  const getIcon = (type: ToastType) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
      info: Info
    }
    return icons[type]
  }

  const getColors = (type: ToastType) => {
    const colors = {
      success: {
        container: 'bg-green-50 border-green-200 text-green-900',
        icon: 'text-green-600',
        progress: 'bg-green-600'
      },
      error: {
        container: 'bg-red-50 border-red-200 text-red-900',
        icon: 'text-red-600',
        progress: 'bg-red-600'
      },
      warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: 'text-amber-600',
        progress: 'bg-amber-600'
      },
      info: {
        container: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: 'text-blue-600',
        progress: 'bg-blue-600'
      }
    }
    return colors[type]
  }

  const Icon = getIcon(toast.type)
  const colors = getColors(toast.type)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95, x: 100 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        ${colors.container}
        border rounded-lg shadow-lg backdrop-blur-sm
        overflow-hidden
        w-full sm:w-96
      `}
    >
      {/* Progress Bar */}
      {toast.progress && (
        <div className="h-1 bg-black/10">
          <motion.div
            className={`h-full ${colors.progress}`}
            initial={{ width: '100%' }}
            animate={{ width: `${timeLeft}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-sm mt-1.5 opacity-90 leading-relaxed">{toast.message}</p>
          )}

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                onClose(toast.id)
              }}
              className="mt-3 text-sm font-medium underline hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity rounded-md hover:bg-black/5 p-1"
          aria-label="Fechar notificação"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const newToast = {
      ...toast,
      id,
      progress: toast.progress !== false // Default to true
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const timer = setTimeout(() => {
      hideToast(id)
    }, toast.duration || 5000)

    timersRef.current.set(id, timer)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))

    // Clear timer if exists
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onClose={hideToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Helper hooks for common toast types with enhanced options
export const useSuccessToast = () => {
  const { showToast } = useToast()
  return useCallback((
    title: string,
    message?: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
  ) => {
    showToast({ type: 'success', title, message, ...options })
  }, [showToast])
}

export const useErrorToast = () => {
  const { showToast } = useToast()
  return useCallback((
    title: string,
    message?: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
  ) => {
    showToast({ type: 'error', title, message, ...options })
  }, [showToast])
}

export const useWarningToast = () => {
  const { showToast } = useToast()
  return useCallback((
    title: string,
    message?: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
  ) => {
    showToast({ type: 'warning', title, message, ...options })
  }, [showToast])
}

export const useInfoToast = () => {
  const { showToast } = useToast()
  return useCallback((
    title: string,
    message?: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>
  ) => {
    showToast({ type: 'info', title, message, ...options })
  }, [showToast])
}

