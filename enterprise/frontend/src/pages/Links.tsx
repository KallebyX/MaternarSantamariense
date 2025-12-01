import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Link as LinkIcon,
  ExternalLink,
  Search,
  BookOpen,
  Headphones,
  Settings,
  Globe,
  Loader2
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useLinks } from '../hooks/useLinks'

interface Link {
  id: string
  title: string
  url: string
  description?: string
  category: string
  isActive: boolean
  icon?: string
}

const Links: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { links, loading } = useLinks()

  // Mapear categorias do backend para display
  const categoryMap: Record<string, { name: string; icon: typeof Globe }> = {
    'SYSTEM': { name: 'Sistemas', icon: Settings },
    'TRAINING': { name: 'Treinamentos', icon: BookOpen },
    'SUPPORT': { name: 'Suporte', icon: Headphones },
    'EXTERNAL': { name: 'Externos', icon: Globe }
  }

  // Contar links por categoria
  const categories = useMemo(() => {
    const counts = links.reduce((acc: Record<string, number>, link: Link) => {
      acc[link.category] = (acc[link.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { id: 'all', name: 'Todos', count: links.length, icon: LinkIcon },
      ...Object.entries(counts).map(([cat, count]) => ({
        id: cat,
        name: categoryMap[cat]?.name || cat,
        count,
        icon: categoryMap[cat]?.icon || Globe
      }))
    ]
  }, [links])

  // Filtrar links
  const filteredLinks = useMemo(() => {
    return links.filter((link: Link) => {
      const matchesCategory = activeCategory === 'all' || link.category === activeCategory
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch && link.isActive
    })
  }, [links, activeCategory, searchTerm])

  // Cor por categoria
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SYSTEM': 'bg-blue-100 text-blue-800',
      'TRAINING': 'bg-purple-100 text-purple-800',
      'SUPPORT': 'bg-green-100 text-green-800',
      'EXTERNAL': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading && links.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Links Úteis</h1>
          <p className="text-gray-600 mt-1">
            Acesso rápido a sistemas, recursos e ferramentas importantes
          </p>
        </div>
      </motion.div>

      {/* Categories Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-maternar-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={activeCategory === category.id}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.name} ({category.count})
            </button>
          )
        })}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar links..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maternar-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar links"
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
      {!loading && filteredLinks.length === 0 && (
        <Card className="p-12 text-center">
          <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum link encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Tente ajustar sua busca ou filtros'
              : 'Novos links serão adicionados em breve'}
          </p>
        </Card>
      )}

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLinks.map((link: Link, index: number) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
              <a
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : '_self'}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex flex-col h-full"
                aria-label={`Acessar ${link.title}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-maternar-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {link.url.includes('gov.br') ? '🏛️' :
                     link.url.includes('portal') || link.url.includes('maternarsm') ? '🏥' :
                     link.category === 'TRAINING' ? '🎓' :
                     link.category === 'SUPPORT' ? '💬' : '🔗'}
                  </div>
                  <Badge className={getCategoryColor(link.category)}>
                    {categoryMap[link.category]?.name || link.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  {link.title}
                  {link.url.startsWith('http') && (
                    <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                  )}
                </h3>

                <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
                  {link.description || 'Sem descrição disponível'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 truncate">
                    {link.url.replace('https://', '').replace('http://', '').split('/')[0]}
                  </span>
                  <span className="text-xs font-medium text-maternar-blue-600">
                    Acessar →
                  </span>
                </div>
              </a>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Links
