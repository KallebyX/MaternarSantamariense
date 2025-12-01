import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Home,
  Trophy,
  GraduationCap,
  MessageCircle,
  Calendar,
  FolderKanban,
  FileText,
  Link as LinkIcon,
  User,
  Settings,
  BarChart3,
  Shield,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Baby,
  Heart,
  Stethoscope,
  Activity
} from 'lucide-react'

import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../providers/AuthProvider'
import { NotificationCenter } from '../NotificationCenter'
import { GlobalSearch } from '../GlobalSearch'

export const EnhancedLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Painel Principal', href: '/dashboard', icon: Home, color: 'text-pink-600' },
    { name: 'Gamificação', href: '/gamification', icon: Trophy, color: 'text-amber-600' },
    { name: 'Qualifica Profissional', href: '/qualifica-profissional', icon: GraduationCap, color: 'text-blue-600' },
    { name: 'Mensagens', href: '/chat', icon: MessageCircle, color: 'text-green-600' },
    { name: 'Agenda', href: '/calendar', icon: Calendar, color: 'text-purple-600' },
    { name: 'Projetos', href: '/projects', icon: FolderKanban, color: 'text-indigo-600' },
    { name: 'Protocolos', href: '/policies', icon: FileText, color: 'text-gray-600' },
    { name: 'Recursos', href: '/links', icon: LinkIcon, color: 'text-cyan-600' },
    { name: 'Meu Perfil', href: '/profile', icon: User, color: 'text-rose-600' },
    { name: 'Configurações', href: '/settings', icon: Settings, color: 'text-slate-600' },
    { name: 'Estatísticas', href: '/analytics', icon: BarChart3, color: 'text-emerald-600' },
    { name: 'Administração', href: '/admin', icon: Shield, color: 'text-red-600' },
  ]

  const quickStats = [
    { label: 'Pacientes Hoje', value: '24', icon: Heart, color: 'text-pink-500' },
    { label: 'Bebês', value: '12', icon: Baby, color: 'text-blue-500' },
    { label: 'Equipe Online', value: '8', icon: Stethoscope, color: 'text-green-500' },
    { label: 'Taxa', value: '98%', icon: Activity, color: 'text-purple-500' },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full maternar-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <img
                className="h-12 w-auto"
                src="/logo.png"
                alt="Maternar Santa Mariense"
              />
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Maternar
                </span>
                <p className="text-xs text-gray-600">Santa Maria</p>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-2">
              {navigation.map((item) => {
                const current = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      current
                        ? 'maternar-nav-item active'
                        : 'maternar-nav-item'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all`}
                  >
                    <item.icon
                      className={`${item.color} mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          {/* Quick Stats - Mobile */}
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              {quickStats.slice(0, 2).map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className={`${stat.color} h-5 w-5 mx-auto mb-1`} />
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 maternar-sidebar">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  className="h-12 w-auto"
                  src="/logo.png"
                  alt="Maternar Santa Mariense"
                />
                <div className="ml-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Maternar
                  </span>
                  <p className="text-sm text-gray-600">Santa Maria, RS</p>
                </div>
              </div>
              
              {/* User Info Card */}
              <div className="mx-4 mt-6 p-4 maternar-card bg-gradient-to-r from-pink-100 to-purple-100">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user?.avatar || '/avatars/laura.jpg'}
                    alt={user?.firstName || 'Laura'}
                    size="md"
                    status="online"
                    className="maternar-avatar"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName || 'Laura'} {user?.lastName || 'Pellegrin'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.position || 'Coordenadora'}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="mt-6 flex-1 px-2 space-y-2">
                {navigation.map((item) => {
                  const current = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        current
                          ? 'maternar-nav-item active'
                          : 'maternar-nav-item'
                      } group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all`}
                    >
                      <item.icon
                        className={`${item.color} mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Quick Stats - Desktop */}
              <div className="mx-4 mt-4 p-4 maternar-card">
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  Resumo do Dia
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div key={index} className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon className={`${stat.color} h-5 w-5 mx-auto mb-1`} />
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-xs text-gray-600">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 maternar-header backdrop-blur-md">
          <button
            className="px-4 border-r border-pink-200 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <GlobalSearch />
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 p-1"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <Avatar
                      src={user?.avatar || '/avatars/laura.jpg'}
                      alt={user?.name || 'Laura Pellegrin'}
                      fallback={user?.firstName?.charAt(0) || 'L'}
                      size="sm"
                      className="maternar-avatar"
                    />
                    <div className="hidden md:block ml-3">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Laura Pellegrin'}</p>
                      <p className="text-xs text-gray-600">{user?.position || 'Coordenadora de Enfermagem'}</p>
                    </div>
                    <ChevronDown className="hidden md:block ml-2 h-4 w-4 text-gray-500" />
                  </button>
                </div>
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 maternar-card focus:outline-none">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4 text-pink-600" />
                      Meu Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-600" />
                      Configurações
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors"
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-600" />
                      Sair do Sistema
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-white to-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}