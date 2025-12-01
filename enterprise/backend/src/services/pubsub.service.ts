import { PubSub } from 'graphql-subscriptions'
import { logger } from '../utils/logger.js'

// Create PubSub instance
export const pubsub = new PubSub()

// Subscription event names
export const EVENTS = {
  MESSAGE_ADDED: 'MESSAGE_ADDED',
  USER_ONLINE_STATUS: 'USER_ONLINE_STATUS',
  TASK_UPDATED: 'TASK_UPDATED',
  NOTIFICATION_ADDED: 'NOTIFICATION_ADDED',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  EVENT_UPDATED: 'EVENT_UPDATED'
} as const

// Helper functions to publish events

export function publishMessage(channelId: string, message: any) {
  logger.debug(`Publishing message to channel ${channelId}`)
  pubsub.publish(`${EVENTS.MESSAGE_ADDED}.${channelId}`, {
    messageAdded: message
  })
}

export function publishUserStatus(user: any) {
  logger.debug(`Publishing user status for ${user.id}`)
  pubsub.publish(EVENTS.USER_ONLINE_STATUS, {
    userOnlineStatus: user
  })
}

export function publishTaskUpdate(projectId: string, task: any) {
  logger.debug(`Publishing task update for project ${projectId}`)
  pubsub.publish(`${EVENTS.TASK_UPDATED}.${projectId}`, {
    taskUpdated: task
  })
}

export function publishNotification(userId: string, notification: any) {
  logger.debug(`Publishing notification for user ${userId}`)
  pubsub.publish(`${EVENTS.NOTIFICATION_ADDED}.${userId}`, {
    notificationAdded: notification
  })
}

export function publishAchievement(userId: string, achievement: any) {
  logger.debug(`Publishing achievement for user ${userId}`)
  pubsub.publish(`${EVENTS.ACHIEVEMENT_UNLOCKED}.${userId}`, {
    achievementUnlocked: achievement
  })
}

export function publishProjectUpdate(projectId: string, project: any) {
  logger.debug(`Publishing project update for ${projectId}`)
  pubsub.publish(`${EVENTS.PROJECT_UPDATED}.${projectId}`, {
    projectUpdated: project
  })
}

export function publishEventUpdate(event: any) {
  logger.debug(`Publishing event update for ${event.id}`)
  pubsub.publish(EVENTS.EVENT_UPDATED, {
    eventUpdated: event
  })
}
