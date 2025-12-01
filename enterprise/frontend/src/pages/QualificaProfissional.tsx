import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Heart,
  Baby,
  Stethoscope,
  BookOpen,
  FileText,
  Smartphone,
  PlayCircle,
  Award,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Lock,
  Star,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react'

interface Module {
  id: number
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  lessons: number
  duration: string
  level: 'Introdutório' | 'Intermediário' | 'Avançado'
  progress?: number
  locked?: boolean
}

interface Trail {
  id: number
  name: string
  description: string
  modules: number[]
  totalHours: number
  color: string
}

const QualificaProfissional: React.FC = () => {
  const [selectedTrail, setSelectedTrail] = useState<number | null>(null)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)

  const modules: Module[] = [
    {
      id: 1,
      title: 'Pré-natal e Saúde da Gestante',
      description: 'Fundamentos do cuidado pré-natal, protocolos de atendimento e acompanhamento integral da gestante.',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      lessons: 12,
      duration: '15h',
      level: 'Intermediário',
      progress: 65
    },
    {
      id: 2,
      title: 'Puerpério, Saúde Mental e Rede de Apoio',
      description: 'Cuidado integral no pós-parto, identificação de transtornos e construção de redes de suporte.',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      lessons: 10,
      duration: '12h',
      level: 'Intermediário',
      progress: 30
    },
    {
      id: 3,
      title: 'Aleitamento Materno e Alimentação',
      description: 'Manejo da amamentação, técnicas de apoio e introdução alimentar saudável.',
      icon: Baby,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      lessons: 8,
      duration: '10h',
      level: 'Introdutório',
      progress: 100
    },
    {
      id: 4,
      title: 'Atenção ao Bebê: Primeiros Cuidados',
      description: 'Cuidados essenciais, urgências pediátricas e desenvolvimento infantil.',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      lessons: 15,
      duration: '18h',
      level: 'Avançado',
      locked: true
    },
    {
      id: 5,
      title: 'Saúde Bucal e Exames na Gestação',
      description: 'Cuidados odontológicos, exames essenciais e interpretação de resultados.',
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      lessons: 6,
      duration: '8h',
      level: 'Introdutório'
    },
    {
      id: 6,
      title: 'Protocolos e Cadernos Técnicos',
      description: 'Documentos oficiais, diretrizes e protocolos de atendimento atualizados.',
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      lessons: 20,
      duration: '25h',
      level: 'Avançado'
    },
    {
      id: 7,
      title: 'Aplicativos e Plataformas Digitais',
      description: 'Ferramentas tecnológicas para apoio ao cuidado materno-infantil.',
      icon: Smartphone,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      lessons: 5,
      duration: '6h',
      level: 'Introdutório'
    },
    {
      id: 8,
      title: 'Materiais Audiovisuais Educativos',
      description: 'Vídeos, podcasts e recursos multimídia para educação em saúde.',
      icon: PlayCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      lessons: 12,
      duration: '8h',
      level: 'Introdutório'
    },
    {
      id: 9,
      title: 'Publicações Científicas',
      description: 'Artigos, pesquisas e evidências atualizadas em saúde materno-infantil.',
      icon: Award,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      lessons: 10,
      duration: '15h',
      level: 'Avançado'
    }
  ]

  const trails: Trail[] = [
    {
      id: 1,
      name: 'Trilha Gestação',
      description: 'Fundamentos do cuidado pré-natal',
      modules: [1, 5],
      totalHours: 40,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 2,
      name: 'Trilha Nascimento',
      description: 'Assistência ao parto e primeiros cuidados',
      modules: [4, 3],
      totalHours: 30,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 3,
      name: 'Trilha Puerpério',
      description: 'Cuidado integral no pós-parto',
      modules: [2, 3],
      totalHours: 35,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const getLevelBadge = (level: string) => {
    const colors = {
      'Introdutório': 'bg-green-100 text-green-800',
      'Intermediário': 'bg-yellow-100 text-yellow-800',
      'Avançado': 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Qualifica Profissional</h1>
            <p className="text-gray-600">Capacitação continuada em saúde materno-infantil</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <p className="text-lg text-gray-700 italic">
            "Transforme conhecimento em cuidado humanizado. Cada módulo concluído é um passo a mais na construção de um futuro mais saudável para mães e bebês."
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Módulos Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">9</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horas de Conteúdo</p>
                <p className="text-2xl font-bold text-gray-900">120h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profissionais Ativos</p>
                <p className="text-2xl font-bold text-gray-900">2.450</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
          </motion.div>
        </div>

        {/* Trilhas Formativas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trilhas Formativas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trails.map((trail) => (
              <motion.div
                key={trail.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTrail(trail.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedTrail === trail.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'shadow-sm hover:shadow-md'
                } bg-gradient-to-r ${trail.color}`}
              >
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1">{trail.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{trail.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{trail.totalHours}h de conteúdo</span>
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {modules.map((module) => {
          const Icon = module.icon
          const isHighlighted = selectedTrail && trails.find(t => t.id === selectedTrail)?.modules.includes(module.id)
          
          return (
            <motion.div
              key={module.id}
              variants={item}
              whileHover={{ y: -5 }}
              onClick={() => !module.locked && setExpandedModule(expandedModule === module.id ? null : module.id)}
              className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer ${
                module.locked ? 'opacity-60' : ''
              } ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${module.bgColor}`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(module.level)}`}>
                    {module.level}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {module.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {module.lessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {module.duration}
                  </span>
                </div>

                {/* Progress or Lock */}
                {module.locked ? (
                  <div className="flex items-center justify-center py-3 bg-gray-100 rounded-lg">
                    <Lock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">Módulo bloqueado</span>
                  </div>
                ) : module.progress !== undefined ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Progresso</span>
                      <span className="text-xs font-semibold text-gray-900">{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        className={`h-2 rounded-full ${
                          module.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors">
                    Começar Módulo
                  </button>
                )}
              </div>

              {/* Expanded Content */}
              {expandedModule === module.id && !module.locked && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 p-6 bg-gray-50"
                >
                  <h4 className="font-medium text-gray-900 mb-3">Conteúdo do Módulo:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Materiais didáticos atualizados
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Vídeos e demonstrações práticas
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Avaliações e exercícios
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Certificado de conclusão
                    </li>
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Gamification Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Sistema de Conquistas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="inline-flex p-3 bg-amber-100 rounded-full mb-3">
              <Star className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Bronze</h3>
            <p className="text-sm text-gray-600">3 módulos concluídos</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center opacity-60">
            <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Prata</h3>
            <p className="text-sm text-gray-600">1 trilha completa</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center opacity-60">
            <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Ouro</h3>
            <p className="text-sm text-gray-600">2 trilhas completas</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center opacity-60">
            <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">Diamante</h3>
            <p className="text-sm text-gray-600">Especialista certificado</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default QualificaProfissional