import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  User,
  Settings,
  BarChart3,
  Shield,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Baby,
  Heart,
  Users,
  BookOpen,
  HelpCircle,
  Sparkles,
  Moon,
  Sun,
  Command
} from 'lucide-react'

import { Avatar } from '../ui/Avatar'
import { useAuth } from '../providers/AuthProvider'
import { NotificationCenter } from '../NotificationCenter'
import { GlobalSearch } from '../GlobalSearch'

// Navigation items configuration with role-based access
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Visão geral do sistema'
    },
    {
      name: 'Treinamentos',
      href: '/qualifica-profissional',
      icon: GraduationCap,
      description: 'Cursos e capacitações'
    },
    {
      name: 'Produtos PPGSMI',
      href: '/produtos-ppgsmi',
      icon: Baby,
      description: 'Materiais e recursos'
    },
    {
      name: 'Gamificação',
      href: '/gamification',
      icon: Trophy,
      description: 'Conquistas e rankings'
    },
  ]

  const communicationItems = [
    {
      name: 'Mensagens',
      href: '/chat',
      icon: MessageCircle,
      badge: 3,
      description: 'Chat em tempo real'
    },
    {
      name: 'Agenda',
      href: '/calendar',
      icon: Calendar,
      description: 'Eventos e compromissos'
    },
    {
      name: 'Projetos',
      href: '/projects',
      icon: FolderKanban,
      description: 'Gestão de projetos'
    },
  ]

  const resourceItems = [
    {
      name: 'Protocolos',
      href: '/policies',
      icon: FileText,
      description: 'Documentos e normas'
    },
  ]

  const managementItems = []

  if (userRole === 'ADMIN' || userRole === 'MANAGER') {
    managementItems.push(
      {
        name: 'Estatísticas',
        href: '/analytics',
        icon: BarChart3,
        description: 'Relatórios e métricas'
      },
      {
        name: 'Usuários',
        href: '/user-management',
        icon: Users,
        description: 'Gestão de usuários'
      }
    )
  }

  if (userRole === 'ADMIN') {
    managementItems.push(
      {
        name: 'Administração',
        href: '/admin',
        icon: Shield,
        description: 'Configurações do sistema'
      }
    )
  }

  return {
    main: baseItems,
    communication: communicationItems,
    resources: resourceItems,
    management: managementItems
  }
}

