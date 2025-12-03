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
  Sparkles,
  ExternalLink,
  FileIcon,
  Video,
  Link2
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  type: 'PDF' | 'Video' | 'Website' | 'App' | 'Platform'
  url: string
  institution: string
  description?: string
}

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
  resources?: Resource[]
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
      progress: 65,
      resources: [
        {
          id: '1.1',
          title: 'Guia do Pré-Natal RS 2024',
          type: 'PDF',
          url: 'https://atencaoprimaria.rs.gov.br/upload/arquivos/202404/25124004-guia-do-pre-natal-2024.pdf',
          institution: 'Secretaria Estadual de Saúde do RS'
        },
        {
          id: '1.2',
          title: 'Guia do Pré-Natal para Profissionais',
          type: 'PDF',
          url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_pre_natal_profissionais_saude_1ed.pdf',
          institution: 'Ministério da Saúde'
        },
        {
          id: '1.3',
          title: 'Guia do Papel do Fisioterapeuta',
          type: 'PDF',
          url: 'https://educapes.capes.gov.br/bitstream/capes/921944/2/Guia%20do%20papel%20do%20fisio_20240530_103351_0000_240617_202421.pdf',
          institution: 'CAPES'
        },
        {
          id: '1.4',
          title: 'Cuidado Materno UNEB',
          type: 'Website',
          url: 'https://cuidadomaternouneb.com',
          institution: 'UNEB',
          description: 'Portal de recursos educacionais'
        },
        {
          id: '1.5',
          title: 'Fluxograma Pré-natal',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c5/0000c5fe.pdf',
          institution: 'Universidade Franciscana'
        },
        {
          id: '1.6',
          title: 'Material Complementar UFN',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c4/0000c48b.pdf',
          institution: 'Universidade Franciscana'
        }
      ]
    },
    {
      id: 2,
      title: 'Puerpério, Saúde Mental e Rede de Apoio',
      description: 'Cuidado integral no pós-parto, identificação de mudanças emocionais e construção de redes de suporte.',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      lessons: 10,
      duration: '12h',
      level: 'Intermediário',
      progress: 30,
      resources: [
        {
          id: '2.1',
          title: 'Tecnologias em Saúde - Puerpério',
          type: 'PDF',
          url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a53420f0-c96d-46e6-b42c-b62983720685.pdf',
          institution: 'Universidade Franciscana'
        },
        {
          id: '2.2',
          title: 'Plataforma APOIARE',
          type: 'Platform',
          url: 'https://www.apoiare.lapinf.ufn.edu.br/',
          institution: 'UFN/LAPINF',
          description: 'Plataforma de apoio emocional e informacional'
        },
        {
          id: '2.3',
          title: 'Portfolio de Cuidados no Puerpério',
          type: 'PDF',
          url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a42d5374-983f-4131-b7f0-6d209cbcac6f.pdf',
          institution: 'Universidade Franciscana'
        }
      ]
    },
    {
      id: 3,
      title: 'Aleitamento Materno e Alimentação',
      description: 'Manejo da amamentação, técnicas e introdução alimentar saudável.',
      icon: Baby,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      lessons: 8,
      duration: '10h',
      level: 'Introdutório',
      progress: 100,
      resources: [
        {
          id: '3.1',
          title: 'Plataforma AMAMOS',
          type: 'Platform',
          url: 'https://amamos.lapinf.ufn.edu.br/buscar/categoria',
          institution: 'UFN/LAPINF',
          description: 'Biblioteca virtual sobre aleitamento materno'
        },
        {
          id: '3.2',
          title: 'Guia Dez Passos para Alimentação Saudável',
          type: 'PDF',
          url: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_dez_passos_alimentacao_saudavel_2ed.pdf',
          institution: 'Ministério da Saúde'
        },
        {
          id: '3.3',
          title: 'Materiais de Aleitamento Materno',
          type: 'Website',
          url: 'https://drive.google.com/drive/folders/1BDi76730bvskLibpQEWlJKk7VRIcIlKc',
          institution: 'Google Drive - Recursos Compartilhados'
        }
      ]
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
      locked: true,
      resources: [
        {
          id: '4.1',
          title: 'Primeiros Socorros em Bebês',
          type: 'Video',
          url: 'https://www.youtube.com/watch?v=PzqnC0paEA8',
          institution: 'YouTube Educacional'
        },
        {
          id: '4.2',
          title: 'Cuidados com Recém-nascidos',
          type: 'Video',
          url: 'https://www.youtube.com/watch?v=Mr48F49Uqso',
          institution: 'YouTube Educacional'
        },
        {
          id: '4.3',
          title: 'Urgências Pediátricas',
          type: 'Video',
          url: 'https://www.youtube.com/watch?v=lm6wJiCXJPY',
          institution: 'YouTube Educacional'
        },
        {
          id: '4.4',
          title: 'App SOS Kids',
          type: 'App',
          url: 'https://play.google.com/store/apps/details?id=com.ufn.soskids&hl=pt_BR',
          institution: 'UFN',
          description: 'Aplicativo de urgências pediátricas'
        }
      ]
    },
    {
      id: 5,
      title: 'Saúde Bucal',
      description: 'Cuidados odontológicos.',
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      lessons: 6,
      duration: '8h',
      level: 'Introdutório',
      resources: [
        {
          id: '5.1',
          title: 'Cartilha Saúde Bucal da Gestante',
          type: 'PDF',
          url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/cartilhas/2022/cartilha-a-saude-bucal-da-gestante.pdf',
          institution: 'Ministério da Saúde'
        },
        {
          id: '5.2',
          title: 'Material sobre Saúde Bucal UFN',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c6/0000c608.pdf',
          institution: 'Universidade Franciscana'
        }
      ]
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
      level: 'Avançado',
      resources: [
        {
          id: '6.1',
          title: 'Protocolos de Enfermagem COREN-RS',
          type: 'Website',
          url: 'https://www.portalcoren-rs.gov.br/docs/ProtocolosEnfermagem/',
          institution: 'COREN-RS'
        },
        {
          id: '6.2',
          title: 'Cadernos de Atenção Básica',
          type: 'Website',
          url: 'https://bvsms.saude.gov.br/bvs/publicacoes/',
          institution: 'Ministério da Saúde'
        }
      ]
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
      level: 'Introdutório',
      resources: [
        {
          id: '7.1',
          title: 'App Fortalece',
          type: 'App',
          url: 'https://play.google.com/store/apps/details?id=io.kodular.miguelmachado0007.fortalece',
          institution: 'Desenvolvimento Independente',
          description: 'Acompanhamento da gestação'
        },
        {
          id: '7.2',
          title: 'App SOS Kids',
          type: 'App',
          url: 'https://play.google.com/store/apps/details?id=com.ufn.soskids',
          institution: 'UFN',
          description: 'Urgências pediátricas'
        },
        {
          id: '7.3',
          title: 'Plataforma AMAMOS',
          type: 'Platform',
          url: 'https://amamos.lapinf.ufn.edu.br/',
          institution: 'UFN/LAPINF'
        },
        {
          id: '7.4',
          title: 'Plataforma APOIARE',
          type: 'Platform',
          url: 'https://www.apoiare.lapinf.ufn.edu.br/',
          institution: 'UFN/LAPINF'
        }
      ]
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
      level: 'Introdutório',
      resources: [
        {
          id: '8.1',
          title: 'Álbum Fotográfico - Maternidade Santa Maria',
          type: 'Website',
          url: 'https://www.flickr.com/photos/prefeituradesantamaria/52890420023/in/album-72177720307320784/',
          institution: 'Prefeitura de Santa Maria'
        },
        {
          id: '8.3',
          title: 'Curso Introdutório Online',
          type: 'Website',
          url: 'https://sites.google.com/view/cursointrodutoriosm/',
          institution: 'Secretaria Municipal de Saúde SM'
        },
        {
          id: '8.4',
          title: 'Conteúdo Pediátrico',
          type: 'Website',
          url: 'https://pediatraluisapinheiro.com.br/',
          institution: 'Dra. Luisa Pinheiro'
        }
      ]
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
      level: 'Avançado',
      resources: [
        {
          id: '9.1',
          title: 'Produção Científica UFN - 1',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c5/0000c57a.pdf',
          institution: 'Universidade Franciscana'
        },
        {
          id: '9.2',
          title: 'Produção Científica UFN - 2',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c5/0000c5fe.pdf',
          institution: 'Universidade Franciscana'
        },
        {
          id: '9.3',
          title: 'Produção Científica UFN - 3',
          type: 'PDF',
          url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000bf/0000bfec.pdf',
          institution: 'Universidade Franciscana'
        }
      ]
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
      name: 'Trilha Parto-Nascimento',
      description: 'Assistência ao parto e primeiros cuidados',
      modules: [4, 3],
      totalHours: 30,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 3,
      name: 'Trilha Pós-Parto',
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
    <div className="min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">Qualifica Pré-natal</h1>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <p className="text-sm sm:text-base md:text-lg text-gray-700 italic leading-relaxed">
            "Transforme conhecimento em cuidado humanizado. Cada módulo concluído é um passo a mais na construção de um futuro saudável."
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Módulos Disponíveis</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">9</p>
              </div>
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Horas de Conteúdo</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">120h</p>
              </div>
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Profissionais Ativos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">2.450</p>
              </div>
              <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Taxa de Conclusão</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">78%</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-500 flex-shrink-0" />
            </div>
          </motion.div>
        </div>

        {/* Trilhas Formativas */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            Trilhas Formativas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {trails.map((trail) => (
              <motion.div
                key={trail.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTrail(trail.id)}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                  selectedTrail === trail.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'shadow-sm hover:shadow-md'
                } bg-gradient-to-r ${trail.color}`}
              >
                <div className="text-white">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{trail.name}</h3>
                  <p className="text-xs sm:text-sm opacity-90 mb-2 leading-relaxed">{trail.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm truncate">{trail.totalHours}h de conteúdo</span>
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
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
              className={`bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer ${
                module.locked ? 'opacity-60' : ''
              } ${isHighlighted ? 'ring-2 ring-blue-500' : ''} overflow-hidden`}
            >
              <div className="p-4 sm:p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${module.bgColor} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${module.color}`} />
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getLevelBadge(module.level)} whitespace-nowrap`}>
                    {module.level}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 mb-2 leading-tight">
                  {module.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  {module.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 gap-2">
                  <span className="flex items-center gap-1 min-w-0">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{module.lessons} aulas</span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{module.duration}</span>
                  </span>
                </div>

                {/* Progress or Lock */}
                {module.locked ? (
                  <div className="flex items-center justify-center py-2 sm:py-3 bg-gray-100 rounded-lg">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2" />
                    <span className="text-xs sm:text-sm text-gray-500">Módulo bloqueado</span>
                  </div>
                ) : module.progress !== undefined ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs text-gray-600">Progresso</span>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-900">{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${module.progress}%` }}
                        className={`h-1.5 sm:h-2 rounded-full ${
                          module.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <button className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors text-xs sm:text-sm">
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
                  className="border-t border-gray-100 p-4 sm:p-5 md:p-6 bg-gray-50"
                >
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">Recursos Disponíveis:</h4>
                  
                  {module.resources && module.resources.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {module.resources.map((resource) => {
                        const getResourceIcon = () => {
                          switch (resource.type) {
                            case 'PDF': return <FileIcon className="w-5 h-5 text-red-500" />
                            case 'Video': return <Video className="w-5 h-5 text-blue-500" />
                            case 'App': return <Smartphone className="w-5 h-5 text-green-500" />
                            case 'Platform': return <Link2 className="w-5 h-5 text-purple-500" />
                            default: return <ExternalLink className="w-5 h-5 text-gray-500" />
                          }
                        }

                        return (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getResourceIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                {resource.title}
                              </h5>
                              <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate">{resource.institution}</p>
                              {resource.description && (
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed">{resource.description}</p>
                              )}
                            </div>
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <ul className="space-y-1.5 sm:space-y-2">
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>Materiais didáticos atualizados</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>Vídeos e demonstrações práticas</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>Avaliações e exercícios</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>Certificado de conclusão</span>
                      </li>
                    </ul>
                  )}
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
        className="mt-8 sm:mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          Sistema de Conquistas
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center">
            <div className="inline-flex p-2 sm:p-3 bg-amber-100 rounded-full mb-2 sm:mb-3">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Bronze</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">3 módulos concluídos</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center opacity-60">
            <div className="inline-flex p-2 sm:p-3 bg-gray-100 rounded-full mb-2 sm:mb-3">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Prata</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">1 trilha completa</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center opacity-60">
            <div className="inline-flex p-2 sm:p-3 bg-gray-100 rounded-full mb-2 sm:mb-3">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Ouro</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">2 trilhas completas</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 text-center opacity-60">
            <div className="inline-flex p-2 sm:p-3 bg-gray-100 rounded-full mb-2 sm:mb-3">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Diamante</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">Especialista certificado</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default QualificaProfissional