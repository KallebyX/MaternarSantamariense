import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Play,
  Lock,
  Trophy,
  Loader2,
  AlertCircle
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useCourse } from '../hooks/useCourses'
import { useCourses } from '../hooks/useCourses'

interface Lesson {
  id: string
  title: string
  type: string
  duration: number
  order: number
  isCompleted: boolean
  content?: string
  videoUrl?: string
  xpReward?: number
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { course, loading: courseLoading } = useCourse(id || '')
  const { completeLesson, loading: actionLoading } = useCourses()
  const [selectedLesson, setSelectedLesson] = useState<any>(null)

  const loading = courseLoading || actionLoading

  // Traduzir dificuldade
  const translateDifficulty = (difficulty: string) => {
    const translations = {
      'BEGINNER': 'Básico',
      'INTERMEDIATE': 'Intermediário',
      'ADVANCED': 'Avançado'
    }
    return translations[difficulty as keyof typeof translations] || difficulty
  }

  // Mapear dificuldade para cores
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      await completeLesson(lessonId)
      // Fechar a visualização da lição após completar
      setSelectedLesson(null)
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Curso não encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            O curso que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/training')}>
            Voltar para Treinamentos
          </Button>
        </Card>
      </div>
    )
  }

  const enrollment = course.enrollment
  const lessons: Lesson[] = course.lessons || []
  const progress = enrollment?.progress || 0
  const completedLessons = lessons.filter((l: Lesson) => l.isCompleted).length
  const isCompleted = enrollment?.completedAt

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/training')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar para Treinamentos
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Badge className={getDifficultyColor(course.difficulty)}>
                {translateDifficulty(course.difficulty)}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {course.category}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Concluído
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 mb-4">
              {course.description}
            </p>

            <div className="flex items-center text-sm text-gray-500 space-x-6">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {course.estimatedTime}
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {lessons.length} aulas
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-yellow-400" />
                {course.xpReward} XP ao completar
              </span>
            </div>
          </div>

          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-64 h-40 object-cover rounded-lg ml-8"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
        </div>

        {/* Progress Bar */}
        {enrollment && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso do Curso</span>
              <span>{completedLessons}/{lessons.length} aulas concluídas ({progress}%)</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-maternar-blue-600" />
              Aulas do Curso
            </h2>

            <div className="space-y-3">
              {lessons.map((lesson: Lesson, index: number) => {
                const isLessonCompleted = lesson.isCompleted
                const isLocked = !enrollment && index > 0
                const isActive = selectedLesson?.id === lesson.id

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all ${
                        isActive
                          ? 'border-2 border-maternar-blue-500 bg-blue-50'
                          : isLessonCompleted
                          ? 'bg-green-50 border border-green-200'
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => !isLocked && setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isLessonCompleted
                              ? 'bg-green-500 text-white'
                              : isLocked
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-maternar-blue-100 text-maternar-blue-600'
                          }`}>
                            {isLessonCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              <span className="font-semibold">{index + 1}</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className={`font-medium ${
                              isLessonCompleted ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 space-x-3">
                              {lesson.videoUrl && (
                                <span className="flex items-center">
                                  <Play className="w-3 h-3 mr-1" />
                                  Vídeo
                                </span>
                              )}
                              <span className="flex items-center">
                                <Award className="w-3 h-3 mr-1 text-yellow-400" />
                                {lesson.xpReward} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={`w-5 h-5 ${
                          isLocked ? 'text-gray-300' : 'text-gray-400'
                        }`} />
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {lessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Este curso ainda não possui aulas cadastradas.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Content */}
          {selectedLesson ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedLesson.title}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLesson(null)}
                  >
                    Fechar
                  </Button>
                </div>

                {selectedLesson.videoUrl && (
                  <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={selectedLesson.videoUrl}
                      controls
                      className="w-full h-full"
                      poster={course.thumbnail}
                    >
                      Seu navegador não suporta vídeos.
                    </video>
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {selectedLesson.content}
                  </div>
                </div>

                {!selectedLesson.isCompleted && enrollment && (
                  <Button
                    className="w-full bg-gradient-to-r from-maternar-blue-600 to-maternar-pink-600"
                    onClick={() => handleCompleteLesson(selectedLesson.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Marcar como Concluída (+{selectedLesson.xpReward} XP)
                  </Button>
                )}

                {selectedLesson.isCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Aula concluída!
                      </p>
                      <p className="text-xs text-green-700">
                        Você ganhou {selectedLesson.xpReward} XP
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <Card className="p-6 bg-gradient-to-br from-maternar-blue-50 to-maternar-pink-50">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto text-maternar-blue-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma aula
                </h3>
                <p className="text-sm text-gray-600">
                  Clique em uma aula ao lado para começar seus estudos
                </p>
              </div>
            </Card>
          )}

          {/* Course Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Estatísticas
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-semibold text-gray-900">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aulas Concluídas</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {completedLessons}/{lessons.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">XP Total</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {course.xpReward} XP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo Estimado</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {course.estimatedTime}
                  </span>
                </div>
              </div>

              {isCompleted && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-semibold text-green-900">
                      Parabéns! Curso Concluído
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Você ganhou {course.xpReward} XP de bônus
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Enrollment Info */}
          {!enrollment && (
            <Card className="p-6 bg-yellow-50 border border-yellow-200">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Você não está inscrito
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Inscreva-se para acessar todas as aulas e ganhar XP
                </p>
                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => navigate('/training')}
                >
                  Voltar e Inscrever-se
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
