import React from 'react'

type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'dnd'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  fallback?: string
  status?: StatusType
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  notification?: number | boolean
  ring?: boolean
  ringColor?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  className = '',
  fallback,
  status,
  statusPosition = 'bottom-right',
  notification,
  ring = false,
  ringColor = 'ring-primary'
}) => {
  const sizes = {
    xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-2 h-2', notification: 'w-3.5 h-3.5 text-[8px]' },
    sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2.5 h-2.5', notification: 'w-4 h-4 text-[9px]' },
    md: { container: 'w-10 h-10', text: 'text-base', status: 'w-3 h-3', notification: 'w-5 h-5 text-[10px]' },
    lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3.5 h-3.5', notification: 'w-6 h-6 text-xs' },
    xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4', notification: 'w-7 h-7 text-sm' },
    '2xl': { container: 'w-24 h-24', text: 'text-3xl', status: 'w-5 h-5', notification: 'w-8 h-8 text-base' }
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
    dnd: 'bg-red-500'
  }

  const statusPositions = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-left': 'bottom-0 left-0'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getColorFromName = (name: string) => {
    // Generate consistent color based on name hash
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-cyan-500 text-white',
      'bg-teal-500 text-white',
      'bg-orange-500 text-white'
    ]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const displayName = fallback || name || alt || ''
  const initials = displayName ? getInitials(displayName) : '?'
  const sizeClasses = sizes[size]
  const avatarColor = displayName ? getColorFromName(displayName) : 'bg-muted text-muted-foreground'

  return (
    <div className="relative inline-block">
      {/* Avatar */}
      <div
        className={`
          ${sizeClasses.container}
          rounded-full
          overflow-hidden
          ${ring ? `ring-2 ${ringColor}` : ''}
          ${className}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`
              w-full h-full
              flex items-center justify-center
              font-semibold
              ${sizeClasses.text}
              ${avatarColor}
            `}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute ${statusPositions[statusPosition]}
            ${sizeClasses.status}
            rounded-full
            ${statusColors[status]}
            ring-2 ring-background
            ${status === 'dnd' ? 'border-2 border-background' : ''}
          `}
          aria-label={`Status: ${status}`}
        >
          {status === 'dnd' && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-1/2 h-0.5 bg-background" />
            </span>
          )}
        </span>
      )}

      {/* Notification Badge */}
      {notification && (
        <span
          className={`
            absolute -top-1 -right-1
            ${sizeClasses.notification}
            rounded-full
            bg-destructive text-destructive-foreground
            flex items-center justify-center
            font-bold
            ring-2 ring-background
          `}
          aria-label={typeof notification === 'number' ? `${notification} notificações` : 'Nova notificação'}
        >
          {typeof notification === 'number' ? (notification > 99 ? '99+' : notification) : ''}
        </span>
      )}
    </div>
  )
}

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 5,
  size = 'md',
  className = ''
}) => {
  const childrenArray = React.Children.toArray(children)
  const displayedChildren = childrenArray.slice(0, max)
  const remainingCount = childrenArray.length - max

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl'
  }

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {displayedChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={`
            ${sizes[size]}
            rounded-full
            bg-muted text-muted-foreground
            flex items-center justify-center
            font-semibold
            ring-2 ring-background
            ${sizes[size].includes('text-') ? '' : 'text-sm'}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}