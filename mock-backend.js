const express = require('express')
const cors = require('cors')
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Mock user
const mockUser = {
  id: '1',
  email: 'admin@maternarsm.com.br',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'Sistema',
  role: 'ADMIN',
  avatar: null,
  department: 'Tecnologia',
  position: 'Administrador',
  totalXP: 1000,
  level: 10,
  weeklyXP: 100,
  currentStreak: 7,
  longestStreak: 30
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'mock'
  })
})

// GraphQL endpoint
app.post('/graphql', (req, res) => {
  const { query, variables } = req.body
  
  // Mock login mutation
  if (query.includes('login')) {
    if (variables?.input?.email === 'admin@maternarsm.com.br') {
      res.json({
        data: {
          login: {
            token: 'mock-jwt-token-' + Date.now(),
            user: mockUser
          }
        }
      })
      return
    }
  }
  
  // Mock me query
  if (query.includes('me')) {
    res.json({
      data: {
        me: mockUser
      }
    })
    return
  }
  
  // Mock courses query
  if (query.includes('courses')) {
    res.json({
      data: {
        courses: [
          {
            id: '1',
            title: 'Introdução aos Cuidados Neonatais',
            description: 'Curso básico sobre cuidados com recém-nascidos',
            thumbnail: 'https://via.placeholder.com/300',
            category: 'Neonatologia',
            difficulty: 'BEGINNER',
            xpReward: 100,
            estimatedTime: 120,
            isActive: true,
            totalLessons: 5,
            totalEnrollments: 45,
            lessons: []
          },
          {
            id: '2',
            title: 'Amamentação e Nutrição Infantil',
            description: 'Tudo sobre aleitamento materno e nutrição nos primeiros anos',
            thumbnail: 'https://via.placeholder.com/300',
            category: 'Nutrição',
            difficulty: 'INTERMEDIATE',
            xpReward: 150,
            estimatedTime: 180,
            isActive: true,
            totalLessons: 8,
            totalEnrollments: 38,
            lessons: []
          }
        ]
      }
    })
    return
  }
  
  // Default response
  res.json({
    data: null,
    errors: [{
      message: 'Query not mocked'
    }]
  })
})

const PORT = 4000
app.listen(PORT, () => {
  console.log(`🎭 Mock Backend running on port ${PORT}`)
  console.log(`📍 GraphQL endpoint: http://localhost:${PORT}/graphql`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})