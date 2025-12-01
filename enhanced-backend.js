const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

// Dados mais realistas e completos
const mockData = {
  currentUser: {
    id: '1',
    email: 'laura@maternarsantamariense.com',
    firstName: 'Laura',
    lastName: 'Pellegrin',
    name: 'Laura Pellegrin',
    username: 'laurapellegrin',
    role: 'ADMIN',
    department: 'Enfermagem - UFN',
    position: 'Acadêmica de Enfermagem | Bolsista PROBIC',
    avatar: '/avatars/laura.jpg',
    totalXP: 5250,
    level: 10,
    weeklyXP: 450,
    currentStreak: 12,
    longestStreak: 45,
    isOnline: true,
    lastActive: new Date().toISOString(),
    createdAt: '2025-12-01T00:00:00Z',
    bio: 'Acadêmica do curso de Enfermagem da Universidade Franciscana (UFN), Santa Maria - RS. Bolsista PROBIC/UFN com projeto "Atenção Pré-Natal: Tecnologias indutoras de boas práticas obstétricas". Integrante do GESTAR e GEPESES/UFN. Vice-presidente do DAENF/UFN. Representante discente no colegiado do Curso de Enfermagem. Membro do COEST/RS - ABEn/RS. Interesse em pesquisa em Saúde Materno Infantil.',
    phone: '+55 (55) 99765-4321',
    location: 'Santa Maria, RS',
    completedCourses: 24,
    certificatesEarned: 18,
    teamMembers: 15
  },
  
  users: [
    {
      id: '2',
      email: 'maria.oliveira@maternarsantamariense.com',
      firstName: 'Maria',
      lastName: 'Oliveira',
      name: 'Maria Oliveira',
      username: 'mariaoliveira',
      role: 'USER',
      department: 'Enfermagem',
      position: 'Enfermeira Obstetra',
      avatar: '/avatars/maria.jpg',
      totalXP: 3200,
      level: 7,
      isOnline: true,
      location: 'Santa Maria, RS'
    },
    {
      id: '3',
      email: 'carolina.santos@maternarsantamariense.com',
      firstName: 'Carolina',
      lastName: 'Santos',
      name: 'Carolina Santos',
      username: 'carolinasantos',
      role: 'MANAGER',
      department: 'Medicina',
      position: 'Médica Pediatra',
      avatar: '/avatars/carolina.jpg',
      totalXP: 4100,
      level: 8,
      isOnline: false,
      location: 'Santa Maria, RS'
    },
    {
      id: '4',
      email: 'ana.rodrigues@maternarsantamariense.com',
      firstName: 'Ana',
      lastName: 'Rodrigues',
      name: 'Ana Rodrigues',
      username: 'anarodrigues',
      role: 'USER',
      department: 'Enfermagem',
      position: 'Técnica de Enfermagem',
      avatar: '/avatars/ana.jpg',
      totalXP: 2800,
      level: 6,
      isOnline: true,
      location: 'Santa Maria, RS'
    }
  ],
  
  courses: [
    {
      id: '1',
      title: 'Cuidados Neonatais Essenciais',
      description: 'Aprenda os fundamentos dos cuidados com recém-nascidos, incluindo avaliação inicial, cuidados com o coto umbilical e primeiros socorros.',
      thumbnail: '/courses/neonatal.jpg',
      category: 'Neonatologia',
      difficulty: 'BEGINNER',
      xpReward: 100,
      estimatedTime: 120,
      isActive: true,
      totalLessons: 8,
      totalEnrollments: 145,
      instructor: 'Dra. Carolina Santos',
      rating: 4.8,
      lessons: [
        { id: 'l1', title: 'Avaliação do Recém-Nascido', duration: 15, xpReward: 15 },
        { id: 'l2', title: 'Cuidados Básicos', duration: 20, xpReward: 20 },
        { id: 'l3', title: 'Amamentação na Primeira Hora', duration: 25, xpReward: 25 }
      ],
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Aleitamento Materno Exclusivo',
      description: 'Técnicas e orientações para apoio ao aleitamento materno exclusivo nos primeiros 6 meses de vida.',
      thumbnail: '/courses/aleitamento.jpg',
      category: 'Nutrição',
      difficulty: 'INTERMEDIATE',
      xpReward: 150,
      estimatedTime: 180,
      isActive: true,
      totalLessons: 10,
      totalEnrollments: 238,
      instructor: 'Fernanda Costa',
      rating: 4.9,
      lessons: [
        { id: 'l4', title: 'Importância do Aleitamento', duration: 20, xpReward: 20 },
        { id: 'l5', title: 'Técnicas de Amamentação', duration: 30, xpReward: 30 },
        { id: 'l6', title: 'Problemas Comuns e Soluções', duration: 25, xpReward: 25 }
      ],
      createdAt: '2025-10-15T00:00:00Z',
      updatedAt: '2025-11-20T00:00:00Z'
    },
    {
      id: '3',
      title: 'Emergências Obstétricas',
      description: 'Protocolo de atendimento para emergências obstétricas seguindo as diretrizes do Ministério da Saúde.',
      thumbnail: '/courses/emergencias.jpg',
      category: 'Obstetrícia',
      difficulty: 'ADVANCED',
      xpReward: 200,
      estimatedTime: 240,
      isActive: true,
      totalLessons: 12,
      totalEnrollments: 89,
      instructor: 'Laura Pellegrin',
      rating: 5.0,
      lessons: [],
      createdAt: '2025-09-01T00:00:00Z',
      updatedAt: '2025-11-25T00:00:00Z'
    },
    {
      id: '4',
      title: 'Humanização do Parto',
      description: 'Práticas de humanização no atendimento ao parto e nascimento.',
      thumbnail: '/courses/humanizacao.jpg',
      category: 'Obstetrícia',
      difficulty: 'INTERMEDIATE',
      xpReward: 120,
      estimatedTime: 150,
      isActive: true,
      totalLessons: 9,
      totalEnrollments: 156,
      instructor: 'Maria Oliveira',
      rating: 4.7,
      lessons: [],
      createdAt: '2025-10-20T00:00:00Z',
      updatedAt: '2025-11-28T00:00:00Z'
    }
  ],
  
  achievements: [
    {
      id: '1',
      title: 'Primeira Aula',
      description: 'Complete sua primeira aula',
      icon: '🎓',
      xpReward: 50,
      type: 'COURSE_COMPLETION',
      unlockedAt: '2025-12-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Semana de Dedicação',
      description: 'Mantenha uma sequência de 7 dias de estudo',
      icon: '🔥',
      xpReward: 100,
      type: 'LOGIN_STREAK',
      unlockedAt: '2025-12-07T00:00:00Z'
    },
    {
      id: '3',
      title: 'Especialista Neonatal',
      description: 'Complete todos os cursos de neonatologia',
      icon: '👶',
      xpReward: 300,
      type: 'COURSE_COMPLETION',
      unlockedAt: null
    },
    {
      id: '4',
      title: 'Mentora',
      description: 'Ajude 10 colegas em discussões',
      icon: '🤝',
      xpReward: 200,
      type: 'COMMUNITY_PARTICIPATION',
      unlockedAt: '2025-11-15T00:00:00Z'
    }
  ],
  
  recentActivity: [
    {
      type: 'course_completed',
      title: 'Laura completou o curso "Cuidados Neonatais Essenciais"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      xpEarned: 100
    },
    {
      type: 'achievement_unlocked',
      title: 'Maria desbloqueou a conquista "Semana de Dedicação"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      xpEarned: 100
    },
    {
      type: 'lesson_completed',
      title: 'Carolina completou "Técnicas de Amamentação"',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      xpEarned: 30
    },
    {
      type: 'project_updated',
      title: 'Ana atualizou o projeto "Protocolo de Atendimento"',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      xpEarned: 0
    }
  ],
  
  notifications: [
    {
      id: 'n1',
      type: 'info',
      title: 'Novo curso disponível',
      message: 'O curso "Emergências Obstétricas" está disponível!',
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'n2',
      type: 'success',
      title: 'Certificado disponível',
      message: 'Seu certificado de "Cuidados Neonatais" está pronto!',
      read: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'n3',
      type: 'reminder',
      title: 'Reunião de equipe',
      message: 'Reunião de enfermagem hoje às 14h',
      read: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  events: [
    {
      id: 'e1',
      title: 'Reunião de Equipe de Enfermagem',
      description: 'Discussão sobre novos protocolos de atendimento',
      startDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      type: 'MEETING',
      location: 'Sala de Reuniões - 3º andar',
      organizer: { name: 'Laura Pellegrin' },
      attendees: 12
    },
    {
      id: 'e2',
      title: 'Workshop: Humanização do Parto',
      description: 'Práticas e técnicas para humanização do atendimento',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
      type: 'TRAINING',
      location: 'Auditório Principal',
      organizer: { name: 'Maria Oliveira' },
      attendees: 45
    }
  ],
  
  projects: [
    {
      id: 'p1',
      name: 'Implementação Protocolo IHAC',
      description: 'Iniciativa Hospital Amigo da Criança - Implementação completa',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 75,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      members: 8,
      tasks: {
        total: 24,
        completed: 18
      },
      resources: [
        { type: 'GUIDE', title: 'Guia do Pré-Natal 2024', url: 'https://atencaoprimaria.rs.gov.br/upload/arquivos/202404/25124004-guia-do-pre-natal-2024.pdf' },
        { type: 'MANUAL', title: 'Cadernos de Atenção Básica - Pré-natal', url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf' }
      ]
    },
    {
      id: 'p2',
      name: 'Atualização Protocolos Neonatais',
      description: 'Revisão e atualização dos protocolos de atendimento neonatal',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 45,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      members: 5,
      tasks: {
        total: 15,
        completed: 7
      },
      resources: [
        { type: 'PROTOCOL', title: 'Protocolo Enfermagem Pré-natal Baixo Risco', url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c4/0000c48b.pdf' },
        { type: 'GUIDE', title: 'Protocolo COREN-RS Pré-natal', url: 'https://www.portalcoren-rs.gov.br/docs/ProtocolosEnfermagem/ProtocoloEnfermagemPreNatalRiscoHabitual.pdf' }
      ]
    },
    {
      id: 'p3',
      name: 'Programa de Aleitamento Materno',
      description: 'Promoção e apoio ao aleitamento materno exclusivo - Prefeitura de Santa Maria',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 60,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      members: 12,
      tasks: {
        total: 30,
        completed: 18
      },
      resources: [
        { type: 'GALLERY', title: 'Fotos Oficiais Prefeitura SM', url: 'https://www.flickr.com/photos/prefeituradesantamaria/52890420023/in/album-72177720307320784/' },
        { type: 'GUIDE', title: 'Saúde da Criança - Aleitamento Materno', url: 'https://bvsms.saude.gov.br/bvs/publicacoes/saude_crianca_aleitamento_materno_cab23.pdf' },
        { type: 'WEBSITE', title: 'Plataforma AMAMOS UFN', url: 'https://amamos.lapinf.ufn.edu.br/buscar/categoria' }
      ]
    },
    {
      id: 'p4',
      name: 'Curso Introdutório Santa Maria',
      description: 'Curso de capacitação para profissionais da rede municipal de saúde',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 85,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      members: 25,
      tasks: {
        total: 12,
        completed: 10
      },
      resources: [
        { type: 'COURSE', title: 'Curso Introdutório SM', url: 'https://sites.google.com/view/cursointrodutoriosm/in%C3%ADcio' },
        { type: 'GALLERY', title: 'Álbuns Oficiais', url: 'https://sites.google.com/view/cursointrodutoriosm/in%C3%ADcio' }
      ]
    },
    {
      id: 'p5',
      name: 'Saúde Bucal na Gestação',
      description: 'Programa de atenção à saúde bucal para gestantes',
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 25,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      members: 6,
      tasks: {
        total: 20,
        completed: 5
      },
      resources: [
        { type: 'CARTILHA', title: 'Saúde Bucal da Gestante', url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/cartilhas/2022/cartilha-a-saude-bucal-da-gestante.pdf' }
      ]
    },
    {
      id: 'p6',
      name: 'Aplicativos e Tecnologia na Saúde',
      description: 'Integração de ferramentas digitais no cuidado materno-infantil',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 70,
      dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      members: 10,
      tasks: {
        total: 28,
        completed: 20
      },
      resources: [
        { type: 'APP', title: 'App Fortalece Pré-natal', url: 'https://play.google.com/store/apps/details?id=io.kodular.miguelmachado0007.fortalece' },
        { type: 'WEBSITE', title: 'Apoiare Puerpério', url: 'https://www.apoiare.lapinf.ufn.edu.br/' },
        { type: 'APP', title: 'SOS Kids', url: 'https://play.google.com/store/apps/details?id=com.ufn.soskids&hl=pt_BR' }
      ]
    },
    {
      id: 'p7',
      name: 'Material Educativo Audiovisual',
      description: 'Produção de vídeos educativos para gestantes e puérperas',
      status: 'ACTIVE',
      priority: 'LOW',
      progress: 50,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      members: 4,
      tasks: {
        total: 16,
        completed: 8
      },
      resources: [
        { type: 'VIDEO', title: 'Hora Ouro: Semente de Esperança', url: 'https://youtube.com/watch?v=A9AfL3F1enc' },
        { type: 'VIDEO', title: 'O que fazer se o bebê engasgar?', url: 'https://www.youtube.com/watch?v=Mr48F49Uqso' },
        { type: 'VIDEO', title: 'O banho do bebê', url: 'https://www.youtube.com/watch?v=lm6wJiCXJPY' },
        { type: 'VIDEO', title: 'Parto Humanizado', url: 'https://www.youtube.com/watch?v=PzqnC0paEA8' }
      ]
    },
    {
      id: 'p8',
      name: 'Cartilhas e Orientações',
      description: 'Desenvolvimento de material educativo impresso e digital',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 90,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      members: 7,
      tasks: {
        total: 10,
        completed: 9
      },
      resources: [
        { type: 'CARTILHA', title: 'Orientações para o Período Puerperal', url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a53420f0-c96d-46e6-b42c-b62983720685.pdf' },
        { type: 'GUIDE', title: 'Coisas que você precisa saber antes do bebê nascer', url: 'https://pediatraluisapinheiro.com.br/' },
        { type: 'CARTILHA', title: 'Ecocardiograma Fetal na Gestação', url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c6/0000c608.pdf' },
        { type: 'GUIDE', title: 'Trilhando o Puerpério', url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a42d5374-983f-4131-b7f0-6d209cbcac6f.pdf' },
        { type: 'ALBUM', title: 'Álbum Alimentação Complementar', url: 'https://drive.google.com/drive/folders/1BDi76730bvskLibpQEWlJKk7VRIcIlKc' }
      ]
    }
  ]
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
      environment: 'development',
      version: '2.0.0'
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
                token: 'jwt-token-' + Date.now(),
                user: mockData.currentUser
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
              me: mockData.currentUser
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
        
        // MyCourses query
        if (query.includes('myCourses')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              myCourses: mockData.courses.slice(0, 2).map(course => ({
                id: 'enrollment-' + course.id,
                enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: null,
                progress: Math.floor(Math.random() * 100),
                course: course,
                user: mockData.currentUser
              }))
            }
          }));
          return;
        }
        
        // Achievements query
        if (query.includes('achievements') && !query.includes('myAchievements')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              achievements: mockData.achievements
            }
          }));
          return;
        }
        
        // MyAchievements query
        if (query.includes('myAchievements')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              myAchievements: mockData.achievements
                .filter(a => a.unlockedAt)
                .map(achievement => ({
                  id: 'user-achievement-' + achievement.id,
                  unlockedAt: achievement.unlockedAt,
                  achievement: achievement,
                  user: mockData.currentUser
                }))
            }
          }));
          return;
        }
        
        // Events query
        if (query.includes('events')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              events: mockData.events
            }
          }));
          return;
        }
        
        // Projects query
        if (query.includes('projects') || query.includes('myProjects')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              projects: mockData.projects,
              myProjects: mockData.projects
            }
          }));
          return;
        }
        
        // Channels query (chat)
        if (query.includes('channels')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            data: {
              channels: [
                {
                  id: '1',
                  name: 'geral',
                  description: 'Canal geral da equipe',
                  type: 'PUBLIC',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  messages: [],
                  members: []
                }
              ]
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
  console.log(`✨ Backend Melhorado rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`📍 Localização: Santa Maria, RS`);
  console.log(`👥 ${mockData.users.length + 1} usuários cadastrados`);
  console.log(`📚 ${mockData.courses.length} cursos disponíveis`);
});