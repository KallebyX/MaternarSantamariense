import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@apollo/client'
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
import { Spinner } from '../components/ui/Spinner'
import { useGamification } from '../hooks/useGamification'
import { useAuth } from '../hooks/useAuth'
import { GET_LEADERBOARD } from '../graphql/queries'

const Gamification: React.FC = () => {
  const { user } = useAuth()
  const { userStats, achievements, myAchievements, loading: gamificationLoading } = useGamification()

  // Fetch leaderboard from backend
  const { data: leaderboardData, loading: leaderboardLoading } = useQuery(GET_LEADERBOARD, {
    variables: { limit: 10 },
    errorPolicy: 'all'
  })

  const isLoading = gamificationLoading || leaderboardLoading

  // Calculate XP to next level (every 1000 XP = new level)
  const currentXP = userStats?.xp || 0
  const currentLevel = userStats?.level || 1
  const xpForCurrentLevel = (currentLevel - 1) * 1000
  const xpForNextLevel = currentLevel * 1000
  const xpProgress = currentXP - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel

  // Map achievements to display format
  const displayAchievements = achievements?.map((achievement: any) => {
    const isUnlocked = myAchievements?.some((ua: any) => ua.achievement?.id === achievement.id || ua.achievementId === achievement.id)
    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: getAchievementIcon(achievement.type),
      points: achievement.xpReward || 100,
      completed: isUnlocked,
      rarity: getRarityFromXP(achievement.xpReward)
    }
  }) || []

  // Map leaderboard data
  const leaderboard = leaderboardData?.leaderboard?.map((entry: any, index: number) => ({
    rank: index + 1,
    name: entry.name || `${entry.firstName} ${entry.lastName}`,
    points: entry.totalXP || 0,
    avatar: entry.avatar,
    level: entry.level || 1,
    isCurrentUser: entry.id === user?.id
  })) || []

  function getAchievementIcon(type: string) {
    switch (type) {
      case 'COURSE_COMPLETION': return <Trophy className="w-6 h-6" />
      case 'XP_MILESTONE': return <Star className="w-6 h-6" />
      case 'LOGIN_STREAK': return <Flame className="w-6 h-6" />
      case 'COMMUNITY_PARTICIPATION': return <Users className="w-6 h-6" />
      default: return <Award className="w-6 h-6" />
    }
  }

  function getRarityFromXP(xp: number): string {
    if (xp >= 1000) return 'lendário'
    if (xp >= 500) return 'épico'
    if (xp >= 200) return 'raro'
    return 'comum'
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'comum': return 'secondary'
      case 'raro': return 'info'
      case 'épico': return 'warning'
      case 'lendário': return 'success'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando gamificação...</p>
        </div>
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
              <p className="text-sm text-primary-foreground/80">Nível {currentLevel}</p>
              <p className="text-2xl font-bold text-primary-foreground">
                {currentXP.toLocaleString()} XP
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
                  Nível {currentLevel}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Experiência</p>
              <p className="text-3xl font-bold mb-3">{currentXP} XP</p>
              <Progress
                value={(xpProgress / xpNeeded) * 100}
                className="bg-blue-400/30"
                variant="default"
              />
              <p className="text-xs text-white/60 mt-2">
                {xpNeeded - xpProgress} XP para próximo nível
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
                  {(userStats?.streak || 0) > 7 ? 'Em Chamas!' : 'Ativo'}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Sequência</p>
              <p className="text-3xl font-bold">{userStats?.streak || 0} dias</p>
              <p className="text-sm text-white/70 mt-2">
                {userStats?.streak > 0 ? 'Continue assim! 🔥' : 'Comece sua sequência!'}
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
                  {userStats?.rank ? `Top ${userStats.rank}` : 'Ranqueado'}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">XP Semanal</p>
              <p className="text-3xl font-bold">{userStats?.weeklyXP || 0}</p>
              <p className="text-sm text-white/70 mt-2">
                Pontos esta semana
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
                  {myAchievements?.length || 0}
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-1">Conquistas</p>
              <p className="text-3xl font-bold">{myAchievements?.length || 0}</p>
              <p className="text-sm text-white/70 mt-2">
                de {achievements?.length || 0} disponíveis
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
                <Badge variant="secondary">
                  {myAchievements?.length || 0} / {achievements?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayAchievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conquista disponível ainda.</p>
                  <p className="text-sm">Continue usando o sistema para desbloquear conquistas!</p>
                </div>
              ) : (
                displayAchievements.map((achievement: any) => (
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
                        {achievement.completed ? (
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            ✓ Desbloqueado (+{achievement.points} XP)
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Recompensa: +{achievement.points} XP
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
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
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ranking em construção.</p>
                  <p className="text-sm">Os líderes aparecerão aqui em breve!</p>
                </div>
              ) : (
                leaderboard.map((entry: any) => (
                  <motion.div
                    key={entry.rank}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all
                      ${entry.isCurrentUser
                        ? 'bg-primary/10 border-2 border-primary/30 shadow-sm'
                        : 'hover:bg-accent'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0
                      ${entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }
                    `}>
                      {entry.rank}
                    </div>
                    <Avatar
                      src={entry.avatar}
                      alt={entry.name}
                      fallback={entry.name?.charAt(0) || '?'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-sm font-medium truncate
                        ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}
                      `}>
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-1 text-xs text-primary">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nível {entry.level}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {entry.points.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Summary */}
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
                Seu Progresso
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-muted/50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-foreground">{currentLevel}</p>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-muted/50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-foreground">{myAchievements?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-muted/50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-foreground">{currentXP.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">XP Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Gamification
