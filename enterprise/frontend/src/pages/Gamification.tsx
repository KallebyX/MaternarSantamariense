import React from "react";
import { motion } from "framer-motion";
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
  Sparkles,
} from "lucide-react";

import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Progress } from "../components/ui/Progress";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";

const Gamification: React.FC = () => {
  const userStats = {
    level: 15,
    xp: 8750,
    nextLevelXp: 10000,
    totalPoints: 45230,
    streak: 12,
    badges: 24,
    rank: 3,
    completedChallenges: 89,
  };

  const achievements = [
    {
      id: 1,
      title: "Primeiros Passos",
      description: "Complete seu primeiro atendimento de pré-natal",
      icon: <CheckCircle className="w-6 h-6" />,
      points: 100,
      completed: true,
      rarity: "comum",
    },
    {
      id: 2,
      title: "Campeão de Constância",
      description: "Registre atividades por 30 dias consecutivos",
      icon: <Calendar className="w-6 h-6" />,
      points: 500,
      completed: true,
      rarity: "raro",
    },
    {
      id: 3,
      title: "Explorador de Conhecimentos",
      description: "Complete 10 cursos de qualificação",
      icon: <Trophy className="w-6 h-6" />,
      points: 1000,
      completed: false,
      progress: 7,
      total: 10,
      rarity: "épico",
    },
    {
      id: 4,
      title: "Trabalho em Equipe",
      description: "Colabore em 5 projetos",
      icon: <Users className="w-6 h-6" />,
      points: 750,
      completed: false,
      progress: 3,
      total: 5,
      rarity: "raro",
    },
    {
      id: 5,
      title: "Profissional Legendário",
      description: "Complete 100 atendimentos de pré-natal",
      icon: <Crown className="w-6 h-6" />,
      points: 5000,
      completed: false,
      progress: 45,
      total: 100,
      rarity: "lendário",
    },
    {
      id: 6,
      title: "Velocista",
      description: "Complete um curso em menos de 1 hora",
      icon: <Zap className="w-6 h-6" />,
      points: 300,
      completed: true,
      rarity: "raro",
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      name: "Dr. Maria Silva",
      points: 52340,
      avatar: "/avatars/maria.jpg",
      level: 18,
    },
    {
      rank: 2,
      name: "João Santos",
      points: 48920,
      avatar: "/avatars/joao.jpg",
      level: 17,
    },
    {
      rank: 3,
      name: "Ana Costa",
      points: 45230,
      avatar: "/avatars/ana.jpg",
      level: 15,
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: "Pedro Lima",
      points: 43180,
      avatar: "/avatars/pedro.jpg",
      level: 15,
    },
    {
      rank: 5,
      name: "Sofia Oliveira",
      points: 41560,
      avatar: "/avatars/sofia.jpg",
      level: 14,
    },
    {
      rank: 6,
      name: "Carlos Mendes",
      points: 40120,
      avatar: "/avatars/carlos.jpg",
      level: 14,
    },
    {
      rank: 7,
      name: "Juliana Rocha",
      points: 38900,
      avatar: "/avatars/juliana.jpg",
      level: 13,
    },
  ];

  const challenges = [
    {
      id: 1,
      title: "Quarta do Bem-Estar",
      description: "Complete 3 atividades de saúde nesta quarta",
      reward: "200 XP + Wellness Badge",
      deadline: "2025-10-09",
      progress: 2,
      total: 3,
      difficulty: "fácil",
    },
    {
      id: 2,
      title: "Mestre da Qualificação",
      description: "Termine 2 módulos de qualificação esta semana",
      reward: "500 XP + Knowledge Badge",
      deadline: "2025-10-13",
      progress: 0,
      total: 2,
      difficulty: "médio",
    },
    {
      id: 3,
      title: "Colaboração em Equipe",
      description: "Trabalhe com 3 colegas diferentes em projetos",
      reward: "1000 XP + Teamwork Badge",
      deadline: "2025-10-15",
      progress: 1,
      total: 3,
      difficulty: "difícil",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "comum":
        return "secondary";
      case "raro":
        return "info";
      case "épico":
        return "warning";
      case "lendário":
        return "success";
      default:
        return "default";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "fácil":
        return "success";
      case "médio":
        return "warning";
      case "difícil":
        return "danger";
      default:
        return "default";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary shrink-0" />
              <span className="truncate">Gamificação</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Acompanhe seu progresso e conquiste recompensas
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-gradient-to-r from-primary to-secondary rounded-lg sm:rounded-xl shadow-lg w-full lg:w-auto max-w-xs lg:max-w-none mx-auto lg:mx-0"
          >
            <div className="text-right min-w-0 flex-1 lg:flex-none">
              <p className="text-xs sm:text-sm text-primary-foreground/80">
                Nível {userStats.level}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground truncate">
                {userStats.totalPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
      >
        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 sm:p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80 shrink-0" />
                <Badge
                  variant="outline"
                  className="border-white/30 text-white text-[10px] sm:text-xs"
                >
                  Nível {userStats.level}
                </Badge>
              </div>
              <p className="text-white/80 text-xs sm:text-sm mb-1">
                Experiência
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 truncate">
                {userStats.xp} XP
              </p>
              <Progress
                value={(userStats.xp / userStats.nextLevelXp) * 100}
                className="bg-blue-400/30 h-1.5 sm:h-2"
                variant="default"
              />
              <p className="text-[10px] sm:text-xs text-white/60 mt-1 sm:mt-2">
                {userStats.nextLevelXp - userStats.xp} XP para próximo nível
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 p-3 sm:p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80 shrink-0" />
                <Badge
                  variant="outline"
                  className="border-white/30 text-white text-[10px] sm:text-xs"
                >
                  {userStats.streak > 7 ? "Em Chamas!" : "Ativo"}
                </Badge>
              </div>
              <p className="text-white/80 text-xs sm:text-sm mb-1">Sequência</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {userStats.streak} dias
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2">
                Continue assim!
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-3 sm:p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Medal className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80 shrink-0" />
                <Badge
                  variant="outline"
                  className="border-white/30 text-white text-[10px] sm:text-xs"
                >
                  Top {userStats.rank}
                </Badge>
              </div>
              <p className="text-white/80 text-xs sm:text-sm mb-1">Ranking</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                #{userStats.rank}
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2">
                no ranking municipal
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-3 sm:p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80 shrink-0" />
                <Badge
                  variant="outline"
                  className="border-white/30 text-white text-[10px] sm:text-xs"
                >
                  {userStats.badges}
                </Badge>
              </div>
              <p className="text-white/80 text-xs sm:text-sm mb-1">
                Conquistas
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {userStats.badges}
              </p>
              <p className="text-xs sm:text-sm text-white/70 mt-1 sm:mt-2 truncate">
                Emblemas desbloqueados
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 min-w-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
                  <span className="truncate">Conquistas</span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm shrink-0"
                >
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 md:p-6 pt-0">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.01, x: 2 }}
                  className={`
                    p-3 sm:p-4 rounded-lg border-2 transition-all duration-200
                    ${
                      achievement.completed
                        ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`
                      p-1.5 sm:p-2 rounded-lg shrink-0
                      ${
                        achievement.completed
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {achievement.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={getRarityColor(achievement.rarity) as any}
                            size="sm"
                            className="text-[10px] sm:text-xs"
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {achievement.description}
                      </p>
                      {!achievement.completed && achievement.progress && (
                        <div className="space-y-1">
                          <Progress
                            value={
                              (achievement.progress / achievement.total) * 100
                            }
                            variant="success"
                            size="sm"
                            className="h-1.5 sm:h-2"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.total}{" "}
                              concluído
                            </p>
                            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">
                              +{achievement.points} pts
                            </p>
                          </div>
                        </div>
                      )}
                      {achievement.completed && (
                        <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
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

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 min-w-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-500 shrink-0" />
                <span className="truncate">Informações do Sistema</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
                  📊 Estatísticas Completas
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  Acesse a aba "Analytics" para visualizar o ranking completo de
                  todos os profissionais e estatísticas detalhadas do sistema.
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2 text-sm sm:text-base">
                  🎯 Dica do Dia
                </h3>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                  Complete desafios diários para ganhar XP extra e subir no
                  ranking municipal!
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-sm sm:text-base">
                  🏆 Próximas Recompensas
                </h3>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                  Faltam apenas {userStats.nextLevelXp - userStats.xp} XP para
                  você alcançar o nível {userStats.level + 1}!
                </p>
              </div>
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
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 min-w-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500 shrink-0" />
                <span className="truncate">Desafios Ativos</span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Explorar Mais
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {challenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="group"
                >
                  <Card
                    variant="bordered"
                    className="h-full hover:border-primary/50 transition-all duration-200"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <Badge
                          variant={
                            getDifficultyColor(challenge.difficulty) as any
                          }
                          className="text-[10px] sm:text-xs"
                        >
                          {challenge.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground shrink-0">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span className="hidden xs:inline">
                            {new Date(challenge.deadline).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </span>
                          <span className="xs:hidden">
                            {new Date(challenge.deadline).getDate()}/
                            {new Date(challenge.deadline).getMonth() + 1}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-2">
                        {challenge.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3">
                        {challenge.description}
                      </p>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <Progress
                            value={(challenge.progress / challenge.total) * 100}
                            variant={
                              challenge.progress === challenge.total
                                ? "success"
                                : "default"
                            }
                            className="h-1.5 sm:h-2"
                          />
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {challenge.progress}/{challenge.total} concluído
                          </p>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 pt-2 sm:pt-3 border-t border-border">
                          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 min-w-0">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="text-[10px] sm:text-xs truncate">
                              {challenge.reward.split("+")[0].trim()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            disabled={challenge.progress === challenge.total}
                            variant={
                              challenge.progress === challenge.total
                                ? "outline"
                                : "default"
                            }
                            className="text-[10px] sm:text-xs w-full xs:w-auto"
                          >
                            {challenge.progress === challenge.total ? (
                              <>
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden sm:inline">
                                  Concluído
                                </span>
                                <span className="sm:hidden">OK</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  Participar
                                </span>
                                <span className="sm:hidden">Ir</span>
                              </>
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
  );
};

export default Gamification;
