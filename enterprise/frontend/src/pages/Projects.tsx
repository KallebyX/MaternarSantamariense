import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Progress } from '../components/ui/Progress'
import { Spinner } from '../components/ui/Spinner'
import { CreateProjectModal } from '../components/modals/CreateProjectModal'
import { useProjects } from '../hooks/useProjects'

const Projects: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Use real projects hook
  const { projects, loading, createProject, refetch } = useProjects()

  // Map backend status to frontend format
  const mapStatus = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'planning'
      case 'ACTIVE': return 'in-progress'
      case 'COMPLETED': return 'completed'
      case 'ON_HOLD': return 'on-hold'
      case 'CANCELLED': return 'cancelled'
      default: return 'planning'
    }
  }

  // Map priority
  const mapPriority = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'high'
      case 'MEDIUM': return 'medium'
      case 'LOW': return 'low'
      default: return 'medium'
    }
  }

  // Calculate project progress from tasks
  const calculateProgress = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return 0
    const completed = tasks.filter((t: any) => t.status === 'DONE').length
    return Math.round((completed / tasks.length) * 100)
  }

  // Transform projects data
  const transformedProjects = useMemo(() => {
    return projects?.map((project: any) => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: mapStatus(project.status),
      priority: mapPriority(project.priority),
      progress: calculateProgress(project.tasks),
      startDate: project.startDate,
      endDate: project.dueDate,
      team: project.members?.map((m: any) => ({
        id: m.user?.id || m.id,
        name: m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Membro',
        avatar: m.user?.avatar,
        role: m.role || 'Member'
      })) || [],
      tasks: {
        total: project.tasks?.length || 0,
        completed: project.tasks?.filter((t: any) => t.status === 'DONE').length || 0,
        pending: project.tasks?.filter((t: any) => t.status !== 'DONE').length || 0
      }
    })) || []
  }, [projects])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'on-hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />
      case 'in-progress': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'on-hold': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planejamento'
      case 'in-progress': return 'Em Andamento'
      case 'completed': return 'Concluído'
      case 'on-hold': return 'Pausado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const filteredProjects = useMemo(() => {
    return transformedProjects.filter((project: any) => {
      const matchesTab = activeTab === 'all' || project.status === activeTab
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [transformedProjects, activeTab, searchTerm])

  const stats = useMemo(() => ({
    total: transformedProjects.length,
    inProgress: transformedProjects.filter((p: any) => p.status === 'in-progress').length,
    completed: transformedProjects.filter((p: any) => p.status === 'completed').length,
    onHold: transformedProjects.filter((p: any) => p.status === 'on-hold').length
  }), [transformedProjects])

  const handleCreateProject = async (projectData: any) => {
    await createProject({
      name: projectData.title || projectData.name,
      description: projectData.description,
      status: 'ACTIVE',
      priority: projectData.priority?.toUpperCase() || 'MEDIUM',
      startDate: projectData.startDate,
      dueDate: projectData.endDate || projectData.dueDate
    })
    setShowCreateModal(false)
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe todos os projetos da organização
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pausados</p>
                <p className="text-2xl font-bold text-foreground">{stats.onHold}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 md:mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'planning', label: 'Planejamento' },
                { id: 'in-progress', label: 'Em Andamento' },
                { id: 'completed', label: 'Concluídos' },
                { id: 'on-hold', label: 'Pausados' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum projeto encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Tente ajustar sua busca' : 'Crie seu primeiro projeto para começar'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Projeto
          </Button>
        </Card>
      )}

      {/* Projects Grid */}
      {viewMode === 'grid' && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any, index: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{getStatusLabel(project.status)}</span>
                    </Badge>
                    <Star className={`w-4 h-4 ${getPriorityColor(project.priority)}`} />
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {project.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || 'Sem descrição'}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString('pt-BR')
                        : 'Sem prazo'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    <span>{project.tasks.completed}/{project.tasks.total} tarefas</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member: any) => (
                      <Avatar
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        fallback={member.name?.charAt(0) || '?'}
                        size="sm"
                        className="border-2 border-background"
                      />
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-background">
                        +{project.team.length - 3}
                      </div>
                    )}
                    {project.team.length === 0 && (
                      <span className="text-sm text-muted-foreground">Sem membros</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { id: 'planning', title: 'Planejamento', color: 'bg-blue-100 dark:bg-blue-900/30' },
            { id: 'in-progress', title: 'Em Andamento', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { id: 'completed', title: 'Concluídos', color: 'bg-green-100 dark:bg-green-900/30' },
            { id: 'on-hold', title: 'Pausados', color: 'bg-gray-100 dark:bg-gray-800' }
          ].map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={`p-4 rounded-lg ${column.color}`}>
                <h3 className="font-semibold text-foreground mb-2">{column.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredProjects.filter((p: any) => p.status === column.id).length} projetos
                </p>
              </div>

              <div className="space-y-3">
                {filteredProjects
                  .filter((project: any) => project.status === column.id)
                  .map((project: any) => (
                    <Card key={project.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-foreground mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 2).map((member: any) => (
                            <Avatar
                              key={member.id}
                              src={member.avatar}
                              alt={member.name}
                              fallback={member.name?.charAt(0) || '?'}
                              size="xs"
                              className="border-2 border-background"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateProject}
      />
    </div>
  )
}

export default Projects
