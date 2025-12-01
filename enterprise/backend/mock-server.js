const http = require('http')

const mockUser = {
  id: '1',
  email: 'admin@maternarsm.com.br',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'Sistema',
  role: 'ADMIN'
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-env, x-app-version')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'mock'
    }))
    return
  }
  
  if (req.url === '/graphql' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk.toString())
    req.on('end', () => {
      try {
        const { query } = JSON.parse(body)
        
        // Mock login
        if (query.includes('login')) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            data: {
              login: {
                token: 'mock-jwt-token-' + Date.now(),
                user: mockUser
              }
            }
          }))
          return
        }
        
        // Mock me query
        if (query.includes('me')) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            data: {
              me: mockUser
            }
          }))
          return
        }
        
        // Default response
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          data: {},
          errors: []
        }))
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid request' }))
      }
    })
    return
  }
  
  res.writeHead(404)
  res.end('Not found')
})

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`)
})