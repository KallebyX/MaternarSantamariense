const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

// Mock data
const mockData = {
  user: {
    id: '1',
    email: 'laura@maternarsantamariense.com',
    firstName: 'Laura',
    lastName: 'Pellegrin',
    username: 'laurapellegrin',
    role: 'ADMIN',
    department: 'Enfermagem',
    position: 'Coordenadora de Enfermagem',
    avatar: '/avatars/laura.jpg',
    totalXP: 5000,
    level: 10,
    weeklyXP: 250,
    currentStreak: 7,
    longestStreak: 30,
    isOnline: true,
    lastActive: new Date().toISOString(),
    createdAt: '2025-12-01T00:00:00Z'
  },
  courses: [
    {
      id: '1',
      title: 'Cuidados Neonatais Essenciais',
      description: 'Aprenda os fundamentos dos cuidados com recém-nascidos',
      thumbnail: '/courses/neonatal.jpg',
      category: 'Neonatologia',
      difficulty: 'BEGINNER',
      xpReward: 100,
      estimatedTime: 120,
      isActive: true,
      totalLessons: 5,
      totalEnrollments: 45,
      lessons: [],
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Aleitamento Materno',
      description: 'Técnicas e orientações para apoio ao aleitamento',
      thumbnail: '/courses/aleitamento.jpg',
      category: 'Nutrição',
      difficulty: 'INTERMEDIATE',
      xpReward: 150,
      estimatedTime: 180,
      isActive: true,
      totalLessons: 8,
      totalEnrollments: 38,
      lessons: [],
      createdAt: '2025-11-15T00:00:00Z',
      updatedAt: '2025-11-15T00:00:00Z'
    }
  ],
  achievements: []
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-env, x-app-version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  console.log(`${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'development'
    }));
    return;
  }
  
  if (req.url === '/graphql' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { query, variables } = JSON.parse(body);
        
        // Login mutation
        if (query.includes('mutation') && query.includes('login')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              login: {
                token: 'mock-jwt-' + Date.now(),
                user: mockData.user
              }
            }
          }));
          return;
        }
        
        // Me query
        if (query.includes('me')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              me: {
                ...mockData.user,
                currentStreak: 7,
                longestStreak: 30,
                weeklyXP: 250
              }
            }
          }));
          return;
        }
        
        // Courses query
        if (query.includes('courses')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              courses: mockData.courses
            }
          }));
          return;
        }
        
        // Achievements query
        if (query.includes('achievements')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              achievements: []
            }
          }));
          return;
        }
        
        // Default response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: {},
          errors: []
        }));
      } catch (e) {
        console.error('Error:', e);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: null,
          errors: [{
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }]
        }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Backend Mock rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
});