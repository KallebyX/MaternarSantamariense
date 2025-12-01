import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../components/providers/AuthProvider'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import {
  Baby,
  Heart,
  Activity,
  TrendingUp,
  Award,
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  Bell,
  Star,
  MessageSquare,
  Stethoscope,
  Sparkles
} from 'lucide-react'

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    me {
      id
      firstName
      lastName
      avatar
      department
      totalXP
      level
      weeklyXP
      currentStreak
    }
    myCourses(orderBy: { enrolledAt: desc }, limit: 3) {
      id
      progress
      course {
        id
        title
        thumbnail
        category
        totalLessons
      }
    }
    myAchievements(limit: 4) {
      id
      unlockedAt
      achievement {
        id
        title
        icon
        xpReward
      }
    }
    recentActivity(limit: 5) {
      type
      title
      timestamp
      xpEarned
    }
    events(where: { startDate: { gte: "now" } }, orderBy: { startDate: asc }, limit: 3) {
      id
      title
      startDate
      location
      type
      attendees
    }
  }
`

const Dashboard = () => {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState('')
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bom dia')
    else if (hour < 18) setGreeting('Boa tarde')
    else setGreeting('Boa noite')
  }, [])

  const stats = [
    {
      title: 'Pacientes Atendidas',
      value: '156',
      change: '+12 esta semana',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      bgGlow: 'rgba(236, 72, 153, 0.1)'
    },
    {
      title: 'Bebês Acompanhados',
      value: '89',
      change: '5 novos',
      icon: Baby,
      color: 'from-purple-500 to-purple-600',
      bgGlow: 'rgba(168, 85, 247, 0.1)'
    },
    {
      title: 'Taxa de Satisfação',
      value: '98%',
      change: '+2% este mês',
      icon: Star,
      color: 'from-amber-500 to-amber-600',
      bgGlow: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Equipe Ativa',
      value: '24/7',
      change: 'Plantão completo',
      icon: Stethoscope,
      color: 'from-emerald-500 to-emerald-600',
      bgGlow: 'rgba(16, 185, 129, 0.1)'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 maternar-card bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20"
      >
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar 
            src={user?.avatar || '/avatars/laura.jpg'} 
            alt={user?.name} 
            size="xl" 
            className="maternar-avatar ring-4 ring-pink-200 dark:ring-pink-800"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {greeting}, {user?.firstName || 'Laura'}! 
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="maternar-badge">
                <Sparkles className="w-3 h-3" />
                Nível {data?.me?.level || 10}
              </span>
              <span className="maternar-tag">
                <Activity className="w-3 h-3" />
                {data?.me?.weeklyXP || 450} XP esta semana
              </span>
              <span className="maternar-tag">
                🔥 {data?.me?.currentStreak || 12} dias de sequência
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="maternar-button">
              <Bell className="w-5 h-5 mr-2" />
              3 novas notificações
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} variants={item}>
              <div className="maternar-stat-card group">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                    style={{ boxShadow: `0 8px 16px ${stat.bgGlow}` }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Courses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="maternar-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BookOpen className="w-5 h-5 text-pink-500 mr-2"/>
              Cursos em Andamento
            </h2>
            <div className="space-y-4">
              {data?.myCourses?.map((enrollment: any) => (
                <div key={enrollment.id} className="maternar-list-item flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-100 to-purple-100">
                    <img 
                      src={enrollment.course.thumbnail || '/courses/default.jpg'} 
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {enrollment.course.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.course.category} • {enrollment.course.totalLessons} aulas
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="maternar-progress w-24 mb-1">
                      <div 
                        className="maternar-progress-bar"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {enrollment.progress}%
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.myCourses || data.myCourses.length === 0) && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum curso em andamento
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="maternar-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Award className="w-5 h-5 text-amber-500 mr-2"/>
              Conquistas Recentes
            </h2>
            <div className="space-y-3">
              {data?.myAchievements?.map((userAchievement: any) => (
                <div key={userAchievement.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-3xl">
                    {userAchievement.achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {userAchievement.achievement.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      +{userAchievement.achievement.xpReward} XP
                    </p>
                  </div>
                </div>
              ))}
              {(!data?.myAchievements || data.myAchievements.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma conquista recente
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="maternar-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Activity className="w-5 h-5 text-emerald-500 mr-2 animate-pulse"/>
              Atividade Recente
            </h2>
            <div className="space-y-3">
              {data?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="maternar-list-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {activity.xpEarned > 0 && (
                      <span className="maternar-badge">
                        +{activity.xpEarned} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="maternar-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Calendar className="w-5 h-5 text-purple-500 mr-2"/>
              Próximos Eventos
            </h2>
            <div className="space-y-3">
              {data?.events?.map((event: any) => (
                <div key={event.id} className="maternar-list-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')} • {event.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {event.attendees} participantes
                        </span>
                      </div>
                    </div>
                    <span className="maternar-tag">
                      {event.type === 'MEETING' ? '🏢 Reunião' : '📚 Treinamento'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 maternar-card bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10"
      >
        <div className="flex flex-wrap justify-around items-center gap-4 text-center">
          <div>
            <MessageSquare className="w-5 h-5 text-pink-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">42</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Mensagens</p>
          </div>
          <div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">18</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tarefas Completas</p>
          </div>
          <div>
            <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">94%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Produtividade</p>
          </div>
          <div>
            <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">156</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Vidas Tocadas</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard