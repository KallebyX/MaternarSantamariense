import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Save,
  Shield,
  Award,
  Clock,
  Star,
  TrendingUp,
  Users,
  BookOpen,
  Briefcase,
  X,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Upload
} from 'lucide-react'

import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar, AvatarGroup } from '../components/ui/Avatar'
import { Progress } from '../components/ui/Progress'
import { Input } from '../components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { Textarea } from '../components/ui/Textarea'

interface EditableFieldProps {
  label: string
  value: string
  isEditing: boolean
  icon?: React.ReactNode
  onSave?: (value: string) => void
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, isEditing, icon, onSave }) => {
  const [editValue, setEditValue] = useState(value)
  const [isLocalEdit, setIsLocalEdit] = useState(false)

  const handleSave = () => {
    onSave?.(editValue)
    setIsLocalEdit(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsLocalEdit(false)
  }

  if (!isEditing && !isLocalEdit) {
    return (
      <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
          </div>
        </div>
        {isEditing && (
          <Button
            size="xs"
            variant="ghost"
            icon={<Edit className="w-3 h-3" />}
            onClick={() => setIsLocalEdit(true)}
            className="opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
    )
  }

  return (
    <div className="p-3 rounded-lg bg-accent/30 border border-border">
      <Input
        label={label}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        icon={icon}
        fullWidth
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="primary" icon={<Check className="w-3 h-3" />} onClick={handleSave}>
          Salvar
        </Button>
        <Button size="sm" variant="ghost" icon={<X className="w-3 h-3" />} onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const user = {
    id: '1',
    name: 'Laura Pellegrin',
    email: 'laura@maternarsantamariense.com',
    phone: '+55 (55) 99765-4321',
    role: 'Acadêmica de Enfermagem | Bolsista PROBIC',
    department: 'Enfermagem - UFN',
    location: 'Santa Maria, RS',
    joinDate: '2025-12-01',
    avatar: '/avatars/laura.jpg',
    bio: 'Acadêmica do curso de Enfermagem da Universidade Franciscana (UFN), Santa Maria - RS. Bolsista PROBIC/UFN com projeto "Atenção Pré-Natal: Tecnologias indutoras de boas práticas obstétricas". Integrante do GESTAR e GEPESES/UFN. Vice-presidente do DAENF/UFN. Representante discente no colegiado do Curso de Enfermagem. Membro do COEST/RS - ABEn/RS. Interesse em pesquisa em Saúde Materno Infantil.',
    skills: ['Pesquisa Científica', 'Saúde Materno-Infantil', 'Atenção Pré-Natal', 'Obstetrícia', 'Liderança Estudantil', 'Empreendedorismo Social'],
    certifications: [
      { name: 'Bolsista PROBIC/UFN', date: '2025-03', institution: 'Universidade Franciscana', status: 'valid' },
      { name: 'Integrante GESTAR', date: '2024-08', institution: 'UFN', status: 'valid' },
      { name: 'Vice-Presidente DAENF', date: '2025-02', institution: 'UFN', status: 'valid' },
      { name: 'Membro COEST/RS', date: '2024-11', institution: 'ABEn/RS', status: 'valid' }
    ]
  }

  const stats = {
    projects: 3,
    completedTraining: 8,
    teamSize: 12,
    experience: 2,
    achievements: 6,
    gamificationPoints: 5250,
    level: 10,
    streak: 12,
    nextLevelPoints: 6000
  }

  const recentActivity = [
    {
      id: 1,
      type: 'training',
      title: 'Concluiu o curso "Cuidados Neonatais Essenciais"',
      date: '2025-12-01',
      points: 100
    },
    {
      id: 2,
      type: 'project',
      title: 'Apresentou projeto "Tecnologias indutoras de boas práticas obstétricas"',
      date: '2025-11-28',
      points: 300
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Conquistou badge "Pesquisadora Iniciante"',
      date: '2025-11-15',
      points: 200
    },
    {
      id: 4,
      type: 'collaboration',
      title: 'Participou da reunião do GESTAR',
      date: '2025-11-10',
      points: 50
    }
  ]

  const teamMembers = [
    { name: 'Maria Oliveira', status: 'online' as const },
    { name: 'Carolina Santos', status: 'online' as const },
    { name: 'Ana Rodrigues', status: 'away' as const },
    { name: 'Prof. Dr. Claudia', status: 'online' as const },
    { name: 'Prof. Dr. Fernanda', status: 'offline' as const },
  ]

  const getActivityIcon = (type: string) => {
    const icons = {
      training: { icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
      project: { icon: Briefcase, color: 'text-green-600 dark:text-green-400' },
      achievement: { icon: Award, color: 'text-amber-600 dark:text-amber-400' },
      collaboration: { icon: Users, color: 'text-purple-600 dark:text-purple-400' }
    }
    const { icon: Icon, color } = icons[type as keyof typeof icons] || { icon: Clock, color: 'text-muted-foreground' }
    return <Icon className={`w-4 h-4 ${color}`} />
  }

  const getActivityBadge = (type: string) => {
    const variants = {
      training: 'info' as const,
      project: 'success' as const,
      achievement: 'warning' as const,
      collaboration: 'default' as const
    }
    return variants[type as keyof typeof variants] || 'default' as const
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações pessoais e profissionais
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditing ? 'success' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
            icon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          >
            {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Profile Info */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-1 space-y-6"
        >
          {/* Avatar Card */}
          <motion.div variants={item}>
            <Card variant="elevated">
              <CardContent className="p-6">
                {/* Cover Image */}
                <div className="relative -m-6 mb-6 h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                  {isEditing && (
                    <button 
                      className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-background transition-colors"
                      aria-label="Alterar foto de capa"
                      title="Alterar foto de capa"
                    >
                      <Camera className="w-4 h-4 text-foreground" />
                    </button>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center -mt-16 mb-4">
                  <div className="relative">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="2xl"
                      status="online"
                      ring
                      ringColor="ring-background ring-4"
                    />
                    {isEditing && (
                      <button 
                        className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-lg"
                        aria-label="Alterar foto de perfil"
                        title="Alterar foto de perfil"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mt-4 text-center">
                    {user.name}
                  </h2>
                  <p className="text-muted-foreground text-center">{user.role}</p>

                  <div className="flex gap-2 mt-3">
                    <Badge variant="info">{user.department}</Badge>
                    <Badge variant="success" dot>Ativo</Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stats.level}</p>
                    <p className="text-xs text-muted-foreground">Nível</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
                    <p className="text-xs text-muted-foreground">Dias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stats.achievements}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground">Informações de Contato</h3>
              </CardHeader>
              <CardContent className="space-y-1">
                <EditableField
                  label="E-mail"
                  value={user.email}
                  isEditing={isEditing}
                  icon={<Mail className="w-4 h-4" />}
                />
                <EditableField
                  label="Telefone"
                  value={user.phone}
                  isEditing={isEditing}
                  icon={<Phone className="w-4 h-4" />}
                />
                <EditableField
                  label="Localização"
                  value={user.location}
                  isEditing={isEditing}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <div className="flex items-center gap-3 p-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Membro desde</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(user.joinDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Minha Equipe</h3>
                  <Badge variant="default">{teamMembers.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AvatarGroup max={4} size="md">
                    {teamMembers.map((member, index) => (
                      <Avatar
                        key={index}
                        name={member.name}
                        status={member.status}
                        size="md"
                      />
                    ))}
                  </AvatarGroup>
                  <Button variant="outline" fullWidth icon={<Users className="w-4 h-4" />}>
                    Ver Toda Equipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Competências</h3>
                  {isEditing && (
                    <Button size="xs" variant="ghost" icon={<Plus className="w-3 h-3" />} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="default" className="group">
                      {skill}
                      {isEditing && (
                        <button 
                          className="ml-1 opacity-0 group-hover:opacity-100"
                          aria-label={`Remover competência: ${skill}`}
                          title="Remover"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Briefcase, label: 'Projetos', value: stats.projects, color: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
              { icon: BookOpen, label: 'Treinamentos', value: stats.completedTraining, color: 'from-green-500 to-green-600', iconBg: 'bg-green-500/10', iconColor: 'text-green-600 dark:text-green-400' },
              { icon: Award, label: 'Conquistas', value: stats.achievements, color: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
              { icon: Users, label: 'Equipe', value: stats.teamSize, color: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div key={index} variants={item}>
                  <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="activity">Atividades</TabsTrigger>
                    <TabsTrigger value="certifications">Certificações</TabsTrigger>
                    <TabsTrigger value="gamification">Gamificação</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Sobre Mim
                        </h3>
                        {isEditing ? (
                          <Textarea
                            value={user.bio}
                            rows={4}
                            className="resize-none"
                          />
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Informações Profissionais
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Cargo</label>
                              {isEditing ? (
                                <Input value={user.role} fullWidth size="sm" />
                              ) : (
                                <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-md">{user.role}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Departamento</label>
                              {isEditing ? (
                                <Input value={user.department} fullWidth size="sm" />
                              ) : (
                                <p className="text-sm font-medium text-foreground p-2 bg-muted/50 rounded-md">{user.department}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Performance
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Taxa de Conclusão</span>
                                <span className="font-semibold text-foreground">94%</span>
                              </div>
                              <Progress value={94} variant="success" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Engajamento</span>
                                <span className="font-semibold text-foreground">87%</span>
                              </div>
                              <Progress value={87} variant="default" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Avaliação Média</span>
                                <span className="font-semibold text-foreground">4.8/5.0</span>
                              </div>
                              <Progress value={96} variant="warning" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
                        <Button size="sm" variant="outline" icon={<Download className="w-4 h-4" />}>
                          Exportar
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence>
                          {recentActivity.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card variant="bordered" hover className="group">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                                      {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground">
                                        {activity.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(activity.date).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={getActivityBadge(activity.type)}>
                                        +{activity.points} pts
                                      </Badge>
                                      <Button size="xs" variant="ghost" icon={<ExternalLink className="w-3 h-3" />} />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Certifications Tab */}
                  <TabsContent value="certifications">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Certificações</h3>
                        {isEditing && (
                          <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Adicionar Certificação
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        {user.certifications.map((cert, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card variant="bordered" hover>
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                                      <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground">{cert.name}</h4>
                                      <p className="text-sm text-muted-foreground mt-0.5">{cert.institution}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(cert.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <Badge variant="success">Válido</Badge>
                                    <Button size="xs" variant="ghost" icon={<Download className="w-3 h-3" />}>
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Gamification Tab */}
                  <TabsContent value="gamification">
                    <div className="space-y-6">
                      {/* Level Card */}
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-8 text-white">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                              <span className="text-4xl font-bold">Lv {stats.level}</span>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold mb-1">Nível {stats.level}</h3>
                              <p className="text-3xl font-bold">{stats.gamificationPoints.toLocaleString()} pts</p>
                              <p className="text-white/80 text-sm mt-1">
                                {(stats.nextLevelPoints - stats.gamificationPoints).toLocaleString()} pts para o próximo nível
                              </p>
                            </div>
                          </div>
                          <div className="text-center md:text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                              <Shield className="w-5 h-5" />
                              <span className="font-semibold">#3 no Ranking</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 relative">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progresso</span>
                            <span>{Math.round((stats.gamificationPoints / stats.nextLevelPoints) * 100)}%</span>
                          </div>
                          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(stats.gamificationPoints / stats.nextLevelPoints) * 100}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-white rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { icon: Star, label: 'Conquistas', value: stats.achievements, color: 'from-amber-400 to-amber-500' },
                          { icon: TrendingUp, label: 'Sequência', value: `${stats.streak} dias`, color: 'from-green-400 to-green-500' },
                          { icon: Shield, label: 'Ranking', value: '#3', color: 'from-blue-400 to-blue-500' }
                        ].map((stat, index) => {
                          const Icon = stat.icon
                          return (
                            <Card key={index} variant="elevated" className="text-center">
                              <CardContent className="p-6">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                                  <Icon className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile
