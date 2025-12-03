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
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Análise detalhada de performance e uso do sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <select 
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-1 sm:flex-none"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button className="text-xs sm:text-sm px-2 sm:px-4 py-2">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
      >
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{kpi.title}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{kpi.value}</p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-maternar-green-500 mr-1" />
                  <span className="text-xs sm:text-sm text-maternar-green-600 font-medium">{kpi.change}</span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs. período anterior</span>
                </div>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${kpi.color} flex-shrink-0`}>
                <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 min-w-0">Tendências Mensais</h3>
                <select className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm w-full sm:w-auto">
                  <option>Todos os Métricas</option>
                  <option>Usuários</option>
                  <option>Projetos</option>
                  <option>Treinamentos</option>
                </select>
              </div>
              <div className="h-64 sm:h-72 md:h-80">
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
            <Card className="p-3 sm:p-4 md:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Distribuição por Departamento</h3>
              <div className="h-64 sm:h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => window.innerWidth >= 640 ? `${name} ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
            <Card className="p-3 sm:p-4 md:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Atividade ao Longo do Dia</h3>
              <div className="h-64 sm:h-72 md:h-80">
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
            <Card className="p-3 sm:p-4 md:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Métricas de Performance</h3>
              <div className="h-64 sm:h-72 md:h-80">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Top Performers</h3>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Ver Todos
              </Button>
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-maternar-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {user.score}pts
                    </Badge>
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
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
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Atividade Recente</h3>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Ver Histórico
              </Button>
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1 sm:mt-2 flex-shrink-0 ${
                    event.type === 'success' ? 'bg-maternar-green-500' :
                    event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900 leading-tight">{event.event}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{event.time}</p>
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
        <Card className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
              <span className="truncate">Ranking Geral de Profissionais</span>
            </h3>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm flex-1 sm:flex-none min-w-0">
                <option>Todos os Departamentos</option>
                <option>Enfermagem</option>
                <option>Medicina</option>
                <option>Administração</option>
                <option>TI</option>
              </select>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ranking
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profissional
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pontuação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankingGeral.map((user) => (
                      <tr key={user.rank} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className={`
                            flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold
                            ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                              user.rank === 2 ? 'bg-gray-400 text-white' :
                              user.rank === 3 ? 'bg-orange-500 text-white' :
                              'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {user.rank}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center min-w-0">
                            <Avatar
                              src={user.avatar}
                              alt={user.name}
                              fallback={user.name.split(' ').map(n => n[0]).join('')}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <div className="ml-2 sm:ml-4 min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</div>
                              <div className="sm:hidden text-[10px] text-gray-500 truncate">{user.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {user.department}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          <div className="flex items-center">
                            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
                            Nível {user.level}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          <div className="text-right">
                            <div>{user.points.toLocaleString()} pts</div>
                            <div className="md:hidden text-[10px] text-gray-500 flex items-center justify-end mt-1">
                              <Crown className="w-3 h-3 text-yellow-500 mr-1" />
                              Nv. {user.level}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-center px-3 sm:px-0">
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Este ranking é atualizado diariamente e considera todas as atividades realizadas pelos profissionais no sistema.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Analytics