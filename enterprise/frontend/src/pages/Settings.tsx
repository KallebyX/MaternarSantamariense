import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Globe,
  Palette,
  Monitor,
  Database,
  Key,
  Save,
  RotateCcw
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../components/providers/AuthProvider'

const Settings: React.FC = () => {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      appointments: true,
      projects: true,
      training: false
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataSharing: false
    },
    appearance: {
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      fontSize: 'medium'
    }
  })

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'security', label: 'Segurança', icon: Key },
    { id: 'system', label: 'Sistema', icon: Monitor }
  ]

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' }
  ]

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' }
  ]

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement GraphQL mutation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      showToast({
        type: 'success',
        title: 'Configurações salvas!',
        message: 'Suas preferências foram atualizadas com sucesso.'
      })
      
      setHasChanges(false)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar as configurações. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        appointments: true,
        projects: true,
        training: false
      },
      privacy: {
        profileVisibility: 'team',
        activityTracking: true,
        dataSharing: false
      },
      appearance: {
          language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        fontSize: 'medium'
      }
    }
    
    setSettings(defaultSettings)
    setHasChanges(true)
    
    showToast({
      type: 'info',
      title: 'Restaurado',
      message: 'Configurações restauradas para os valores padrão. Clique em Salvar para aplicar.'
    })
  }

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-maternar-blue-600" 
            disabled={loading || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          {hasChanges && !loading && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Alterações não salvas
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Configurações do Perfil</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.name || 'Laura Pellegrin'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.email || 'laura@maternarsantamariense.com'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="+55 (55) 99765-4321"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.position || "Acadêmica de Enfermagem | Bolsista PROBIC"}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.department || "Enfermagem"}
                    >
                      <option>Enfermagem</option>
                      <option>Medicina</option>
                      <option>Administração</option>
                      <option>TI</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="Acadêmica do curso de Enfermagem da Universidade Franciscana (UFN), Santa Maria - RS. Bolsista PROBIC/UFN com projeto sobre Atenção Pré-Natal. Integrante do GESTAR e GEPESES/UFN."
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Canais de Notificação</h3>
                  
                  {[
                    { key: 'email', label: 'Email', description: 'Receber notificações por email' },
                    { key: 'push', label: 'Push', description: 'Notificações push no navegador' },
                    { key: 'sms', label: 'SMS', description: 'Notificações por mensagem de texto' }
                  ].map((channel) => (
                    <div key={channel.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{channel.label}</h4>
                        <p className="text-sm text-gray-600">{channel.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications[channel.key as keyof typeof settings.notifications]}
                          onChange={(e) => updateSettings('notifications', channel.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maternar-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Tipos de Notificação</h3>
                  
                  {[
                    { key: 'appointments', label: 'Compromissos', description: 'Lembretes de reuniões e consultas' },
                    { key: 'projects', label: 'Projetos', description: 'Atualizações de projetos' },
                    { key: 'training', label: 'Treinamentos', description: 'Novos cursos e certificações' }
                  ].map((type) => (
                    <div key={type.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications[type.key as keyof typeof settings.notifications]}
                          onChange={(e) => updateSettings('notifications', type.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maternar-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Aparência</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={settings.appearance.language}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, language: e.target.value }
                      })}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuso Horário
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={settings.appearance.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, timezone: e.target.value }
                      })}
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho da Fonte
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={settings.appearance.fontSize}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, fontSize: e.target.value }
                      })}
                    >
                      <option value="small">Pequena</option>
                      <option value="medium">Média</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Alterar Senha</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Última alteração: 15 de setembro de 2025
                    </p>
                    <Button variant="outline">Alterar Senha</Button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Autenticação de Dois Fatores</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-red-100 text-red-800">Desabilitado</Badge>
                      <Button variant="outline">Configurar 2FA</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Sessões Ativas</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Gerencie dispositivos conectados à sua conta
                    </p>
                    <Button variant="outline">Ver Sessões</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Sistema</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Versão do Sistema</h3>
                    <p className="text-sm text-gray-600">Maternar Enterprise v2.0.0</p>
                    <Badge className="bg-green-100 text-green-800 mt-2">Atualizado</Badge>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Cache</h3>
                    <p className="text-sm text-gray-600 mb-3">Limpar dados temporários</p>
                    <Button variant="outline" size="sm">Limpar Cache</Button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Backup</h3>
                    <p className="text-sm text-gray-600 mb-3">Último backup: Hoje, 02:00</p>
                    <Button variant="outline" size="sm">Fazer Backup</Button>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Logs</h3>
                    <p className="text-sm text-gray-600 mb-3">Visualizar logs do sistema</p>
                    <Button variant="outline" size="sm">Ver Logs</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings