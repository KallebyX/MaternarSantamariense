import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'
import { useCourses } from '../hooks/useCourses'
import { useProjects } from '../hooks/useProjects'
import { useCalendar } from '../hooks/useCalendar'
import {
  Users,
  BookOpen,
  FolderKanban,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  Target,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userStats, myAchievements, loading: gamificationLoading } = useGamification()
  const { courses, myCourses, loading: coursesLoading } = useCourses()
  const { projects, loading: projectsLoading } = useProjects()
  const { events, loading: eventsLoading } = useCalendar()

  const isLoading = gamificationLoading || coursesLoading || projectsLoading || eventsLoading

  // Calculate real stats from data
  const activeCourses = courses?.length || 0
  const enrolledCourses = myCourses?.length || 0
  const completedCourses = myCourses?.filter((c: any) => c.progress === 100)?.length || 0
  const activeProjects = projects?.filter((p: any) => p.status === 'ACTIVE')?.length || 0
  const totalProjects = projects?.length || 0
  const completionRate = enrolledCourses > 0 ? Math.round((completedCourses / enrolledCourses) * 100) : 0

  const stats = [
    {
      title: 'Meu Nível',
      value: userStats?.level?.toString() || '1',
      change: `${userStats?.xp || 0} XP`,
      changeType: 'positive',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Cursos Disponíveis',
      value: activeCourses.toString(),
      change: `${enrolledCourses} inscritos`,
      changeType: 'neutral',
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Projetos',
      value: totalProjects.toString(),
      change: `${activeProjects} em andamento`,
      changeType: 'neutral',
      icon: FolderKanban,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      change: `${completedCourses} completos`,
      changeType: completionRate >= 70 ? 'positive' : 'neutral',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    }
  ]

  const quickActions = [
    { icon: BookOpen, label: 'Ver Cursos', href: '/training' },
    { icon: FolderKanban, label: 'Projetos', href: '/projects' },
    { icon: Calendar, label: 'Calendário', href: '/calendar' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' }
  ]

  // Build recent activities from real data
  const recentActivities: any[] = []

  // Add recent achievements
  if (myAchievements && myAchievements.length > 0) {
    const recentAchievement = myAchievements[myAchievements.length - 1]
    recentActivities.push({
      id: 'achievement-1',
      type: 'achievement',
      title: 'Conquista Desbloqueada',
      description: recentAchievement.achievement?.title || 'Nova conquista obtida',
      time: 'recentemente',
      icon: Award,
      color: 'text-yellow-600'
    })
  }

  // Add courses in progress
  const coursesInProgress = myCourses?.filter((c: any) => c.progress > 0 && c.progress < 100) || []
  if (coursesInProgress.length > 0) {
    const recentCourse = coursesInProgress[0]
    recentActivities.push({
      id: 'course-1',
      type: 'course',
      title: 'Curso em Andamento',
      description: `${recentCourse.course?.title || 'Curso'} - ${recentCourse.progress}% completo`,
      time: 'em progresso',
      icon: BookOpen,
      color: 'text-blue-600'
    })
  }

  // Add active projects
  const activeProjectsList = projects?.filter((p: any) => p.status === 'ACTIVE') || []
  if (activeProjectsList.length > 0) {
    const recentProject = activeProjectsList[0]
    recentActivities.push({
      id: 'project-1',
      type: 'project',
      title: 'Projeto Ativo',
      description: recentProject.name || 'Projeto em andamento',
      time: 'em andamento',
      icon: FolderKanban,
      color: 'text-purple-600'
    })
  }

  // Add upcoming events
  const upcomingEvents = events?.filter((e: any) => new Date(e.startDate) > new Date()) || []
  if (upcomingEvents.length > 0) {
    const nextEvent = upcomingEvents[0]
    const eventDate = new Date(nextEvent.startDate)
    recentActivities.push({
      id: 'event-1',
      type: 'event',
      title: 'Próximo Evento',
      description: `${nextEvent.title} - ${eventDate.toLocaleDateString('pt-BR')}`,
      time: eventDate.toLocaleDateString('pt-BR'),
      icon: Calendar,
      color: 'text-green-600'
    })
  }

  // If no activities, show a placeholder
  if (recentActivities.length === 0) {
    recentActivities.push({
      id: 'welcome',
      type: 'welcome',
      title: 'Bem-vindo ao Sistema',
      description: 'Explore os cursos e projetos disponíveis',
      time: 'agora',
      icon: Activity,
      color: 'text-blue-600'
    })
  }

  // Calculate goals from real data
  const goals = [
    {
      label: 'Cursos Concluídos',
      current: completedCourses,
      target: Math.max(enrolledCourses, 5),
      percentage: enrolledCourses > 0 ? Math.round((completedCourses / Math.max(enrolledCourses, 5)) * 100) : 0
    },
    {
      label: 'Projetos Ativos',
      current: activeProjects,
      target: totalProjects || 3,
      percentage: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0
    },
    {
      label: 'Conquistas',
      current: myAchievements?.length || 0,
      target: 10,
      percentage: Math.min(((myAchievements?.length || 0) / 10) * 100, 100)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Olá, {user?.firstName || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao Maternar Santa Mariense
            </p>
          </div>
          <Badge dot variant="success" size="lg">
            Online
          </Badge>
        </div>

        {userStats && userStats.level > 1 && (
          <Alert variant="success" className="mt-4">
            <p>
              Parabéns! Você está no nível {userStats.level} com {userStats.xp} XP acumulados.
            </p>
          </Alert>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} variants={item}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {stat.changeType === 'positive' && (
                      <Badge variant="success" size="sm">
                        <ArrowUpRight className="h-3 w-3" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  {stat.changeType === 'neutral' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Ações Rápidas
              </h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    icon={<Icon className="h-4 w-4" />}
                    onClick={() => navigate(action.href)}
                  >
                    {action.label}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Atividades Recentes
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Seu Progresso
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/gamification')}>
                Ver Conquistas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{goal.label}</span>
                    <span className="text-muted-foreground">
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Dashboard