export const EnhancedLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navigation = getNavigationItems(user?.role || 'USER')

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setUserMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavItem = ({ item, collapsed = false }: { item: any; collapsed?: boolean }) => {
    const isActive = location.pathname === item.href
    const Icon = item.icon

    return (
      <Link
        to={item.href}
        className={`
          enterprise-nav-item group relative
          ${isActive ? 'active' : ''}
          ${collapsed ? 'justify-center px-3' : 'px-3'}
        `}
        title={collapsed ? item.name : undefined}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-maternar-blue-600' : 'text-gray-500 group-hover:text-maternar-blue-600'}`} />

        {!collapsed && (
          <>
            <span className="ml-3 flex-1 truncate">{item.name}</span>
            {item.badge && (
              <span className="ml-auto enterprise-badge enterprise-badge-primary">
                {item.badge}
              </span>
            )}
          </>
        )}

        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-maternar-pink-500 text-[10px] font-bold text-white flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const NavSection = ({ title, items, collapsed = false }: { title: string; items: any[]; collapsed?: boolean }) => {
    if (items.length === 0) return null

    return (
      <div className="mb-4">
        {!collapsed && (
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
        )}
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:flex-col enterprise-sidebar
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'}
          transition-all duration-300 ease-in-out
        `}
      >
        {/* Logo Section */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/logo.png"
              alt="Maternar"
              className={`${sidebarCollapsed ? 'h-8 w-8' : 'h-10'} object-contain`}
            />
            {!sidebarCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gradient-brand">Maternar</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">Santa-mariense</p>
              </div>
            )}
          </Link>
        </div>

        {/* User Card */}
        {!sidebarCollapsed && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-r from-maternar-blue-50 to-maternar-green-50 border border-maternar-blue-100">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user?.avatar}
                alt={user?.firstName}
                fallback={user?.firstName?.charAt(0) || 'U'}
                size="md"
                className="enterprise-avatar ring-2 ring-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.position || user?.role}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="enterprise-badge enterprise-badge-success">
                <Sparkles className="h-3 w-3 mr-1" />
                Nível {user?.level || 1}
              </span>
              <span className="text-gray-500">{user?.totalXP || 0} XP</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          <NavSection title="Principal" items={navigation.main} collapsed={sidebarCollapsed} />
          <NavSection title="Comunicação" items={navigation.communication} collapsed={sidebarCollapsed} />
          <NavSection title="Recursos" items={navigation.resources} collapsed={sidebarCollapsed} />
          {navigation.management.length > 0 && (
            <NavSection title="Gestão" items={navigation.management} collapsed={sidebarCollapsed} />
          )}
        </nav>

        {/* Bottom Actions */}
        <div className={`border-t border-gray-200 p-3 ${sidebarCollapsed ? 'flex flex-col items-center space-y-2' : 'space-y-1'}`}>
          <Link
            to="/settings"
            className={`enterprise-nav-item ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'}`}
          >
            <Settings className="h-5 w-5 text-gray-500" />
            {!sidebarCollapsed && <span className="ml-3">Configurações</span>}
          </Link>
          <Link
            to="/profile"
            className={`enterprise-nav-item ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'}`}
          >
            <User className="h-5 w-5 text-gray-500" />
            {!sidebarCollapsed && <span className="ml-3">Meu Perfil</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`enterprise-nav-item w-full text-red-600 hover:bg-red-50 ${sidebarCollapsed ? 'justify-center px-3' : 'px-3'}`}
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span className="ml-3">Sair</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-20 -right-3 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] enterprise-sidebar z-50 lg:hidden"
            >
              {/* Mobile Logo */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <Link to="/dashboard" className="flex items-center">
                  <img src="/logo.png" alt="Maternar" className="h-10 object-contain" />
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gradient-brand">Maternar</h1>
                    <p className="text-[10px] text-gray-500 -mt-0.5">Santa-mariense</p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile User Card */}
              <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-r from-maternar-blue-50 to-maternar-green-50 border border-maternar-blue-100">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.firstName}
                    fallback={user?.firstName?.charAt(0) || 'U'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <NavSection title="Principal" items={navigation.main} />
                <NavSection title="Comunicação" items={navigation.communication} />
                <NavSection title="Recursos" items={navigation.resources} />
                {navigation.management.length > 0 && (
                  <NavSection title="Gestão" items={navigation.management} />
                )}
              </nav>

              {/* Mobile Bottom Actions */}
              <div className="border-t border-gray-200 p-3 space-y-1">
                <Link to="/settings" className="enterprise-nav-item px-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="ml-3">Configurações</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="enterprise-nav-item w-full text-red-600 hover:bg-red-50 px-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="enterprise-header h-16 flex items-center justify-between px-4 lg:px-6 z-30">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.main.find(i => i.href === location.pathname)?.name ||
                 navigation.communication.find(i => i.href === location.pathname)?.name ||
                 navigation.resources.find(i => i.href === location.pathname)?.name ||
                 navigation.management.find(i => i.href === location.pathname)?.name ||
                 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <GlobalSearch />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Search className="h-5 w-5" />
            </button>

            {/* Keyboard shortcut hint */}
            <div className="hidden lg:flex items-center text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1">
              <Command className="h-3 w-3 mr-1" />
              <span>K</span>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.firstName}
                  fallback={user?.firstName?.charAt(0) || 'U'}
                  size="sm"
                  className="enterprise-avatar"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ChevronDown className={`hidden lg:block h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 enterprise-dropdown z-50"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="enterprise-dropdown-item"
                      >
                        <User className="h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="enterprise-dropdown-item"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                      <Link
                        to="/gamification"
                        onClick={() => setUserMenuOpen(false)}
                        className="enterprise-dropdown-item"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>Minhas Conquistas</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="enterprise-dropdown-item w-full text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair do Sistema</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-gray-200 bg-white mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src="/logo_ufn.png"
                  alt="UFN"
                  className="h-8 object-contain opacity-70"
                />
                <span className="text-xs text-gray-400">
                  Universidade Franciscana
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Maternar Santa-mariense - Plataforma de Saúde Materno-Infantil
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
