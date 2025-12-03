import React, { useState } from 'react'
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
import { CreateProjectModal } from '../components/modals/CreateProjectModal'

const Projects: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const projects = [
    {
      id: 1,
      title: 'Qualidade da Atenção Pré-Natal na Atenção Primária à Saúde',
      description: 'Indicadores, desafios e perspectivas',
      status: 'in-progress',
      priority: 'high',
      progress: 45,
      startDate: '2025-03-01',
      endDate: '2026-03-01',
      team: [
        { id: 1, name: 'Ana Torres', avatar: '/avatars/ana.jpg', role: 'Pesquisadora Principal' },
        { id: 2, name: 'Silvia Santos', avatar: '/avatars/silvia.jpg', role: 'Co-orientadora' },
        { id: 3, name: 'Marcia Amaral', avatar: '/avatars/marcia.jpg', role: 'Pesquisadora' }
      ],
      tasks: {
        total: 12,
        completed: 5,
        pending: 7
      },
      category: 'pesquisa',
      budget: 50000,
      spent: 22500
    },
    {
      id: 2,
      title: 'Fatores associados à adesão ao pré-natal entre gestantes de risco habitual',
      description: 'Estudo transversal com análise de fatores socioeconômicos e culturais',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      team: [
        { id: 4, name: 'Alice Costa', avatar: '/avatars/alice.jpg', role: 'Pesquisadora Principal' },
        { id: 5, name: 'Leandro Mayer', avatar: '/avatars/leandro.jpg', role: 'Estatístico' },
        { id: 6, name: 'Lívia Maria', avatar: '/avatars/livia.jpg', role: 'Pesquisadora' }
      ],
      tasks: {
        total: 20,
        completed: 20,
        pending: 0
      },
      category: 'pesquisa',
      budget: 80000,
      spent: 78000
    },
    {
      id: 3,
      title: 'Avaliação da integralidade do cuidado no pré-natal',
      description: 'Uma análise a partir das práticas de enfermagem',
      status: 'planning',
      priority: 'medium',
      progress: 10,
      startDate: '2025-11-01',
      endDate: '2026-11-01',
      team: [
        { id: 7, name: 'Marina Soares', avatar: '/avatars/marina.jpg', role: 'Pesquisadora Principal' },
        { id: 8, name: 'Lucas Andrade Fontalvo', avatar: '/avatars/lucas.jpg', role: 'Co-orientador' },
        { id: 9, name: 'Ana Beatriz Menezes', avatar: '/avatars/ana-beatriz.jpg', role: 'Pesquisadora' }
      ],
      tasks: {
        total: 15,
        completed: 2,
        pending: 13
      },
      category: 'pesquisa',
      budget: 60000,
      spent: 6000
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on-hold': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-maternar-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesTab = activeTab === 'all' || project.status === activeTab
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Projetos</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
            Gerencie e acompanhe todos os projetos da organização
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filtrar</span>
          </Button>
          <Button 
            className="bg-maternar-blue-600 w-full sm:w-auto text-xs sm:text-sm" 
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Novo Projeto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">Total</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-maternar-blue-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">Em Andamento</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">Concluídos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-maternar-green-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">Pausados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.onHold}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'planning', label: 'Planejamento', shortLabel: 'Planejar' },
                { id: 'in-progress', label: 'Em Andamento', shortLabel: 'Andamento' },
                { id: 'completed', label: 'Concluídos' },
                { id: 'on-hold', label: 'Pausados' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-maternar-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Kanban
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                    <Badge className={`${getStatusColor(project.status)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1 capitalize truncate">{project.status.replace('-', ' ')}</span>
                    </Badge>
                    <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${getPriorityColor(project.priority)} flex-shrink-0`} />
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 sm:p-2 flex-shrink-0">
                    <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-0">
                  {project.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-1">
                  {project.description}
                </p>
                
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5 sm:h-2" />
                </div>
                
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 space-y-2 xs:space-y-0 gap-2">
                  <div className="flex items-center min-w-0">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{new Date(project.endDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{project.tasks.completed}/{project.tasks.total} tarefas</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex -space-x-1 sm:-space-x-2">
                    {project.team.slice(0, 3).map((member) => (
                      <Avatar
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        fallback={member.name}
                        size="sm"
                        className="border-2 border-white w-6 h-6 sm:w-8 sm:h-8"
                      />
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-600 border-2 border-white">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">Orçamento</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      R$ {(project.spent / 1000).toFixed(0)}k / {(project.budget / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                  <div className="flex space-x-2 xs:space-x-1">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                      <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto">
          <div className="flex space-x-3 sm:space-x-4 md:space-x-6 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:space-x-0 sm:gap-3 md:gap-4 lg:gap-6">
            {[
              { id: 'planning', title: 'Planejamento', shortTitle: 'Planejar', color: 'bg-blue-100' },
              { id: 'in-progress', title: 'Em Andamento', shortTitle: 'Andamento', color: 'bg-yellow-100' },
              { id: 'completed', title: 'Concluídos', color: 'bg-green-100' },
              { id: 'on-hold', title: 'Pausados', color: 'bg-gray-100' }
            ].map((column) => (
              <div key={column.id} className="w-64 sm:w-auto space-y-3 sm:space-y-4 flex-shrink-0">
                <div className={`p-3 sm:p-4 rounded-lg ${column.color}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">{column.title}</span>
                    <span className="sm:hidden">{column.shortTitle || column.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {filteredProjects.filter(p => p.status === column.id).length} projetos
                  </p>
                </div>
                
                <div className="space-y-2 sm:space-y-3 max-h-96 sm:max-h-[500px] overflow-y-auto">
                  {filteredProjects
                    .filter(project => project.status === column.id)
                    .map((project) => (
                      <Card key={project.id} className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                          {project.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-1 sm:-space-x-2">
                            {project.team.slice(0, 2).map((member) => (
                              <Avatar
                                key={member.id}
                                src={member.avatar}
                                alt={member.name}
                                fallback={member.name}
                                size="xs"
                                className="border-2 border-white w-5 h-5 sm:w-6 sm:h-6"
                              />
                            ))}
                            {project.team.length > 2 && (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-600 border-2 border-white">
                                +{project.team.length - 2}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                            {project.progress}%
                          </span>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(newProject) => {
          // TODO: Add new project to list via GraphQL mutation
        }}
      />
    </div>
  )
}

export default Projects