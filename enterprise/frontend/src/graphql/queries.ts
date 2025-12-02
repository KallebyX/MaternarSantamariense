import { gql } from '@apollo/client'

// ============================================
// AUTH QUERIES
// ============================================
export const ME = gql`
  query Me {
    me {
      id
      email
      username
      firstName
      lastName
      role
      avatar
      department
      position
      totalXP
      level
      weeklyXP
      currentStreak
      longestStreak
      lastActive
      isOnline
      createdAt
    }
  }
`

// ============================================
// COURSES QUERIES
// ============================================
export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      title
      description
      thumbnail
      category
      difficulty
      xpReward
      estimatedTime
      isActive
      totalLessons
      totalEnrollments
      enrollment {
        id
        enrolledAt
        completedAt
        progress
      }
      lessons {
        id
        title
        content
        videoUrl
        order
        xpReward
        isCompleted
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      title
      description
      thumbnail
      category
      difficulty
      xpReward
      estimatedTime
      isActive
      totalLessons
      totalEnrollments
      enrollment {
        id
        enrolledAt
        completedAt
        progress
      }
      lessons {
        id
        title
        content
        videoUrl
        order
        xpReward
        isCompleted
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_MY_COURSES = gql`
  query GetMyCourses {
    myCourses {
      id
      title
      description
      thumbnail
      category
      difficulty
      xpReward
      estimatedTime
      isActive
      totalLessons
      totalEnrollments
      enrollment {
        id
        enrolledAt
        completedAt
        progress
      }
      lessons {
        id
        title
        content
        videoUrl
        order
        xpReward
        isCompleted
      }
      createdAt
      updatedAt
    }
  }
`

// ============================================
// GAMIFICATION QUERIES
// ============================================
export const GET_ACHIEVEMENTS = gql`
  query GetAchievements {
    achievements {
      id
      title
      description
      icon
      xpReward
      type
      condition
    }
  }
`

export const GET_MY_ACHIEVEMENTS = gql`
  query GetMyAchievements {
    myAchievements {
      id
      unlockedAt
      achievement {
        id
        title
        description
        icon
        xpReward
        type
      }
    }
  }
`

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      id
      firstName
      lastName
      username
      avatar
      totalXP
      level
      weeklyXP
    }
  }
`

// ============================================
// CHAT QUERIES
// ============================================
export const GET_CHANNELS = gql`
  query GetChannels {
    channels {
      id
      name
      description
      type
      createdAt
      updatedAt
      messages {
        id
        content
        type
        createdAt
        sender {
          id
          username
          avatar
        }
      }
      members {
        id
        joinedAt
        role
        user {
          id
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

export const GET_CHANNEL = gql`
  query GetChannel($id: ID!) {
    channel(id: $id) {
      id
      name
      description
      type
      createdAt
      updatedAt
      messages {
        id
        content
        type
        fileUrl
        fileName
        isEdited
        createdAt
        sender {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      members {
        id
        joinedAt
        role
        user {
          id
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($channelId: ID!, $limit: Int, $offset: Int) {
    messages(channelId: $channelId, limit: $limit, offset: $offset) {
      id
      content
      type
      fileUrl
      fileName
      isEdited
      createdAt
      sender {
        id
        username
        firstName
        lastName
        avatar
      }
    }
  }
`

// ============================================
// CALENDAR QUERIES
// ============================================
export const GET_EVENTS = gql`
  query GetEvents($startDate: DateTime, $endDate: DateTime) {
    events(startDate: $startDate, endDate: $endDate) {
      id
      title
      description
      startDate
      endDate
      type
      location
      isAllDay
      createdAt
      updatedAt
      organizer {
        id
        firstName
        lastName
        email
        avatar
      }
      attendees {
        id
        status
        user {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      startDate
      endDate
      type
      location
      isAllDay
      createdAt
      updatedAt
      organizer {
        id
        firstName
        lastName
        email
        avatar
      }
      attendees {
        id
        status
        user {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

// ============================================
// PROJECTS QUERIES
// ============================================
export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      description
      status
      priority
      startDate
      dueDate
      createdAt
      updatedAt
      members {
        id
        role
        joinedAt
        user {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
        assignee {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      priority
      startDate
      dueDate
      createdAt
      updatedAt
      members {
        id
        role
        joinedAt
        user {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
        assignee {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  }
`

export const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    myProjects {
      id
      name
      description
      status
      priority
      startDate
      dueDate
      createdAt
      updatedAt
      members {
        id
        role
        joinedAt
        user {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
      }
    }
  }
`

// ============================================
// POLICIES QUERIES
// ============================================
export const GET_POLICIES = gql`
  query GetPolicies {
    policies {
      id
      title
      content
      version
      category
      isActive
      requiresAcknowledgment
      createdAt
      updatedAt
      userRead {
        id
        readAt
        acknowledged
      }
    }
  }
`

export const GET_POLICY = gql`
  query GetPolicy($id: ID!) {
    policy(id: $id) {
      id
      title
      content
      version
      category
      isActive
      requiresAcknowledgment
      createdAt
      updatedAt
      userRead {
        id
        readAt
        acknowledged
      }
    }
  }
`

// ============================================
// LINKS QUERIES
// ============================================
export const GET_LINKS = gql`
  query GetLinks {
    links {
      id
      title
      url
      description
      category
      isActive
      createdAt
      updatedAt
    }
  }
`

// ============================================
// DASHBOARD QUERIES
// ============================================
export const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics {
    me {
      id
      totalXP
      level
      weeklyXP
    }
    projects {
      id
      status
    }
    myCourses {
      id
      enrollment {
        progress
      }
    }
  }
`

// ============================================
// ADMIN QUERIES
// ============================================
export const GET_USERS = gql`
  query GetUsers {
    # This would need to be implemented in backend
    users {
      id
      email
      username
      firstName
      lastName
      role
      department
      position
      totalXP
      level
      isOnline
      createdAt
    }
  }
`

// ============================================
// ANALYTICS QUERIES
// ============================================
export const GET_ANALYTICS = gql`
  query GetAnalytics {
    me {
      id
      totalXP
      level
      weeklyXP
    }
    projects {
      id
      name
      status
      priority
    }
    myCourses {
      id
      enrollment {
        progress
      }
    }
    events {
      id
      title
      type
      startDate
    }
  }
`

