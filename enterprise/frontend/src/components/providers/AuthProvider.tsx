import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { LOGIN, REGISTER, LOGOUT } from '../../graphql/mutations'
import { ME } from '../../graphql/queries'

// Verificar modo mock via variável de ambiente
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true'
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true'

export interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  name: string
  role: string
  department?: string
  position?: string
  avatar?: string
  totalXP?: number
  level?: number
  weeklyXP?: number
  currentStreak?: number
  longestStreak?: number
  lastActive?: string
  isOnline?: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (userData: RegisterInput) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  refreshUser: () => Promise<void>
}

interface RegisterInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  username?: string
  name?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock user data para desenvolvimento
const mockUsers: Record<string, User> = {
  'admin@maternar.com': {
    id: '1',
    email: 'admin@maternar.com',
    username: 'laurapellegrin',
    firstName: 'Laura',
    lastName: 'Pellegrin',
    name: 'Laura Pellegrin',
    role: 'ADMIN',
    department: 'Enfermagem',
    position: 'Coordenadora de Enfermagem',
    avatar: '/avatars/laura.jpg',
    totalXP: 5000,
    level: 10,
    weeklyXP: 250,
    currentStreak: 7,
    longestStreak: 30,
    createdAt: '2025-12-01T00:00:00Z'
  },
  'laura@maternarsantamariense.com': {
    id: '1',
    email: 'laura@maternarsantamariense.com',
    username: 'laurapellegrin',
    firstName: 'Laura',
    lastName: 'Pellegrin',
    name: 'Laura Pellegrin',
    role: 'ADMIN',
    department: 'Enfermagem',
    position: 'Coordenadora de Enfermagem',
    avatar: '/avatars/laura.jpg',
    totalXP: 5000,
    level: 10,
    weeklyXP: 250,
    currentStreak: 7,
    longestStreak: 30,
    createdAt: '2025-12-01T00:00:00Z'
  },
  'enfermeira@maternar.com': {
    id: '2',
    email: 'enfermeira@maternar.com',
    username: 'mariaoliveira',
    firstName: 'Maria',
    lastName: 'Oliveira',
    name: 'Maria Oliveira',
    role: 'USER',
    department: 'Enfermagem',
    position: 'Enfermeira Obstetra',
    avatar: '/avatars/maria.jpg',
    totalXP: 3000,
    level: 7,
    weeklyXP: 150,
    currentStreak: 3,
    longestStreak: 14,
    createdAt: '2025-11-15T00:00:00Z'
  },
  'medica@maternar.com': {
    id: '3',
    email: 'medica@maternar.com',
    username: 'carolinasantos',
    firstName: 'Carolina',
    lastName: 'Santos',
    name: 'Carolina Santos',
    role: 'MANAGER',
    department: 'Medicina',
    position: 'Médica Pediatra',
    avatar: '/avatars/carolina.jpg',
    totalXP: 4200,
    level: 8,
    weeklyXP: 200,
    currentStreak: 5,
    longestStreak: 21,
    createdAt: '2025-10-20T00:00:00Z'
  },
  'tecnica@maternar.com': {
    id: '4',
    email: 'tecnica@maternar.com',
    username: 'anarodrigues',
    firstName: 'Ana',
    lastName: 'Rodrigues',
    name: 'Ana Rodrigues',
    role: 'USER',
    department: 'Enfermagem',
    position: 'Técnica de Enfermagem',
    avatar: '/avatars/ana.jpg',
    totalXP: 2500,
    level: 6,
    weeklyXP: 120,
    currentStreak: 2,
    longestStreak: 10,
    createdAt: '2025-11-01T00:00:00Z'
  },
  'nutricionista@maternar.com': {
    id: '5',
    email: 'nutricionista@maternar.com',
    username: 'fernandacosta',
    firstName: 'Fernanda',
    lastName: 'Costa',
    name: 'Fernanda Costa',
    role: 'USER',
    department: 'Nutrição',
    position: 'Nutricionista',
    avatar: '/avatars/fernanda.jpg',
    totalXP: 2800,
    level: 6,
    weeklyXP: 140,
    currentStreak: 4,
    longestStreak: 12,
    createdAt: '2025-10-10T00:00:00Z'
  }
}

// Usuário padrão para desenvolvimento
const defaultMockUser: User = {
  id: '1',
  email: 'admin@maternar.com',
  username: 'laurapellegrin',
  firstName: 'Laura',
  lastName: 'Pellegrin',
  name: 'Laura Pellegrin',
  role: 'ADMIN',
  department: 'Enfermagem',
  position: 'Coordenadora de Enfermagem',
  totalXP: 5000,
  level: 10,
  weeklyXP: 250,
  currentStreak: 7,
  longestStreak: 30,
  createdAt: '2025-12-01T00:00:00Z'
}

