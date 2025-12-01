import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Download,
  Upload
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  department: string
  status: 'active' | 'inactive'
  avatar?: string
  lastActive: string
  createdAt: string
}

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Mock data - Replace with real API data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Laura Pellegrin',
      email: 'laura@maternarsantamariense.com',
      role: 'ADMIN',
      department: 'Enfermagem',
      status: 'active',
      lastActive: '2 min atrás',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@maternarsm.com.br',
      role: 'MANAGER',
      department: 'Medicina',
      status: 'active',
      lastActive: '5 min atrás',
      createdAt: '2024-02-10'
    },
    {
      id: '3',
      name: 'João Silva',
      email: 'joao@maternarsm.com.br',
      role: 'USER',
      department: 'Enfermagem',
      status: 'active',
      lastActive: '1 hora atrás',
      createdAt: '2024-03-05'
    }
  ])

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      USER: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      USER: 'Usuário'
    }
    return { style: styles[role as keyof typeof styles], label: labels[role as keyof typeof labels] }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? { style: 'bg-green-100 text-green-800', label: 'Ativo' }
      : { style: 'bg-gray-100 text-gray-800', label: 'Inativo' }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowNewUserModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-maternar-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gerentes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.role === 'MANAGER').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-maternar-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maternar-blue-500"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maternar-blue-500"
            >
              <option value="all">Todas as Funções</option>
              <option value="ADMIN">Administrador</option>
              <option value="MANAGER">Gerente</option>
              <option value="USER">Usuário</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maternar-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          name={user.name}
                          size="md"
                          className="mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleBadge(user.role).style}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(user.status).style}>
                        {getStatusBadge(user.status).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-maternar-blue-600 hover:text-maternar-blue-900"
                          aria-label="Editar usuário"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          aria-label="Excluir usuário"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="Mais opções"
                          title="Mais opções"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default UserManagement
