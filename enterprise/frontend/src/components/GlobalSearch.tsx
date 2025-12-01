import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  FileText, 
  Users, 
  Calendar,
  FolderKanban,
  BookOpen,
  Link as LinkIcon,
  MessageSquare,
  Clock
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'user' | 'project' | 'course' | 'policy' | 'event' | 'link' | 'chat'
  title: string
  subtitle?: string
  url: string
  icon: any
}

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Laura Pellegrin',
    'Aleitamento Materno',
    'Protocolo IHAC',
    'Curso pré-natal',
    'Santa Maria'
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search data - Replace with real API
  const mockData: SearchResult[] = [
    {
      id: '1',
      type: 'user',
      title: 'Laura Pellegrin',
      subtitle: 'Acadêmica de Enfermagem | Bolsista PROBIC - Santa Maria',
      url: '/profile/1',
      icon: Users
    },
    {
      id: '2',
      type: 'user',
      title: 'Maria Oliveira',
      subtitle: 'Enfermeira Obstetra - Santa Maria',
      url: '/profile/2',
      icon: Users
    },
    {
      id: '3',
      type: 'project',
      title: 'Programa de Aleitamento Materno',
      subtitle: 'Projeto Ativo - 12 membros',
      url: '/projects/p3',
      icon: FolderKanban
    },
    {
      id: '4',
      type: 'course',
      title: 'Cuidados Neonatais Essenciais',
      subtitle: 'Básico - 2 horas',
      url: '/training/1',
      icon: BookOpen
    },
    {
      id: '5',
      type: 'policy',
      title: 'Protocolo de Atendimento Pré-natal',
      subtitle: 'Versão 2024 - Santa Maria',
      url: '/policies/1',
      icon: FileText
    },
    {
      id: '6',
      type: 'event',
      title: 'Reunião de Equipe de Enfermagem',
      subtitle: 'Hoje às 14:00 - 3º andar',
      url: '/calendar',
      icon: Calendar
    }
  ]

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search logic
  useEffect(() => {
    if (query.length === 0) {
      setResults([])
      return
    }

    const filtered = mockData.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== result.title)
      return [result.title, ...filtered].slice(0, 5)
    })
    
    // Navigate to URL
    window.location.href = result.url
    setIsOpen(false)
    setQuery('')
  }

  const getCategoryLabel = (type: string) => {
    const labels = {
      user: 'Usuários',
      project: 'Projetos',
      course: 'Cursos',
      policy: 'Políticas',
      event: 'Eventos',
      link: 'Links',
      chat: 'Conversas'
    }
    return labels[type as keyof typeof labels]
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Pesquisar...</span>
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-[200] backdrop-blur-sm"
            />

            {/* Search Panel */}
            <div className="fixed inset-0 z-[201] overflow-y-auto p-4 pt-[10vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Pesquisar em tudo..."
                      className="flex-1 text-lg outline-none"
                      autoFocus
                    />
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded">
                      ESC
                    </kbd>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {query.length === 0 ? (
                    // Recent Searches
                    <div className="p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                        Buscas Recentes
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(search)}
                            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    // No Results
                    <div className="p-12 text-center">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum resultado encontrado</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tente buscar por outro termo
                      </p>
                    </div>
                  ) : (
                    // Grouped Results
                    <div className="p-4 space-y-4">
                      {Object.entries(groupedResults).map(([type, items]) => (
                        <div key={type}>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {getCategoryLabel(type)}
                          </p>
                          <div className="space-y-1">
                            {items.map((result) => {
                              const Icon = result.icon
                              return (
                                <motion.button
                                  key={result.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  onClick={() => handleSelect(result)}
                                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                                >
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <Icon className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {result.title}
                                    </p>
                                    {result.subtitle && (
                                      <p className="text-xs text-gray-500 truncate">
                                        {result.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navegar</span>
                    <span>↵ Selecionar</span>
                    <span>ESC Fechar</span>
                  </div>
                  <span>⌘K para abrir</span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