// Função para criar usuário mock a partir de email
const createMockUser = (email: string): User => {
  // Verificar se é um usuário mock conhecido
  if (mockUsers[email]) {
    return mockUsers[email]
  }

  // Se for admin, retornar os dados da Laura
  if (email.toLowerCase().includes('admin')) {
    return defaultMockUser
  }

  // Criar usuário genérico
  const namePart = email.split('@')[0]
  return {
    id: Date.now().toString(),
    email,
    username: namePart,
    firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    lastName: 'Usuario',
    name: `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Usuario`,
    role: 'USER',
    department: 'Geral',
    position: 'Colaborador',
    totalXP: 0,
    level: 1,
    weeklyXP: 0,
    currentStreak: 0,
    longestStreak: 0
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apolloClient = useApolloClient()

  // GraphQL mutations (usadas apenas quando não está em modo mock)
  const [loginMutation] = useMutation(LOGIN, {
    onError: (err) => {
      if (isDebugMode) console.error('Login mutation error:', err)
    }
  })
  const [registerMutation] = useMutation(REGISTER, {
    onError: (err) => {
      if (isDebugMode) console.error('Register mutation error:', err)
    }
  })
  const [logoutMutation] = useMutation(LOGOUT, {
    onError: (err) => {
      if (isDebugMode) console.error('Logout mutation error:', err)
    }
  })

  // Função para log de debug
  const debugLog = useCallback((...args: unknown[]) => {
    if (isDebugMode) {
      console.log('[Auth]', ...args)
    }
  }, [])

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const initializeAuth = async () => {
      debugLog('Initializing auth... Mock mode:', isMockMode)

      try {
        const token = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('userData')

        if (token && storedUser) {
          debugLog('Found stored auth data')
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Em modo não-mock, tentar validar o token
          if (!isMockMode) {
            try {
              const { data } = await apolloClient.query({
                query: ME,
                fetchPolicy: 'network-only'
              })

              if (data?.me) {
                const updatedUser: User = {
                  ...data.me,
                  name: `${data.me.firstName || ''} ${data.me.lastName || ''}`.trim() || data.me.email
                }
                setUser(updatedUser)
                localStorage.setItem('userData', JSON.stringify(updatedUser))
                debugLog('User validated from server')
              }
            } catch (err) {
              debugLog('Could not validate token, using stored user')
            }
          }
        } else {
          debugLog('No stored auth data found')

          // Em modo mock, auto-login para facilitar desenvolvimento
          if (isMockMode) {
            debugLog('Mock mode enabled - auto-login with default user')
            const mockToken = 'mock-jwt-token-' + Date.now()

            localStorage.setItem('authToken', mockToken)
            localStorage.setItem('userData', JSON.stringify(defaultMockUser))
            setUser(defaultMockUser)
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        // Limpar dados corrompidos
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [apolloClient, debugLog])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)

    try {
      debugLog('Attempting login for:', email)

      if (isMockMode) {
        // Mock login - aceita qualquer senha
        debugLog('Using mock login')
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay

        const mockUser = createMockUser(email)
        const mockToken = 'mock-jwt-token-' + Date.now()

        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('userData', JSON.stringify(mockUser))
        setUser(mockUser)

        debugLog('Mock login successful')
        return { success: true }
      } else {
        // Login real via GraphQL
        debugLog('Using GraphQL login')
        const { data } = await loginMutation({
          variables: {
            input: { email, password }
          }
        })

        if (data?.login?.token) {
          const loggedUser: User = {
            ...data.login.user,
            name: `${data.login.user.firstName || ''} ${data.login.user.lastName || ''}`.trim() || data.login.user.email
          }

          localStorage.setItem('authToken', data.login.token)
          localStorage.setItem('userData', JSON.stringify(loggedUser))
          setUser(loggedUser)

          debugLog('GraphQL login successful')
          return { success: true }
        }

        return { success: false, error: 'Credenciais invalidas' }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      debugLog('Login error:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [loginMutation, debugLog])

  const register = useCallback(async (userData: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)

    try {
      debugLog('Attempting registration for:', userData.email)

      if (isMockMode) {
        // Mock register
        debugLog('Using mock registration')
        await new Promise(resolve => setTimeout(resolve, 500))

        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          firstName: userData.firstName || 'Novo',
          lastName: userData.lastName || 'Usuario',
          name: userData.name || `${userData.firstName || 'Novo'} ${userData.lastName || 'Usuario'}`,
          role: 'USER',
          department: 'Geral',
          position: 'Colaborador',
          totalXP: 0,
          level: 1
        }

        const mockToken = 'mock-jwt-token-' + Date.now()

        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('userData', JSON.stringify(newUser))
        setUser(newUser)

        debugLog('Mock registration successful')
        return { success: true }
      } else {
        // Register real via GraphQL
        debugLog('Using GraphQL registration')
        const { data } = await registerMutation({
          variables: { input: userData }
        })

        if (data?.register?.token) {
          const newUser: User = {
            ...data.register.user,
            name: `${data.register.user.firstName || ''} ${data.register.user.lastName || ''}`.trim() || data.register.user.email
          }

          localStorage.setItem('authToken', data.register.token)
          localStorage.setItem('userData', JSON.stringify(newUser))
          setUser(newUser)

          debugLog('GraphQL registration successful')
          return { success: true }
        }

        return { success: false, error: 'Erro ao criar conta' }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
      debugLog('Registration error:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [registerMutation, debugLog])

  const logout = useCallback(async () => {
    debugLog('Logging out...')

    try {
      if (!isMockMode) {
        // Tentar logout no servidor
        try {
          await logoutMutation()
        } catch (err) {
          debugLog('Server logout error (ignored):', err)
        }
      }

      // Limpar cache do Apollo
      await apolloClient.clearStore()
    } catch (err) {
      debugLog('Error clearing Apollo cache:', err)
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      setUser(null)
      setError(null)
      debugLog('Logout complete')
    }
  }, [apolloClient, logoutMutation, debugLog])

  const refreshUser = useCallback(async () => {
    if (!isMockMode && user) {
      try {
        const { data } = await apolloClient.query({
          query: ME,
          fetchPolicy: 'network-only'
        })

        if (data?.me) {
          const updatedUser: User = {
            ...data.me,
            name: `${data.me.firstName || ''} ${data.me.lastName || ''}`.trim() || data.me.email
          }
          setUser(updatedUser)
          localStorage.setItem('userData', JSON.stringify(updatedUser))
        }
      } catch (err) {
        debugLog('Error refreshing user:', err)
      }
    }
  }, [apolloClient, user, debugLog])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
