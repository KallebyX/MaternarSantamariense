import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  BookOpen,
  Loader2,
  ExternalLink,
  GraduationCap,
  Shield
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { usePolicies } from '../hooks/usePolicies'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Policy {
  id: string
  title: string
  content?: string
  category: string
  isActive: boolean
  requiresAcknowledgment: boolean
  version: string
  updatedAt?: string
  readStatus?: {
    readAt?: string
    acknowledged?: boolean
  }
}

const Policies: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const { policies, loading, markAsRead, acknowledge } = usePolicies()

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const categoryCounts = policies.reduce((acc: Record<string, number>, policy: Policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { id: 'all', name: 'Todas', count: policies.length },
      ...Object.entries(categoryCounts).map(([category, count]) => ({
        id: category,
        name: category,
        count
      }))
    ]
  }, [policies])

  // Filtrar políticas
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy: Policy) => {
      const matchesCategory = activeCategory === 'all' || policy.category === activeCategory
      const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.content?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch && policy.isActive
    })
  }, [policies, activeCategory, searchTerm])

  // Estatísticas
  const stats = useMemo(() => {
    const activePolicies = policies.filter((p: Policy) => p.isActive)
    const requireAck = activePolicies.filter((p: Policy) => p.requiresAcknowledgment)
    const read = policies.filter((p: Policy) => p.readStatus?.readAt)
    const acknowledged = policies.filter((p: Policy) => p.readStatus?.acknowledged)

    return {
      total: activePolicies.length,
      requireAcknowledgment: requireAck.length,
      read: read.length,
      acknowledged: acknowledged.length
    }
  }, [policies])

  const handleViewPolicy = (policy: any) => {
    setSelectedPolicy(policy)
    if (!policy.readStatus?.readAt) {
      markAsRead(policy.id)
    }
  }

  const handleAcknowledge = async (policyId: string) => {
    await acknowledge(policyId)
    setSelectedPolicy(null)
  }

  if (loading && policies.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
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
          <h1 className="text-3xl font-bold text-gray-900">Protocolos</h1>
          <p className="text-gray-600 mt-1">
            Acesse as políticas e protocolos vigentes
          </p>
        </div>
      </motion.div>

      {/* Brasão e Links Rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Brasão */}
          <div className="flex-shrink-0">
            <img 
              src="/brasao-santa-maria.png" 
              alt="Brasão de Santa Maria" 
              className="h-24 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          
          {/* Links */}
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Protocolos e Documentos Oficiais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="https://sites.google.com/view/cursointrodutoriosm/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Curso Introdutório</span>
                <ExternalLink className="w-3 h-3 text-blue-500 ml-auto" />
              </a>
              
              <a
                href="https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Caderno de Atenção Básica 32</span>
                <ExternalLink className="w-3 h-3 text-green-500 ml-auto" />
              </a>
              
              <a
                href="https://www.portalcoren-rs.gov.br/docs/ProtocolosEnfermagem/ProtocoloEnfermagemPreNatalRiscoHabitual.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Protocolo de Enfermagem - Pré-Natal</span>
                <ExternalLink className="w-3 h-3 text-purple-500 ml-auto" />
              </a>
              
              <a
                href="https://www.santamaria.rs.gov.br/arquivos/baixar-arquivo/conteudo/D29-3877.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-900">Protocolo Municipal 1</span>
                <ExternalLink className="w-3 h-3 text-pink-500 ml-auto" />
              </a>
              
              <a
                href="https://www.santamaria.rs.gov.br/arquivos/baixar-arquivo/conteudo/D18-3328.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Protocolo Municipal 2</span>
                <ExternalLink className="w-3 h-3 text-amber-500 ml-auto" />
              </a>
              
              <a
                href="https://www.santamaria.rs.gov.br/arquivos/baixar-arquivo/conteudo/D14-2254.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-900">Protocolo Municipal 3</span>
                <ExternalLink className="w-3 h-3 text-teal-500 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-r from-maternar-blue-500 to-maternar-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total de Políticas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Requerem Confirmação</p>
                <p className="text-2xl font-bold">{stats.requireAcknowledgment}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Lidas</p>
                <p className="text-2xl font-bold">{stats.read}</p>
              </div>
              <Eye className="w-8 h-8 text-green-200" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-r from-maternar-pink-500 to-maternar-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Confirmadas</p>
                <p className="text-2xl font-bold">{stats.acknowledged}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-200" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-maternar-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={activeCategory === category.id}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar políticas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar políticas"
          />
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-maternar-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPolicies.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma política encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Tente ajustar sua busca ou filtros'
              : 'Novas políticas serão adicionadas em breve'}
          </p>
        </Card>
      )}

      {/* Policies List */}
      {!selectedPolicy ? (
        <div className="space-y-4">
          {filteredPolicies.map((policy: Policy, index: number) => {
            const isRead = !!policy.readStatus?.readAt
            const isAcknowledged = !!policy.readStatus?.acknowledged
            const needsAcknowledgment = policy.requiresAcknowledgment && !isAcknowledged

            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-6 hover:shadow-lg transition-shadow ${needsAcknowledgment ? 'border-l-4 border-yellow-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {policy.title}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          v{policy.version}
                        </Badge>
                        {policy.category && (
                          <Badge className="bg-gray-100 text-gray-800">
                            {policy.category}
                          </Badge>
                        )}
                        {isRead && (
                          <Badge className="bg-green-100 text-green-800 flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Lida
                          </Badge>
                        )}
                        {isAcknowledged && (
                          <Badge className="bg-purple-100 text-purple-800 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmada
                          </Badge>
                        )}
                        {needsAcknowledgment && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Confirmação Pendente
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {policy.content?.substring(0, 200)}...
                      </p>

                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        {policy.updatedAt && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Atualizada em {format(new Date(policy.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleViewPolicy(policy)}
                      className="ml-4"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {isRead ? 'Revisar' : 'Ler'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* Policy Detail View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedPolicy.title}
                </h2>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    Versão {selectedPolicy.version}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">
                    {selectedPolicy.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Atualizada em {format(new Date(selectedPolicy.updatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedPolicy(null)}
              >
                Voltar
              </Button>
            </div>

            <div className="prose max-w-none mb-8">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedPolicy.content}
              </div>
            </div>

            {selectedPolicy.requiresAcknowledgment && !selectedPolicy.readStatus?.acknowledged && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                        Confirmação de Leitura Obrigatória
                      </h3>
                      <p className="text-sm text-yellow-800 mb-4">
                        Esta política requer sua confirmação de que você leu e compreendeu todo o conteúdo.
                        Ao confirmar, você está declarando ciência das normas e diretrizes aqui estabelecidas.
                      </p>
                      <Button
                        onClick={() => handleAcknowledge(selectedPolicy.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Leitura
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPolicy.readStatus?.acknowledged && (
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Você confirmou esta política em {format(new Date(selectedPolicy.readStatus.readAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default Policies
