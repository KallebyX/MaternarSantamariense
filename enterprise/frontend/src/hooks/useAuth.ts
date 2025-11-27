import { useMutation } from '@apollo/client'
import { LOGIN, REGISTER, LOGOUT } from '../graphql/mutations'
import { useNavigate } from 'react-router-dom'

// Simple toast wrapper to avoid dependency issues
let toastShow: any = null
export const setToast = (show: any) => {
  toastShow = show
}

const showToast = ({ type, title, message }: any) => {
  if (toastShow) {
    toastShow({ type, title, message })
  } else {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
  }
}

export const useAuth = () => {
  const navigate = useNavigate()

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN)
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER)
  const [logoutMutation] = useMutation(LOGOUT)

  const loading = loginLoading || registerLoading

  // Get current user from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  const user = getUserFromStorage()

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      })

      if (data.login.token) {
        localStorage.setItem('authToken', data.login.token)
        localStorage.setItem('user', JSON.stringify(data.login.user))
        
        showToast({
          type: 'success',
          title: 'Login realizado com sucesso!',
          message: `Bem-vindo, ${data.login.user.firstName}!`
        })

        navigate('/dashboard')
        return { success: true, user: data.login.user }
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro no login',
        message: error.message || 'Credenciais inválidas'
      })
      return { success: false, error: error.message }
    }
  }

  const register = async (input: any) => {
    try {
      const { data } = await registerMutation({
        variables: { input }
      })

      if (data.register.token) {
        localStorage.setItem('authToken', data.register.token)
        localStorage.setItem('user', JSON.stringify(data.register.user))
        
        showToast({
          type: 'success',
          title: 'Conta criada com sucesso!',
          message: `Bem-vindo, ${data.register.user.firstName}!`
        })

        navigate('/dashboard')
        return { success: true, user: data.register.user }
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar conta',
        message: error.message || 'Dados inválidos'
      })
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await logoutMutation()
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      navigate('/login')
    } catch (error: any) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    login,
    register,
    logout,
    loading
  }
}
