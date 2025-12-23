import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, gql } from '@apollo/client'
import {
  Users,
  Baby,
  Heart,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Activity,
  Target,
  MessageCircle,
  FolderKanban,
  GraduationCap,
  BarChart3,
  Flame,
  Zap,
  Star,
  ChevronRight,
  Plus
} from 'lucide-react'
import { useAuth } from '../components/providers/AuthProvider'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
    myCourses(orderBy: { enrolledAt: desc }, limit: 5) {
      id
      progress
      course {
        id
        title
        thumbnail
        category
        estimatedTime
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
    events(where: { startDate: { gte: "now" } }, orderBy: { startDate: asc }, limit: 4) {
      id
      title
      startDate
      location
      type
    }
    dashboardStats {
      totalUsers
      activeUsers
      coursesCompleted
      averageProgress
    }
  }
`

// Chart colors
const CHART_COLORS = {
  primary: '#1E4A7A',
  secondary: '#7AB844',
  accent: '#D42E5B',
  info: '#3B82F6',
  warning: '#F59E0B'
}

const PIE_COLORS = ['#1E4A7A', '#7AB844', '#D42E5B', '#3B82F6']

// Mock chart data (will be replaced with real data)
const weeklyActivityData = [
  { day: 'Seg', xp: 120, hours: 2 },
  { day: 'Ter', xp: 200, hours: 3.5 },
  { day: 'Qua', xp: 150, hours: 2.5 },
  { day: 'Qui', xp: 280, hours: 4 },
  { day: 'Sex', xp: 190, hours: 3 },
  { day: 'Sab', xp: 80, hours: 1 },
  { day: 'Dom', xp: 50, hours: 0.5 }
]

const courseProgressData = [
  { name: 'Concluídos', value: 8, color: '#7AB844' },
  { name: 'Em Andamento', value: 4, color: '#1E4A7A' },
  { name: 'Não Iniciados', value: 3, color: '#E5E7EB' }
]

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState('')
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA, {
    errorPolicy: 'all'
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bom dia')
    else if (hour < 18) setGreeting('Boa tarde')
    else setGreeting('Boa noite')
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  // Stats cards data
  const statsCards = [
    {
      title: 'Gestantes Ativas',
      value: data?.dashboardStats?.totalUsers || '156',
      change: '+12%',
      trend: 'up',
      icon: Heart,
      color: 'pink',
      bgGradient: 'from-maternar-pink-500 to-maternar-pink-600'
    },
    {
      title: 'Bebês Acompanhados',
      value: '89',
      change: '+5 novos',
      trend: 'up',
      icon: Baby,
      color: 'blue',
      bgGradient: 'from-maternar-blue-500 to-maternar-blue-600'
    },
    {
      title: 'Cursos Concluídos',
      value: data?.dashboardStats?.coursesCompleted || '234',
      change: '+18%',
      trend: 'up',
      icon: GraduationCap,
      color: 'green',
      bgGradient: 'from-maternar-green-500 to-maternar-green-600'
    },
    {
      title: 'Taxa de Engajamento',
      value: `${data?.dashboardStats?.averageProgress || 94}%`,
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600'
    }
  ]

  // Quick actions
  const quickActions = [
    { label: 'Novo Curso', icon: Plus, href: '/qualifica-profissional', color: 'bg-maternar-blue-500' },
    { label: 'Agendar', icon: Calendar, href: '/calendar', color: 'bg-maternar-green-500' },
    { label: 'Mensagem', icon: MessageCircle, href: '/chat', color: 'bg-maternar-pink-500' },
    { label: 'Projetos', icon: FolderKanban, href: '/projects', color: 'bg-purple-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        {...fadeInUp}
        className="enterprise-card p-6 bg-gradient-to-r from-maternar-blue-500 via-maternar-blue-600 to-maternar-green-600"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || '/avatars/default.jpg'}
                alt={user?.firstName}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/20"
              />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl lg:text-3xl font-bold">
                {greeting}, {user?.firstName || 'Usuário'}!
              </h1>
              <p className="text-white/80 mt-1">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-orange-300" />
              <span className="text-white font-semibold">{data?.me?.currentStreak || 12} dias</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="text-white font-semibold">{data?.me?.weeklyXP || 450} XP</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <Star className="h-5 w-5 text-amber-300" />
              <span className="text-white font-semibold">Nível {data?.me?.level || 10}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-medium text-sm">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, idx) => (
          <motion.div key={idx} variants={fadeInUp}>
            <div className="enterprise-stat-card h-full">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div {...fadeInUp} className="lg:col-span-2">
          <div className="enterprise-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Atividade Semanal</h3>
                <p className="text-sm text-gray-500">XP ganho e horas de estudo</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-maternar-blue-500" />
                  <span className="text-gray-600">XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-maternar-green-500" />
                  <span className="text-gray-600">Horas</span>
                </div>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke={CHART_COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorXp)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke={CHART_COLORS.secondary}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Course Progress */}
        <motion.div {...fadeInUp}>
          <div className="enterprise-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Progresso</h3>
              <Link to="/qualifica-profissional" className="text-sm text-maternar-blue-600 hover:text-maternar-blue-700 font-medium flex items-center gap-1">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseProgressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {courseProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">15</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {courseProgressData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <motion.div {...fadeInUp} className="lg:col-span-2">
          <div className="enterprise-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Meus Cursos</h3>
                <p className="text-sm text-gray-500">Continue de onde parou</p>
              </div>
              <Link to="/qualifica-profissional" className="enterprise-btn enterprise-btn-secondary text-sm">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {(data?.myCourses || []).slice(0, 3).map((enrollment: any, idx: number) => (
                <Link
                  key={enrollment.id || idx}
                  to={`/training/${enrollment.course?.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-maternar-blue-200 hover:bg-maternar-blue-50/30 transition-all group"
                >
                  <div className="h-16 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={enrollment.course?.thumbnail || '/courses/default.jpg'}
                      alt={enrollment.course?.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-maternar-blue-600">
                      {enrollment.course?.title || 'Curso'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {enrollment.course?.category} • {enrollment.course?.estimatedTime || '2h'}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 enterprise-progress h-2">
                        <div
                          className="enterprise-progress-bar"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-maternar-blue-500 transition-colors" />
                </Link>
              ))}
              {(!data?.myCourses || data.myCourses.length === 0) && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum curso em andamento</p>
                  <Link to="/qualifica-profissional" className="text-maternar-blue-600 text-sm font-medium mt-2 inline-block">
                    Explorar cursos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div {...fadeInUp}>
          <div className="enterprise-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Agenda</h3>
              <Link to="/calendar" className="text-sm text-maternar-blue-600 hover:text-maternar-blue-700 font-medium flex items-center gap-1">
                Ver agenda
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {(data?.events || []).map((event: any, idx: number) => {
                const eventDate = new Date(event.startDate)
                return (
                  <div
                    key={event.id || idx}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-maternar-blue-50 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-maternar-blue-600 uppercase">
                        {eventDate.toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-maternar-blue-700">
                        {eventDate.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {event.location && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {(!data?.events || data.events.length === 0) && (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <motion.div {...fadeInUp}>
          <div className="enterprise-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conquistas Recentes</h3>
                <p className="text-sm text-gray-500">Suas últimas medalhas</p>
              </div>
              <Link to="/gamification" className="text-sm text-maternar-blue-600 hover:text-maternar-blue-700 font-medium flex items-center gap-1">
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(data?.myAchievements || [
                { achievement: { icon: '🏆', title: 'Primeira Aula', xpReward: 50 } },
                { achievement: { icon: '🎯', title: '7 Dias Seguidos', xpReward: 100 } },
                { achievement: { icon: '📚', title: 'Curso Completo', xpReward: 200 } },
                { achievement: { icon: '⭐', title: 'Top 10', xpReward: 150 } }
              ]).map((ua: any, idx: number) => (
                <div
                  key={idx}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">{ua.achievement?.icon || '🏅'}</div>
                  <h4 className="font-medium text-gray-900 text-sm truncate">{ua.achievement?.title}</h4>
                  <p className="text-xs text-amber-600 font-medium mt-1">+{ua.achievement?.xpReward} XP</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...fadeInUp}>
          <div className="enterprise-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
                <p className="text-sm text-gray-500">Suas últimas ações</p>
              </div>
            </div>
            <div className="space-y-4">
              {(data?.recentActivity || [
                { type: 'course', title: 'Completou aula de Amamentação', timestamp: new Date().toISOString(), xpEarned: 25 },
                { type: 'achievement', title: 'Desbloqueou conquista "Dedicado"', timestamp: new Date(Date.now() - 3600000).toISOString(), xpEarned: 100 },
                { type: 'login', title: 'Streak de 7 dias mantido', timestamp: new Date(Date.now() - 7200000).toISOString(), xpEarned: 50 }
              ]).slice(0, 5).map((activity: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'course' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'achievement' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'course' ? <BookOpen className="h-4 w-4" /> :
                     activity.type === 'achievement' ? <Award className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {activity.xpEarned > 0 && (
                    <span className="enterprise-badge enterprise-badge-success">
                      +{activity.xpEarned} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
