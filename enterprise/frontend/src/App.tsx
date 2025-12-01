import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/apollo'
import { ToastProvider } from './components/ui/Toast'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

// Auth Pages (carregamento imediato para login rapido)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Lazy loaded pages para melhor performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardEnhanced = lazy(() => import('./pages/DashboardEnhanced'))
const Gamification = lazy(() => import('./pages/Gamification'))
const Training = lazy(() => import('./pages/Training'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const Chat = lazy(() => import('./pages/Chat'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Policies = lazy(() => import('./pages/Policies'))
const Links = lazy(() => import('./pages/Links'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Admin = lazy(() => import('./pages/Admin'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Documents = lazy(() => import('./pages/Documents'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Layout
import { Layout } from './components/layout/Layout'
import { EnhancedLayout } from './components/layout/EnhancedLayout'

// Providers
import { AuthProvider } from './components/providers/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maternar-blue-50 via-white to-maternar-green-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maternar-blue-600 mx-auto"></div>
      <p className="mt-4 text-maternar-gray-600">Carregando...</p>
    </div>
  </div>
)

// App Error Fallback
const AppErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Algo deu errado</h2>
      <p className="text-gray-600 mb-6">
        Ocorreu um erro inesperado. Por favor, tente recarregar a pagina.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-maternar-blue-600 text-white rounded-md hover:bg-maternar-blue-700 transition-colors"
        >
          Recarregar Pagina
        </button>
        <button
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Limpar Dados e Voltar ao Login
        </button>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Routes with Layout */}
                    <Route element={<ProtectedRoute><EnhancedLayout /></ProtectedRoute>}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardEnhanced />} />
                      <Route path="/gamification" element={<Gamification />} />
                      <Route path="/training" element={<Training />} />
                      <Route path="/training/:id" element={<CourseDetail />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/policies" element={<Policies />} />
                      <Route path="/links" element={<Links />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />

                      {/* Admin only routes */}
                      <Route path="/admin" element={<ProtectedRoute requiredRole={['ADMIN']}><Admin /></ProtectedRoute>} />
                      <Route path="/user-management" element={<ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}><UserManagement /></ProtectedRoute>} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/documents" element={<Documents />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </ApolloProvider>
    </ErrorBoundary>
  )
}

export default App
