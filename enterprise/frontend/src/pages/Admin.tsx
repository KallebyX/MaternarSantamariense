import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Settings, 
  Shield, 
  Database, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts'

const Admin: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  const systemStats = [
    { title: 'Uptime', value: '99.9%', status: 'success', icon: Clock },
    { title: 'CPU Usage', value: '45%', status: 'success', icon: Cpu },
    { title: 'Memory', value: '68%', status: 'warning', icon: HardDrive },
    { title: 'Network', value: '12MB/s', status: 'success', icon: Wifi }
  ]

  const recentLogs = [
    { time: '14:30', level: 'INFO', message: 'User login successful: admin@maternarsm.com.br' },
    { time: '14:25', level: 'WARNING', message: 'High memory usage detected on server' },
    { time: '14:20', level: 'INFO', message: 'Database backup completed successfully' },
    { time: '14:15', level: 'ERROR', message: 'Failed to send notification to user' },
    { time: '14:10', level: 'INFO', message: 'New user registered: joao@maternarsm.com.br' }
  ]

  const performanceData = [
    { time: '00:00', requests: 120, responseTime: 45 },
    { time: '04:00', requests: 80, responseTime: 38 },
    { time: '08:00', requests: 450, responseTime: 52 },
    { time: '12:00', requests: 780, responseTime: 68 },
    { time: '16:00', requests: 650, responseTime: 58 },
    { time: '20:00', requests: 320, responseTime: 42 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-100'
      case 'WARNING': return 'text-yellow-600 bg-yellow-100'
      case 'INFO': return 'text-maternar-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'system', label: 'Sistema', icon: Server },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  const handleBackup = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      showToast({
        type: 'success',
        title: 'Backup criado!',
        message: 'Backup do banco de dados foi criado com sucesso.'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro ao criar backup',
        message: 'Não foi possível criar o backup.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSecurityScan = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      showToast({
        type: 'success',
        title: 'Verificação concluída',
        message: 'Nenhuma vulnerabilidade crítica encontrada.'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na verificação',
        message: 'Não foi possível completar a verificação de segurança.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-1">
            Painel administrativo do sistema Maternar Santa Mariense
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Sistema Online
          </Badge>
          <Button variant="outline" onClick={() => setLoading(true)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-1">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-maternar-blue-100 text-maternar-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {systemStats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.status === 'success' ? 'bg-green-500' :
                    stat.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance do Sistema</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E4A7A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1E4A7A" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#1E4A7A" 
                      fillOpacity={1} 
                      fill="url(#colorRequests)"
                      name="Requisições"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#7AB844" 
                      strokeWidth={2}
                      name="Tempo de Resposta (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Logs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Logs Recentes</h3>
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 font-mono min-w-0 flex-shrink-0">
                        {log.time}
                      </span>
                      <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                        {log.level}
                      </Badge>
                      <p className="text-sm text-gray-700 flex-1 min-w-0">
                        {log.message}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleBackup}
                    disabled={loading}
                  >
                    <Database className="w-4 h-4 mr-3" />
                    Backup do Banco de Dados
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/user-management')}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Gerenciar Usuários
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSecurityScan}
                    disabled={loading}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Verificar Segurança
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/analytics')}
                  >
                    <Activity className="w-4 h-4 mr-3" />
                    Monitorar Performance
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configurações Avançadas
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Gerenciamento de Usuários</h3>
              <Button onClick={() => navigate('/user-management')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-maternar-blue-50">
                <p className="text-sm text-maternar-blue-600 font-medium">Total de Usuários</p>
                <p className="text-3xl font-bold text-maternar-blue-900 mt-2">1,247</p>
                <p className="text-xs text-maternar-blue-600 mt-1">+12% este mês</p>
              </Card>
              <Card className="p-4 bg-green-50">
                <p className="text-sm text-green-600 font-medium">Administradores</p>
                <p className="text-3xl font-bold text-green-900 mt-2">5</p>
              </Card>
              <Card className="p-4 bg-orange-50">
                <p className="text-sm text-orange-600 font-medium">Gerentes</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">28</p>
              </Card>
              <Card className="p-4 bg-purple-50">
                <p className="text-sm text-purple-600 font-medium">Ativos Hoje</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">892</p>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => navigate('/user-management')}>
                Ver Gerenciamento Completo
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Versão do Sistema</h3>
              <p className="text-3xl font-bold text-maternar-blue-600">v2.0.0</p>
              <p className="text-sm text-gray-500 mt-2">Última atualização: 24/10/2025</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uptime</h3>
              <p className="text-3xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-500 mt-2">142 dias sem interrupções</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requisições Hoje</h3>
              <p className="text-3xl font-bold text-purple-600">145K</p>
              <p className="text-sm text-gray-500 mt-2">+8% vs ontem</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Monitoramento em Tempo Real</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#6B7280" />
                  <YAxis yAxisId="left" stroke="#6B7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#1E4A7A" 
                    strokeWidth={2}
                    name="Requisições"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#7AB844" 
                    strokeWidth={2}
                    name="Tempo de Resposta (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">SSL/TLS</h3>
              </div>
              <Badge className="bg-green-100 text-green-800">Ativo e Válido</Badge>
              <p className="text-sm text-gray-500 mt-2">Expira em: 15/03/2026</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Firewall</h3>
              </div>
              <Badge className="bg-green-100 text-green-800">Proteção Ativa</Badge>
              <p className="text-sm text-gray-500 mt-2">234 ameaças bloqueadas hoje</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Backups</h3>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Verificar</Badge>
              <p className="text-sm text-gray-500 mt-2">Último backup: 2 dias atrás</p>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Verificação de Segurança</h3>
              <Button onClick={handleSecurityScan} disabled={loading}>
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Verificando...' : 'Executar Verificação'}
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { check: 'Passwords com hash seguro', status: 'passed' },
                { check: 'Tokens JWT válidos', status: 'passed' },
                { check: 'Rate limiting ativo', status: 'passed' },
                { check: 'CORS configurado', status: 'passed' },
                { check: 'Backups recentes', status: 'warning' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{item.check}</span>
                  {item.status === 'passed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tamanho do Banco</h3>
              <p className="text-3xl font-bold text-maternar-blue-600">2.8 GB</p>
              <p className="text-sm text-gray-500 mt-2">Crescimento: +120MB este mês</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conexões Ativas</h3>
              <p className="text-3xl font-bold text-green-600">42</p>
              <p className="text-sm text-gray-500 mt-2">Máximo: 100</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Queries/segundo</h3>
              <p className="text-3xl font-bold text-purple-600">1,234</p>
              <p className="text-sm text-gray-500 mt-2">Tempo médio: 45ms</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Operações de Banco de Dados</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleBackup}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-3" />
                Criar Backup Completo
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-3" />
                Restaurar Backup
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <RefreshCw className="w-4 h-4 mr-3" />
                Otimizar Tabelas
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="w-4 h-4 mr-3" />
                Analisar Performance
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Configurações do Sistema</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Sistema
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    defaultValue="Maternar Santa Mariense"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo de Manutenção
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="off">Desativado</option>
                    <option value="on">Ativado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Upload (MB)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    defaultValue="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (req/min)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    defaultValue="1000"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={() => showToast({ type: 'success', title: 'Configurações salvas!' })}>
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default Admin
