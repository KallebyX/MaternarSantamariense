import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  CheckCheck,
  MessageSquare,
  Calendar,
  Award,
  FileText,
  Users,
  Clock
} from 'lucide-react'
import { Badge } from './ui/Badge'

interface Notification {
  id: string
  type: 'chat' | 'course' | 'event' | 'achievement' | 'policy' | 'project'
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'chat',
      title: 'Nova mensagem',
      message: 'João Silva mencionou você no chat',
      time: '2 min atrás',
      read: false,
      actionUrl: '/chat'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Conquista desbloqueada!',
      message: 'Você ganhou o badge "Estudante Dedicado"',
      time: '1 hora atrás',
      read: false,
      actionUrl: '/gamification'
    },
    {
      id: '3',
      type: 'event',
      title: 'Evento amanhã',
      message: 'Reunião de Equipe às 14:00',
      time: '3 horas atrás',
      read: false,
      actionUrl: '/calendar'
    },
    {
      id: '4',
      type: 'course',
      title: 'Novo curso disponível',
      message: 'Segurança do Paciente - Nível Avançado',
      time: '1 dia atrás',
      read: true,
      actionUrl: '/training'
    },
    {
      id: '5',
      type: 'policy',
      title: 'Política atualizada',
      message: 'Protocolo de Higienização v2.2',
      time: '2 dias atrás',
      read: true,
      actionUrl: '/policies'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    const icons = {
      chat: MessageSquare,
      course: FileText,
      event: Calendar,
      achievement: Award,
      policy: FileText,
      project: Users
    }
    return icons[type as keyof typeof icons] || Bell
  }

  const getIconColor = (type: string) => {
    const colors = {
      chat: 'bg-blue-100 text-blue-600',
      course: 'bg-green-100 text-green-600',
      event: 'bg-purple-100 text-purple-600',
      achievement: 'bg-yellow-100 text-yellow-600',
      policy: 'bg-red-100 text-red-600',
      project: 'bg-indigo-100 text-indigo-600'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        title="Abrir central de notificações"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-maternar-blue-600 hover:text-maternar-blue-700 font-medium flex items-center"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Marcar todas como lida
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => {
                      const Icon = getIcon(notification.type)
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            markAsRead(notification.id)
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="text-gray-400 hover:text-gray-600 ml-2"
                                  aria-label="Excluir notificação"
                                  title="Excluir notificação"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-maternar-blue-600 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                  <a
                    href="/notifications"
                    className="text-sm text-maternar-blue-600 hover:text-maternar-blue-700 font-medium"
                  >
                    Ver todas as notificações
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

