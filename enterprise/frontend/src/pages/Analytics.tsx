import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Trophy,
  Crown
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  const monthlyData = [
    { month: 'Jan', usuarios: 340, projetos: 45, treinamentos: 120, eventos: 28 },
    { month: 'Fev', usuarios: 380, projetos: 52, treinamentos: 135, eventos: 32 },
    { month: 'Mar', usuarios: 420, projetos: 48, treinamentos: 150, eventos: 35 },
    { month: 'Abr', usuarios: 450, projetos: 55, treinamentos: 165, eventos: 40 },
    { month: 'Mai', usuarios: 480, projetos: 62, treinamentos: 180, eventos: 45 },
    { month: 'Jun', usuarios: 520, projetos: 58, treinamentos: 195, eventos: 48 }
  ]

  const departmentData = [
    { name: 'Enfermagem', value: 45, color: '#3B82F6' },
    { name: 'Medicina', value: 30, color: '#10B981' },
    { name: 'Administração', value: 15, color: '#F59E0B' },
    { name: 'TI', value: 10, color: '#EF4444' }
  ]

  const activityData = [
    { time: '00:00', atividade: 12 },
    { time: '04:00', atividade: 8 },
    { time: '08:00', atividade: 45 },
    { time: '12:00', atividade: 78 },
    { time: '16:00', atividade: 65 },
    { time: '20:00', atividade: 32 }
  ]

  const performanceData = [
    { period: 'Sem 1', eficiencia: 85, satisfacao: 88, produtividade: 82 },
    { period: 'Sem 2', eficiencia: 88, satisfacao: 90, produtividade: 85 },
    { period: 'Sem 3', eficiencia: 92, satisfacao: 92, produtividade: 88 },
    { period: 'Sem 4', eficiencia: 90, satisfacao: 94, produtividade: 90 }
  ]

  const kpiCards = [
    {
      title: 'Usuários Ativos',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Projetos Ativos',
      value: '89',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'bg-maternar-green-500'
    },
    {
      title: 'Taxa de Conclusão',
      value: '94.5%',
      change: '+3.2%',
      trend: 'up',
      icon: Award,
      color: 'bg-purple-500'
    },
    {
      title: 'Eventos este Mês',
      value: '156',
      change: '+15%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ]

  const topUsers = [
    { name: 'Ana Costa', department: 'Enfermagem', score: 95, avatar: 'AC' },
    { name: 'Dr. Silva', department: 'Medicina', score: 92, avatar: 'DS' },
    { name: 'Carlos Lima', department: 'TI', score: 88, avatar: 'CL' },
    { name: 'Maria Santos', department: 'Administração', score: 85, avatar: 'MS' },
    { name: 'João Ferreira', department: 'Enfermagem', score: 82, avatar: 'JF' }
  ]

  const recentEvents = [
    { time: '10:30', event: 'Novo usuário registrado', type: 'success' },
    { time: '10:15', event: 'Projeto "Modernização UTI" concluído', type: 'success' },
    { time: '09:45', event: 'Treinamento "Segurança do Paciente" iniciado', type: 'info' },
    { time: '09:30', event: 'Sistema de backup executado', type: 'info' },
    { time: '09:00', event: 'Reunião mensal agendada', type: 'warning' }
  ]

  const rankingGeral = [
    { rank: 1, name: 'Dr. Maria Silva', points: 52340, avatar: '/avatars/maria.jpg', level: 18, department: 'Enfermagem' },
    { rank: 2, name: 'João Santos', points: 48920, avatar: '/avatars/joao.jpg', level: 17, department: 'Medicina' },
    { rank: 3, name: 'Ana Costa', points: 45230, avatar: '/avatars/ana.jpg', level: 15, department: 'Administração' },
    { rank: 4, name: 'Pedro Lima', points: 43180, avatar: '/avatars/pedro.jpg', level: 15, department: 'TI' },
    { rank: 5, name: 'Sofia Oliveira', points: 41560, avatar: '/avatars/sofia.jpg', level: 14, department: 'Enfermagem' },
    { rank: 6, name: 'Carlos Mendes', points: 40120, avatar: '/avatars/carlos.jpg', level: 14, department: 'Medicina' },
    { rank: 7, name: 'Juliana Rocha', points: 38900, avatar: '/avatars/juliana.jpg', level: 13, department: 'Administração' },
    { rank: 8, name: 'Ricardo Alves', points: 37500, avatar: '/avatars/ricardo.jpg', level: 13, department: 'Enfermagem' },
    { rank: 9, name: 'Fernanda Costa', points: 36200, avatar: '/avatars/fernanda.jpg', level: 12, department: 'Medicina' },
    { rank: 10, name: 'Paulo Henrique', points: 35100, avatar: '/avatars/paulo.jpg', level: 12, department: 'TI' }
  ]

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada de performance e uso do sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-maternar-green-500 mr-1" />
                  <span className="text-sm text-maternar-green-600 font-medium">{kpi.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs. período anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Tendências Mensais</h3>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>Todos os Métricas</option>
                  <option>Usuários</option>
                  <option>Projetos</option>
                  <option>Treinamentos</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="usuarios" stroke="#1E4A7A" strokeWidth={2} name="Usuários" />
                    <Line type="monotone" dataKey="projetos" stroke="#7AB844" strokeWidth={2} name="Projetos" />
                    <Line type="monotone" dataKey="treinamentos" stroke="#D42E5B" strokeWidth={2} name="Treinamentos" />
                    <Line type="monotone" dataKey="eventos" stroke="#9B9B9B" strokeWidth={2} name="Eventos" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Distribuição por Departamento</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Atividade ao Longo do Dia</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="atividade" 
                      stroke="#1E4A7A" 
                      fillOpacity={1} 
                      fill="url(#colorActivity)"
                      name="Atividade"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Métricas de Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="period" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="eficiencia" fill="#1E4A7A" name="Eficiência" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="satisfacao" fill="#7AB844" name="Satisfação" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="produtividade" fill="#D42E5B" name="Produtividade" radius={[8, 8, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Top Performers</h3>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </div>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maternar-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {user.score}pts
                    </Badge>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Atividade Recente</h3>
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Ver Histórico
              </Button>
            </div>
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.type === 'success' ? 'bg-maternar-green-500' :
                    event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Ranking Geral */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Ranking Geral de Profissionais
            </h3>
            <div className="flex gap-2">
              <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                <option>Todos os Departamentos</option>
                <option>Enfermagem</option>
                <option>Medicina</option>
                <option>Administração</option>
                <option>TI</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontuação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankingGeral.map((user) => (
                  <tr key={user.rank} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                          user.rank === 2 ? 'bg-gray-400 text-white' :
                          user.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {user.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          fallback={user.name.split(' ').map(n => n[0]).join('')}
                          size="sm"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 text-yellow-500 mr-1" />
                        Nível {user.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.points.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Este ranking é atualizado diariamente e considera todas as atividades realizadas pelos profissionais no sistema.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Analytics