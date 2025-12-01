import { PrismaClient, NotificationType } from '@prisma/client'
import { logger } from '../utils/logger.js'

const prisma = new PrismaClient()

export interface CreateNotificationData {
  userId: string
  title: string
  message: string
  type?: NotificationType
  category?: string
  actionUrl?: string
}

export interface BulkNotificationData {
  userIds: string[]
  title: string
  message: string
  type?: NotificationType
  category?: string
  actionUrl?: string
}

export class NotificationService {

  async create(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          category: data.category,
          actionUrl: data.actionUrl
        }
      })

      logger.info(`Notification created for user ${data.userId}: ${data.title}`)

      return notification
    } catch (error) {
      logger.error('Error creating notification:', error)
      throw error
    }
  }

  async createBulk(data: BulkNotificationData) {
    try {
      const notifications = await prisma.notification.createMany({
        data: data.userIds.map(userId => ({
          userId,
          title: data.title,
          message: data.message,
          type: data.type || 'INFO',
          category: data.category,
          actionUrl: data.actionUrl
        }))
      })

      logger.info(`${notifications.count} notifications created for ${data.userIds.length} users`)

      return notifications
    } catch (error) {
      logger.error('Error creating bulk notifications:', error)
      throw error
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      })

      return notification
    } catch (error) {
      logger.error('Error marking notification as read:', error)
      throw error
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: { isRead: true }
      })

      logger.info(`Marked ${result.count} notifications as read for user ${userId}`)

      return result.count
    } catch (error) {
      logger.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    } catch (error) {
      logger.error('Error getting unread count:', error)
      return 0
    }
  }

  async getUserNotifications(userId: string, limit = 20, unreadOnly = false) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly ? { isRead: false } : {})
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      logger.error('Error getting user notifications:', error)
      throw error
    }
  }

  async delete(id: string) {
    try {
      await prisma.notification.delete({
        where: { id }
      })

      return true
    } catch (error) {
      logger.error('Error deleting notification:', error)
      return false
    }
  }

  async deleteOld(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          isRead: true
        }
      })

      logger.info(`Deleted ${result.count} old notifications`)

      return result.count
    } catch (error) {
      logger.error('Error deleting old notifications:', error)
      return 0
    }
  }

  // Convenience methods for common notification types

  async notifyAchievementUnlocked(userId: string, achievementTitle: string, xpEarned: number) {
    return this.create({
      userId,
      title: 'Nova Conquista Desbloqueada!',
      message: `Parabéns! Você desbloqueou a conquista "${achievementTitle}" e ganhou ${xpEarned} XP!`,
      type: 'ACHIEVEMENT',
      category: 'gamification'
    })
  }

  async notifyNewMessage(userId: string, senderName: string, channelName: string, channelId: string) {
    return this.create({
      userId,
      title: 'Nova Mensagem',
      message: `${senderName} enviou uma mensagem em ${channelName}`,
      type: 'MESSAGE',
      category: 'chat',
      actionUrl: `/chat/${channelId}`
    })
  }

  async notifyEventReminder(userId: string, eventTitle: string, eventId: string) {
    return this.create({
      userId,
      title: 'Lembrete de Evento',
      message: `O evento "${eventTitle}" está próximo`,
      type: 'EVENT',
      category: 'calendar',
      actionUrl: `/calendar/${eventId}`
    })
  }

  async notifyTaskAssigned(userId: string, taskTitle: string, projectName: string, taskId: string) {
    return this.create({
      userId,
      title: 'Nova Tarefa Atribuída',
      message: `Você foi atribuído à tarefa "${taskTitle}" no projeto "${projectName}"`,
      type: 'TASK',
      category: 'projects',
      actionUrl: `/projects/task/${taskId}`
    })
  }

  async notifyTaskDueSoon(userId: string, taskTitle: string, dueDate: Date) {
    return this.create({
      userId,
      title: 'Tarefa com Prazo Próximo',
      message: `A tarefa "${taskTitle}" vence em ${this.formatDateDistance(dueDate)}`,
      type: 'WARNING',
      category: 'projects'
    })
  }

  async notifyCourseCompleted(userId: string, courseTitle: string, xpEarned: number) {
    return this.create({
      userId,
      title: 'Curso Concluído!',
      message: `Parabéns! Você concluiu o curso "${courseTitle}" e ganhou ${xpEarned} XP!`,
      type: 'SUCCESS',
      category: 'training'
    })
  }

  async notifyLevelUp(userId: string, newLevel: number) {
    return this.create({
      userId,
      title: 'Level Up!',
      message: `Parabéns! Você alcançou o nível ${newLevel}!`,
      type: 'ACHIEVEMENT',
      category: 'gamification'
    })
  }

  private formatDateDistance(date: Date): string {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      return 'menos de 1 hora'
    }
  }
}

export const notificationService = new NotificationService()
