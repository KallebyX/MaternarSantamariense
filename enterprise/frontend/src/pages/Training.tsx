import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Clock,
  Users,
  Star,
  Search,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Target,
  Loader2,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Play,
  BookMarked
} from 'lucide-react'

import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../hooks/useAuth'
import { useGamification } from '../hooks/useGamification'

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  estimatedTime: string
  progress: number
  completedAt?: string
  thumbnail?: string
  totalLessons?: number
  totalEnrollments?: number
  xpReward?: number
  enrollment?: {
    id: string
    progress: number
    completedAt?: string
  }
  lessons?: Array<{ id: string; isCompleted: boolean }>
}

interface Achievement {
  id: string
  type: string
  isUnlocked: boolean
  title: string
  description: string
  icon?: string
  condition?: string
}

const Training: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { courses, myCourses, loading, enroll } = useCourses()
  const { user } = useAuth()
  const { achievements: allAchievements } = useGamification()

  // Contar cursos completos do usuário
  const completedCoursesCount = useMemo(() => {
    return myCourses.filter((c: Course) => c.completedAt).length
  }, [myCourses])

  // Calcular total de horas de estudo
  const totalHoursStudied = useMemo(() => {
    return myCourses.reduce((acc: number, course: Course) => {
      const hours = parseInt(course.estimatedTime) || 0
      if (course.completedAt) {
        return acc + hours
      }
      return acc + (hours * (course.progress / 100))
    }, 0)
  }, [myCourses])

  const certificatesCount = completedCoursesCount
  const currentStreak = user?.currentStreak || 0

  const stats = {
    coursesCompleted: completedCoursesCount,
    totalHours: Math.round(totalHoursStudied),
    certificates: certificatesCount,
    currentStreak
  }

  // Extrair categorias únicas dos cursos
  const categories = useMemo(() => {
    const categoryCounts = courses.reduce((acc: Record<string, number>, course: Course) => {
      acc[course.category] = (acc[course.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { id: 'all', name: 'Todos', count: courses.length },
      ...Object.entries(categoryCounts).map(([category, count]) => ({
        id: category,
        name: category,
        count
      }))
    ]
  }, [courses])

  // Filtrar conquistas relacionadas a cursos
  const courseAchievements = useMemo(() => {
    return allAchievements.filter((a: Achievement) =>
      a.type === 'COURSE_COMPLETION' && !a.isUnlocked
    ).slice(0, 3)
  }, [allAchievements])

  // Filtrar cursos baseado no filtro ativo e busca
  const filteredCourses = useMemo(() => {
    return courses.filter((course: Course) => {
      const matchesFilter = activeFilter === 'all' || course.category === activeFilter
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [courses, activeFilter, searchTerm])

  // Mapear dificuldade para cores
  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'success'
      case 'INTERMEDIATE': return 'warning'
      case 'ADVANCED': return 'danger'
      default: return 'secondary'
    }
  }

  // Traduzir dificuldade
  const translateDifficulty = (difficulty: string) => {
    const translations = {
      'BEGINNER': 'Básico',
      'INTERMEDIATE': 'Intermediário',
      'ADVANCED': 'Avançado'
    }
    return translations[difficulty as keyof typeof translations] || difficulty
  }

  // Handler para iniciar/continuar curso
  const handleCourseAction = async (courseId: string, hasEnrollment: boolean) => {
    if (!hasEnrollment) {
      try {
        await enroll(courseId)
      } catch (error) {
        console.error('Error enrolling:', error)
      }
    } else {
      window.location.href = `/training/${courseId}`
    }
  }

  // Calcular progresso em trilhas de aprendizado
  const learningPaths = useMemo(() => {
    const paths: Record<string, { total: number; completed: number }> = {}

    myCourses.forEach((course: Course) => {
      const category = course.category || 'Outros'
      if (!paths[category]) {
        paths[category] = { total: 0, completed: 0 }
      }
      paths[category].total++
      if (course.completedAt) {
        paths[category].completed++
      }
    })

    return Object.entries(paths).map(([category, data]) => ({
      category,
      ...data,
      percentage: Math.round((data.completed / data.total) * 100)
    })).slice(0, 3)
  }, [myCourses])

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

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              Treinamentos
            </h1>
            <p className="text-muted-foreground">
              Desenvolva suas habilidades com nossos cursos especializados
            </p>
          </div>
          <Button variant="default" icon={<BookOpen className="w-4 h-4" />}>
            Explorar Catálogo
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  {stats.coursesCompleted > 0 ? 'Ativo' : 'Comece'}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Cursos Concluídos</p>
              <p className="text-3xl font-bold">{stats.coursesCompleted}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  Total
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Horas de Estudo</p>
              <p className="text-3xl font-bold">{stats.totalHours}h</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  Earned
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Certificados</p>
              <p className="text-3xl font-bold">{stats.certificates}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  Dias
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Sequência</p>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                  iconPosition="left"
                  fullWidth
                />
                <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                  <TabsList className="w-full grid grid-cols-3 md:grid-cols-5 lg:flex">
                    {categories.slice(0, 5).map((category) => (
                      <TabsTrigger key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCourses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Tente ajustar sua busca ou filtros'
                    : 'Novos cursos serão adicionados em breve'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Courses Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredCourses.map((course: Course, index: number) => {
              const enrollment = course.enrollment
              const isCompleted = enrollment?.completedAt
              const progress = enrollment?.progress || 0
              const completedLessons = course.lessons?.filter((l: { id: string; isCompleted: boolean }) => l.isCompleted).length || 0
              const totalLessons = course.totalLessons || course.lessons?.length || 0

              return (
                <motion.div key={course.id} variants={item}>
                  <Card
                    variant="bordered"
                    className="overflow-hidden hover:border-primary/50 transition-all duration-200 h-full flex flex-col group"
                    hover
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={course.thumbnail || 'https://via.placeholder.com/800x450?text=Curso'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Curso'
                        }}
                      />
                      {isCompleted && (
                        <div className="absolute top-3 right-3 p-2 bg-green-500 rounded-full shadow-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {progress > 0 && !isCompleted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={getDifficultyVariant(course.difficulty) as any} size="sm">
                          {translateDifficulty(course.difficulty)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {course.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.totalEnrollments || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">{course.xpReward} XP</span>
                        </div>
                      </div>

                      {/* Progress */}
                      {progress > 0 && (
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium text-foreground">
                              {completedLessons}/{totalLessons} aulas
                            </span>
                          </div>
                          <Progress
                            value={progress}
                            variant={isCompleted ? 'success' : 'default'}
                            size="sm"
                          />
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant={isCompleted ? 'outline' : progress > 0 ? 'default' : 'secondary'}
                        onClick={() => handleCourseAction(course.id, !!enrollment)}
                        disabled={loading}
                        icon={
                          isCompleted ? <BookMarked className="w-4 h-4" /> :
                          progress > 0 ? <Play className="w-4 h-4" /> :
                          <ChevronRight className="w-4 h-4" />
                        }
                        iconPosition="right"
                      >
                        {isCompleted ? 'Revisar' : progress > 0 ? 'Continuar' : 'Iniciar Curso'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Paths */}
          {learningPaths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Trilhas de Aprendizado
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {learningPaths.map((path, index) => (
                    <div
                      key={path.category}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === 0
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-foreground">
                          {path.category}
                        </p>
                        <Badge variant={index === 0 ? 'default' : 'secondary'} size="sm">
                          {path.percentage}%
                        </Badge>
                      </div>
                      <Progress
                        value={path.percentage}
                        variant={path.percentage === 100 ? 'success' : 'default'}
                        size="sm"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {path.completed}/{path.total} cursos concluídos
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Achievements */}
          {courseAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    Conquistas Pendentes
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courseAchievements.map((achievement: Achievement) => {
                    const condition = JSON.parse(achievement.condition || '{}')
                    const currentProgress = condition.type === 'course_completion'
                      ? completedCoursesCount
                      : 0
                    const totalRequired = condition.count || 1
                    const progressPercent = Math.min((currentProgress / totalRequired) * 100, 100)

                    return (
                      <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="text-2xl shrink-0">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {achievement.description}
                          </p>
                          <Progress
                            value={progressPercent}
                            variant="success"
                            size="sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentProgress}/{totalRequired}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                  Resumo
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Cursos Disponíveis</span>
                  <span className="text-lg font-bold text-foreground">{courses.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Em Progresso</span>
                  <span className="text-lg font-bold text-foreground">
                    {myCourses.filter((c: Course) => !c.completedAt && c.progress > 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <span className="text-sm font-medium text-primary">Taxa de Conclusão</span>
                  <span className="text-lg font-bold text-primary">
                    {myCourses.length > 0
                      ? Math.round((completedCoursesCount / myCourses.length) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Training
