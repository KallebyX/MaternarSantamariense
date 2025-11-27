import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { apolloClient } from './lib/apollo'
import { ToastProvider } from './components/ui/Toast'
import { ThemeProvider } from './components/providers/ThemeProvider'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Main Pages
import Dashboard from './pages/Dashboard'
import Gamification from './pages/Gamification'
import Training from './pages/Training'
import CourseDetail from './pages/CourseDetail'
import Chat from './pages/Chat'
import Calendar from './pages/Calendar'
import Projects from './pages/Projects'
import Policies from './pages/Policies'
import Links from './pages/Links'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import UserManagement from './pages/UserManagement'
import Analytics from './pages/Analytics'
import Documents from './pages/Documents'
import NotFound from './pages/NotFound'
import ProjectDetail from './pages/ProjectDetail'

// Layout
import { Layout } from './components/layout/Layout'

// Providers
import { AuthProvider } from './components/providers/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes with Layout */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
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
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
