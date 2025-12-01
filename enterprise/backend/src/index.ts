import express from 'express'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'

import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { typeDefs } from './graphql/typeDefs.js'
import { resolvers } from './graphql/resolvers.js'
import { createContext } from './graphql/context.js'
import { SocketService } from './services/socket.service.js'
import { authMiddleware } from './middleware/auth.middleware.js'
import { authService } from './services/auth.service.js'

// Initialize Prisma
const prisma = new PrismaClient()

class SMSEnterpriseServer {
  private app: express.Application
  private server: any
  private apolloServer: ApolloServer
  private socketService: SocketService
  private dbConnected: boolean = false

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.setupMiddleware()
  }

  private setupMiddleware() {
    // Trust proxy for rate limiting
    this.app.set('trust proxy', 1)
    
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }))
    
    // CORS - Permitir qualquer origem em desenvolvimento
    this.app.use(cors({
      origin: (origin, callback) => {
        // Em desenvolvimento, permitir qualquer origem
        if (config.NODE_ENV === 'development') {
          callback(null, true)
          return
        }
        // Em produção, verificar origem
        if (!origin || config.CORS_ORIGINS.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-app-env', 'x-app-version']
    }))
    
    // Compression
    this.app.use(compression())
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
    })
    this.app.use(limiter)
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    
    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
      next()
    })
  }

  private setupRoutes() {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Maternar Santa Mariense Backend',
        version: '2.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          api: '/api',
          graphql: '/graphql',
          auth: '/api/auth'
        },
        documentation: config.NODE_ENV === 'development' ? '/graphql' : null
      })
    })

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.NODE_ENV
      })
    })

    // API Info
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Maternar Santa Mariense Backend',
        version: '2.0.0',
        graphql: '/graphql',
        playground: config.NODE_ENV === 'development' ? '/graphql' : null
      })
    })

    // Auth routes
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const result = await authService.login(req.body)
        res.json(result)
      } catch (error: any) {
        logger.error('Login failed:', error)
        res.status(401).json({ error: error.message })
      }
    })

    this.app.post('/api/auth/register', async (req, res) => {
      try {
        const result = await authService.register(req.body)
        res.json(result)
      } catch (error: any) {
        logger.error('Registration failed:', error)
        res.status(400).json({ error: error.message })
      }
    })

    this.app.post('/api/auth/logout', authMiddleware, async (req: any, res) => {
      try {
        await authService.logout(req.user.userId)
        res.json({ success: true })
      } catch (error: any) {
        logger.error('Logout failed:', error)
        res.status(500).json({ error: error.message })
      }
    })

    this.app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
      try {
        const user = await authService.getUserById(req.user.userId)
        res.json(user)
      } catch (error: any) {
        logger.error('Get user failed:', error)
        res.status(404).json({ error: error.message })
      }
    })

    // 404 handler - não aplicar ao GraphQL
    this.app.use((req, res, next) => {
      if (req.path === '/graphql') {
        return next()
      }
      res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl
      })
    })
  }

  private async setupApollo() {
    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: createContext,
      introspection: config.NODE_ENV === 'development',
      formatError: (error) => {
        logger.error('GraphQL Error:', error)
        return error
      }
    })

    await this.apolloServer.start()
    this.apolloServer.applyMiddleware({ 
      app: this.app, 
      path: '/graphql',
      cors: false // Already handled by express cors
    })
  }

  private setupSocket() {
    this.socketService = new SocketService(this.server)
  }

  async start() {
    try {
      // Test database connection - must succeed
      await prisma.$connect()
      this.dbConnected = true
      logger.info('✅ Database connected successfully')

      // Setup Apollo Server
      await this.setupApollo()
      
      // Setup routes after Apollo
      this.setupRoutes()
      
      // Setup Socket.IO
      this.setupSocket()

      // Start server
      this.server.listen(config.PORT, () => {
        logger.info(`� Server running on port ${config.PORT}`)
        logger.info(`� GraphQL endpoint: http://localhost:${config.PORT}/graphql`)
        logger.info(`� WebSocket server ready`)
        logger.info(`� Environment: ${config.NODE_ENV}`)
      })

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  async stop() {
    try {
      await this.apolloServer.stop()
      await prisma.$disconnect()
      this.server.close()
      logger.info('Server stopped gracefully')
    } catch (error) {
      logger.error('Error stopping server:', error)
    }
  }

  getSocketService(): SocketService {
    return this.socketService
  }
}

// Start server
const server = new SMSEnterpriseServer()
server.start()

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await server.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await server.stop()
  process.exit(0)
})

export default server