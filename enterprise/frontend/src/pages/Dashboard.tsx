import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
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
  Zap
} from 'lucide-react'

const Dashboard = () => {
  const stats = [
    {
      title: 'Usuários Ativos',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Cursos Ativos',
      value: '89',
      change: '+5 novos',
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Projetos',
      value: '23',
      change: '7 em andamento',
      changeType: 'neutral',
      icon: FolderKanban,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Taxa de Conclusão',
      value: '87%',
      change: '+3%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    }
  ]

  const quickActions = [
    { icon: BookOpen, label: 'Novo Curso', href: '/training' },
    { icon: FolderKanban, label: 'Novo Projeto', href: '/projects' },
    { icon: Calendar, label: 'Agendar Evento', href: '/calendar' },
    { icon: MessageSquare, label: 'Mensagens', href: '/chat' }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'achievement',
      title: 'Conquista Desbloqueada',
      description: 'Concluiu 10 cursos com excelência',
      time: 'há 2 horas',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      id: 2,
      type: 'project',
      title: 'Projeto Atualizado',
      description: 'Sistema de Autenticação - 85% completo',
      time: 'há 4 horas',
      icon: FolderKanban,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'course',
      title: 'Curso Concluído',
      description: 'Introdução à Saúde Materno-Infantil',
      time: 'há 1 dia',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'event',
      title: 'Evento Próximo',
      description: 'Reunião de Planejamento - Amanhã às 14h',
      time: 'amanhã',
      icon: Calendar,
      color: 'text-purple-600'
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
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao Maternar Santa-mariense
            </p>
          </div>
          <Badge dot variant="success" size="lg">
            Online
          </Badge>
        </div>

        <Alert variant="success" className="mt-4">
          <p>
            Sistema funcionando perfeitamente! Todas as funcionalidades estão operacionais.
          </p>
        </Alert>
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
                Metas do Mês
              </h2>
              <Button variant="ghost" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Cursos Concluídos', current: 8, target: 10, percentage: 80 },
                { label: 'Projetos Finalizados', current: 3, target: 5, percentage: 60 },
                { label: 'Horas de Treinamento', current: 24, target: 30, percentage: 80 }
              ].map((goal, index) => (
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
                      animate={{ width: `${goal.percentage}%` }}
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
