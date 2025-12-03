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
} from 'lucide-react'

import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../providers/AuthProvider'
import { NotificationCenter } from '../NotificationCenter'
import { GlobalSearch } from '../GlobalSearch'

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Gamificação', href: '/gamification', icon: Trophy },
    { name: 'Qualifica Profissional', href: '/qualifica-profissional', icon: GraduationCap },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Agenda', href: '/calendar', icon: Calendar },
    { name: 'Projetos', href: '/projects', icon: FolderKanban },
    { name: 'Políticas', href: '/policies', icon: FileText },
    { name: 'Links', href: '/links', icon: LinkIcon },
    { name: 'Perfil', href: '/profile', icon: User },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Admin', href: '/admin', icon: Shield },
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-maternar-blue-300"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <img
                className="h-10 w-auto"
                src="/logo.png"
                alt="Maternar Santa-mariense"
              />
              <span className="ml-2 text-lg font-bold text-primary">Maternar</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const current = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      current
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <item.icon
                      className={`${
                        current ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-border bg-card">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  className="h-10 w-auto"
                  src="/logo.png"
                  alt="Maternar Santa-mariense"
                />
                <span className="ml-2 text-lg font-bold text-primary">Maternar</span>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-card space-y-1">
                {navigation.map((item) => {
                  const current = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        current
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                    >
                      <item.icon
                        className={`${
                          current ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <button
            className="px-4 border-r border-border text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <GlobalSearch />
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs bg-card flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
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
                      <p className="text-xs text-gray-600">{user?.position || 'Acadêmica de Enfermagem | Bolsista PROBIC'}</p>
                    </div>
                    <ChevronDown className="hidden md:block ml-2 h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-popover border border-border focus:outline-none">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Seu Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Configurações
                    </Link>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
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