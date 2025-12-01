import React from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Target,
  Award,
  Star,
  TrendingUp,
  Gift,
  Users,
  Calendar,
  CheckCircle,
  Medal,
  Crown,
  Zap,
  Flame,
  Sparkles
} from 'lucide-react'

import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'

const Gamification: React.FC = () => {
  const userStats = {
    level: 15,
    xp: 8750,
    nextLevelXp: 10000,
    totalPoints: 45230,
    streak: 12,
    badges: 24,
    rank: 3,
    completedChallenges: 89
  }

  const achievements = [
    {
      id: 1,
      title: 'Primeiros Passos',
      description: 'Complete sua primeira avaliação de saúde',
      icon: <CheckCircle className="w-6 h-6" />,
      points: 100,
      completed: true,
      rarity: 'comum'
    },
    {
      id: 2,
      title: 'Campeão de Consistência',
      description: 'Registre atividades por 30 dias consecutivos',
      icon: <Calendar className="w-6 h-6" />,
      points: 500,
      completed: true,
      rarity: 'raro'
    },
    {
      id: 3,
      title: 'Buscador de Conhecimento',
      description: 'Complete 10 cursos de treinamento',
      icon: <Trophy className="w-6 h-6" />,
      points: 1000,
      completed: false,
      progress: 7,
      total: 10,
      rarity: 'épico'
    },
    {
      id: 4,
      title: 'Trabalho em Equipe',
      description: 'Colabore em 5 projetos',
      icon: <Users className="w-6 h-6" />,
      points: 750,
      completed: false,
      progress: 3,
      total: 5,
      rarity: 'raro'
    },
    {
      id: 5,
      title: 'Cuidador Lendário',
      description: 'Complete 100 avaliações de saúde',
      icon: <Crown className="w-6 h-6" />,
      points: 5000,
      completed: false,
      progress: 45,
      total: 100,
      rarity: 'lendário'
    },
    {
      id: 6,
      title: 'Velocista',
      description: 'Complete um curso em menos de 1 hora',
      icon: <Zap className="w-6 h-6" />,
      points: 300,
      completed: true,
      rarity: 'raro'
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'Dr. Maria Silva', points: 52340, avatar: '/avatars/maria.jpg', level: 18 },
    { rank: 2, name: 'João Santos', points: 48920, avatar: '/avatars/joao.jpg', level: 17 },
    { rank: 3, name: 'Ana Costa', points: 45230, avatar: '/avatars/ana.jpg', level: 15, isCurrentUser: true },
    { rank: 4, name: 'Pedro Lima', points: 43180, avatar: '/avatars/pedro.jpg', level: 15 },
    { rank: 5, name: 'Sofia Oliveira', points: 41560, avatar: '/avatars/sofia.jpg', level: 14 },
    { rank: 6, name: 'Carlos Mendes', points: 40120, avatar: '/avatars/carlos.jpg', level: 14 },
    { rank: 7, name: 'Juliana Rocha', points: 38900, avatar: '/avatars/juliana.jpg', level: 13 }
  ]

  const challenges = [
    {
      id: 1,
      title: 'Quarta do Bem-Estar',
      description: 'Complete 3 atividades de saúde nesta quarta',
      reward: '200 XP + Wellness Badge',
      deadline: '2025-10-09',
      progress: 2,
      total: 3,
      difficulty: 'fácil'
    },
    {
      id: 2,
      title: 'Mestre do Treinamento',
      description: 'Termine 2 módulos de treinamento esta semana',
      reward: '500 XP + Knowledge Badge',
      deadline: '2025-10-13',
      progress: 0,
      total: 2,
      difficulty: 'médio'
    },
    {
      id: 3,
      title: 'Colaboração em Equipe',
      description: 'Trabalhe com 3 colegas diferentes em projetos',
      reward: '1000 XP + Teamwork Badge',
      deadline: '2025-10-15',
      progress: 1,
      total: 3,
      difficulty: 'difícil'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'comum': return 'secondary'
      case 'raro': return 'info'
      case 'épico': return 'warning'
      case 'lendário': return 'success'
      default: return 'default'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil': return 'success'
      case 'médio': return 'warning'
      case 'difícil': return 'danger'
      default: return 'default'
    }
  }

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              Gamificação
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e conquiste recompensas
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg"
          >
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Nível {userStats.level}</p>
              <p className="text-2xl font-bold text-primary-foreground">
                {userStats.totalPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="w-16 h-16 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
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
                <Star className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  Nível {userStats.level}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Experiência</p>
              <p className="text-3xl font-bold mb-3">{userStats.xp} XP</p>
              <Progress
                value={(userStats.xp / userStats.nextLevelXp) * 100}
                className="bg-blue-400/30"
                variant="default"
              />
              <p className="text-xs text-white/60 mt-2">
                {userStats.nextLevelXp - userStats.xp} XP para próximo nível
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Flame className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  {userStats.streak > 7 ? 'Em Chamas!' : 'Ativo'}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Sequência</p>
              <p className="text-3xl font-bold">{userStats.streak} dias</p>
              <p className="text-sm text-white/70 mt-2">
                Continue assim! 🔥
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Medal className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  Top {userStats.rank}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Ranking</p>
              <p className="text-3xl font-bold">#{userStats.rank}</p>
              <p className="text-sm text-white/70 mt-2">
                No ranking global
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <Award className="w-8 h-8 opacity-80" />
                <Badge variant="outline" className="border-white/30 text-white">
                  {userStats.badges}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Conquistas</p>
              <p className="text-3xl font-bold">{userStats.badges}</p>
              <p className="text-sm text-white/70 mt-2">
                Emblemas desbloqueados
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                  Conquistas
                </h2>
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${achievement.completed
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg shrink-0
                      ${achievement.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {achievement.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={getRarityColor(achievement.rarity) as any} size="sm">
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {!achievement.completed && achievement.progress && (
                        <div className="space-y-1">
                          <Progress
                            value={(achievement.progress / achievement.total) * 100}
                            variant="success"
                            size="sm"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.total} concluído
                            </p>
                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                              +{achievement.points} pts
                            </p>
                          </div>
                        </div>
                      )}
                      {achievement.completed && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ Concluído (+{achievement.points} pts)
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                Ranking
              </h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((user) => (
                <motion.div
                  key={user.rank}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all
                    ${user.isCurrentUser
                      ? 'bg-primary/10 border-2 border-primary/30 shadow-sm'
                      : 'hover:bg-accent'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0
                    ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                      user.rank === 2 ? 'bg-gray-400 text-white' :
                      user.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }
                  `}>
                    {user.rank}
                  </div>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    fallback={user.name.charAt(0)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`
                      text-sm font-medium truncate
                      ${user.isCurrentUser ? 'text-primary' : 'text-foreground'}
                    `}>
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="ml-1 text-xs text-primary">(você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nível {user.level}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600 dark:text-red-500" />
                Desafios Ativos
              </h2>
              <Button variant="outline" size="sm" icon={<Gift className="w-4 h-4" />}>
                Explorar Mais
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group"
                >
                  <Card variant="bordered" className="h-full hover:border-primary/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={getDifficultyColor(challenge.difficulty) as any}>
                          {challenge.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(challenge.deadline).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {challenge.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <Progress
                            value={(challenge.progress / challenge.total) * 100}
                            variant={challenge.progress === challenge.total ? 'success' : 'default'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {challenge.progress}/{challenge.total} concluído
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs">{challenge.reward.split('+')[0].trim()}</span>
                          </div>
                          <Button
                            size="sm"
                            disabled={challenge.progress === challenge.total}
                            variant={challenge.progress === challenge.total ? 'outline' : 'default'}
                          >
                            {challenge.progress === challenge.total ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Concluído
                              </>
                            ) : (
                              'Participar'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Gamification
