import { PrismaClient } from '@prisma/client'
import { logger } from '../src/utils/logger.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedEnhanced() {
  try {
    logger.info('🚀 Starting enhanced database seeding...')

    // ============================================
    // 1. CRIAR USUÁRIOS DIVERSIFICADOS
    // ============================================
    const adminPassword = await bcrypt.hash('admin123', 12)
    const userPassword = await bcrypt.hash('user123', 12)

    const users = await Promise.all([
      // Admin Principal - Laura Pellegrin
      prisma.user.upsert({
        where: { email: 'admin@maternarsantamariense.com' },
        update: {},
        create: {
          email: 'admin@maternarsantamariense.com',
          username: 'laura.pellegrin',
          password: adminPassword,
          firstName: 'Laura',
          lastName: 'Pellegrin',
          role: 'ADMIN',
          department: 'Enfermagem',
          position: 'Acadêmica de Enfermagem | Bolsista PROBIC',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura&backgroundColor=b6e3f4',
          totalXP: 15000,
          level: 15,
          weeklyXP: 1200,
          currentStreak: 7,
          longestStreak: 30
        }
      }),

      // Gestores
      prisma.user.upsert({
        where: { email: 'maria.coordenadora@maternarsm.com.br' },
        update: {},
        create: {
          email: 'maria.coordenadora@maternarsm.com.br',
          username: 'maria.santos',
          password: userPassword,
          firstName: 'Maria',
          lastName: 'Santos',
          role: 'MANAGER',
          department: 'Obstetrícia',
          position: 'Médica Coordenadora',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          totalXP: 8500,
          level: 10,
          weeklyXP: 850
        }
      }),

      prisma.user.upsert({
        where: { email: 'carlos.gestor@maternarsm.com.br' },
        update: {},
        create: {
          email: 'carlos.gestor@maternarsm.com.br',
          username: 'carlos.lima',
          password: userPassword,
          firstName: 'Carlos',
          lastName: 'Lima',
          role: 'MANAGER',
          department: 'Enfermagem',
          position: 'Enfermeiro Supervisor',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
          totalXP: 7200,
          level: 9,
          weeklyXP: 640
        }
      }),

      // Profissionais de Saúde
      prisma.user.upsert({
        where: { email: 'ana.enfermeira@maternarsm.com.br' },
        update: {},
        create: {
          email: 'ana.enfermeira@maternarsm.com.br',
          username: 'ana.silva',
          password: userPassword,
          firstName: 'Ana',
          lastName: 'Silva',
          role: 'USER',
          department: 'Enfermagem',
          position: 'Enfermeira Obstetra',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
          totalXP: 4500,
          level: 6,
          weeklyXP: 480
        }
      }),

      prisma.user.upsert({
        where: { email: 'joao.pediatra@maternarsm.com.br' },
        update: {},
        create: {
          email: 'joao.pediatra@maternarsm.com.br',
          username: 'joao.costa',
          password: userPassword,
          firstName: 'João',
          lastName: 'Costa',
          role: 'USER',
          department: 'Pediatria',
          position: 'Médico Pediatra',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
          totalXP: 5200,
          level: 7,
          weeklyXP: 520
        }
      }),

      prisma.user.upsert({
        where: { email: 'patricia.psicologa@maternarsm.com.br' },
        update: {},
        create: {
          email: 'patricia.psicologa@maternarsm.com.br',
          username: 'patricia.alves',
          password: userPassword,
          firstName: 'Patricia',
          lastName: 'Alves',
          role: 'USER',
          department: 'Psicologia',
          position: 'Psicóloga Perinatal',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
          totalXP: 3800,
          level: 5,
          weeklyXP: 420
        }
      }),

      prisma.user.upsert({
        where: { email: 'roberto.assistente@maternarsm.com.br' },
        update: {},
        create: {
          email: 'roberto.assistente@maternarsm.com.br',
          username: 'roberto.souza',
          password: userPassword,
          firstName: 'Roberto',
          lastName: 'Souza',
          role: 'USER',
          department: 'Serviço Social',
          position: 'Assistente Social',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
          totalXP: 2900,
          level: 4,
          weeklyXP: 310
        }
      }),

      prisma.user.upsert({
        where: { email: 'fernanda.nutri@maternarsm.com.br' },
        update: {},
        create: {
          email: 'fernanda.nutri@maternarsm.com.br',
          username: 'fernanda.rocha',
          password: userPassword,
          firstName: 'Fernanda',
          lastName: 'Rocha',
          role: 'USER',
          department: 'Nutrição',
          position: 'Nutricionista',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda',
          totalXP: 3200,
          level: 5,
          weeklyXP: 390
        }
      })
    ])

    logger.info(`✅ Created ${users.length} users`)

    // ============================================
    // 2. CRIAR CURSOS DE SAÚDE MATERNO-INFANTIL
    // ============================================
    const coursesData = [
      {
        id: 'course-prenatal-care',
        title: 'Assistência ao Pré-Natal de Qualidade',
        description: 'Curso completo sobre protocolos e boas práticas no atendimento pré-natal, incluindo identificação de riscos, exames essenciais e acompanhamento integral da gestante.',
        category: 'Obstetrícia',
        difficulty: 'INTERMEDIATE',
        xpReward: 300,
        estimatedTime: '6 horas',
        thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800'
      },
      {
        id: 'course-patient-safety',
        title: 'Protocolos de Segurança do Paciente',
        description: 'Protocolos essenciais de segurança do paciente baseados nas diretrizes do Ministério da Saúde e OMS, com foco em identificação, medicação segura e prevenção de quedas.',
        category: 'Segurança',
        difficulty: 'BEGINNER',
        xpReward: 250,
        estimatedTime: '4 horas',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
      },
      {
        id: 'course-neonatal-reanimation',
        title: 'Reanimação Neonatal',
        description: 'Técnicas avançadas de reanimação neonatal conforme diretrizes da SBP (Sociedade Brasileira de Pediatria), incluindo manobras e uso de equipamentos.',
        category: 'Pediatria',
        difficulty: 'ADVANCED',
        xpReward: 400,
        estimatedTime: '8 horas',
        thumbnail: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800'
      },
      {
        id: 'course-breastfeeding',
        title: 'Aleitamento Materno e Banco de Leite',
        description: 'Práticas de promoção, proteção e apoio ao aleitamento materno, manejo de intercorrências e operação de banco de leite humano.',
        category: 'Enfermagem',
        difficulty: 'INTERMEDIATE',
        xpReward: 280,
        estimatedTime: '5 horas',
        thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800'
      },
      {
        id: 'course-infection-control',
        title: 'Controle de Infecção Hospitalar',
        description: 'Protocolos de controle e prevenção de IRAS (Infecções Relacionadas à Assistência à Saúde), higienização das mãos e uso adequado de EPI.',
        category: 'Controle de Infecção',
        difficulty: 'INTERMEDIATE',
        xpReward: 300,
        estimatedTime: '6 horas',
        thumbnail: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800'
      },
      {
        id: 'course-humanized-birth',
        title: 'Parto Humanizado e Boas Práticas',
        description: 'Evidências científicas e práticas recomendadas para assistência humanizada ao parto, incluindo métodos não farmacológicos de alívio da dor.',
        category: 'Obstetrícia',
        difficulty: 'INTERMEDIATE',
        xpReward: 320,
        estimatedTime: '7 horas',
        thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
      },
      {
        id: 'course-child-development',
        title: 'Desenvolvimento Infantil e Puericultura',
        description: 'Avaliação do desenvolvimento neuropsicomotor, marcos do desenvolvimento e orientações de puericultura na atenção básica.',
        category: 'Pediatria',
        difficulty: 'BEGINNER',
        xpReward: 250,
        estimatedTime: '5 horas',
        thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'
      },
      {
        id: 'course-perinatal-psychology',
        title: 'Psicologia Perinatal',
        description: 'Aspectos emocionais da gestação, parto e puerpério, identificação de depressão pós-parto e intervenções de apoio psicológico.',
        category: 'Psicologia',
        difficulty: 'INTERMEDIATE',
        xpReward: 290,
        estimatedTime: '6 horas',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800'
      },
      {
        id: 'course-maternal-nutrition',
        title: 'Nutrição na Gestação e Lactação',
        description: 'Necessidades nutricionais na gestação e lactação, orientações dietéticas e manejo de intercorrências nutricionais.',
        category: 'Nutrição',
        difficulty: 'BEGINNER',
        xpReward: 240,
        estimatedTime: '4 horas',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'
      },
      {
        id: 'course-high-risk-pregnancy',
        title: 'Gestação de Alto Risco',
        description: 'Identificação, manejo e acompanhamento de gestações de alto risco, incluindo hipertensão, diabetes gestacional e outras comorbidades.',
        category: 'Obstetrícia',
        difficulty: 'ADVANCED',
        xpReward: 380,
        estimatedTime: '9 horas',
        thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800'
      },
      {
        id: 'course-esus-ab',
        title: 'e-SUS APS: Prontuário Eletrônico',
        description: 'Treinamento completo no uso do e-SUS APS, registro de atendimentos, relatórios e integração com outros sistemas.',
        category: 'Tecnologia',
        difficulty: 'BEGINNER',
        xpReward: 200,
        estimatedTime: '3 horas',
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'
      },
      {
        id: 'course-social-vulnerabilities',
        title: 'Vulnerabilidades Sociais e Rede de Apoio',
        description: 'Identificação de vulnerabilidades sociais, construção de rede de apoio e encaminhamentos intersetoriais.',
        category: 'Serviço Social',
        difficulty: 'INTERMEDIATE',
        xpReward: 270,
        estimatedTime: '5 horas',
        thumbnail: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'
      }
    ]

    const courses = await Promise.all(
      coursesData.map(courseData =>
        prisma.course.upsert({
          where: { id: courseData.id },
          update: {},
          create: courseData
        })
      )
    )

    logger.info(`✅ Created ${courses.length} courses`)

    // ============================================
    // 3. CRIAR AULAS PARA OS CURSOS
    // ============================================
    const lessonsData = [
      // Aulas do curso de Pré-Natal
      { courseId: 'course-prenatal-care', title: 'Introdução ao Pré-Natal de Qualidade', content: 'Conceitos fundamentais e importância do acompanhamento pré-natal adequado.', order: 1, xpReward: 50 },
      { courseId: 'course-prenatal-care', title: 'Captação Precoce e Primeira Consulta', content: 'Estratégias de captação precoce e anamnese completa na primeira consulta.', order: 2, xpReward: 50 },
      { courseId: 'course-prenatal-care', title: 'Exames Laboratoriais Essenciais', content: 'Solicitação e interpretação de exames no pré-natal.', order: 3, xpReward: 50 },
      { courseId: 'course-prenatal-care', title: 'Classificação de Risco Gestacional', content: 'Critérios para identificação de gestação de baixo, médio e alto risco.', order: 4, xpReward: 50 },
      { courseId: 'course-prenatal-care', title: 'Imunização na Gestação', content: 'Calendário vacinal para gestantes e contraindicações.', order: 5, xpReward: 50 },
      { courseId: 'course-prenatal-care', title: 'Orientações Nutricionais e Ganho de Peso', content: 'Recomendações nutricionais e monitoramento do ganho de peso gestacional.', order: 6, xpReward: 50 },

      // Aulas do curso de Segurança do Paciente
      { courseId: 'course-patient-safety', title: 'Fundamentos da Segurança do Paciente', content: 'Cultura de segurança e erro humano nos serviços de saúde.', order: 1, xpReward: 40 },
      { courseId: 'course-patient-safety', title: 'Protocolo de Identificação do Paciente', content: 'Uso de pulseiras e confirmação de identidade.', order: 2, xpReward: 40 },
      { courseId: 'course-patient-safety', title: 'Higienização das Mãos', content: 'Técnica correta e 5 momentos da higienização das mãos.', order: 3, xpReward: 40 },
      { courseId: 'course-patient-safety', title: 'Segurança na Prescrição e Medicação', content: 'Prevenção de erros de medicação e regra dos 9 certos.', order: 4, xpReward: 40 },
      { courseId: 'course-patient-safety', title: 'Prevenção de Quedas', content: 'Avaliação de risco e medidas preventivas de quedas.', order: 5, xpReward: 40 },

      // Aulas do curso de Reanimação Neonatal
      { courseId: 'course-neonatal-reanimation', title: 'Preparação para o Nascimento', content: 'Equipamentos, equipe e antecipação de reanimação.', order: 1, xpReward: 60 },
      { courseId: 'course-neonatal-reanimation', title: 'Avaliação Inicial do RN', content: 'Avaliação imediata: respiração, tônus e frequência cardíaca.', order: 2, xpReward: 60 },
      { courseId: 'course-neonatal-reanimation', title: 'Ventilação com Pressão Positiva', content: 'Técnica de VPP com balão e máscara.', order: 3, xpReward: 60 },
      { courseId: 'course-neonatal-reanimation', title: 'Massagem Cardíaca', content: 'Indicações e técnica de massagem cardíaca no RN.', order: 4, xpReward: 60 },
      { courseId: 'course-neonatal-reanimation', title: 'Intubação Traqueal', content: 'Técnica de intubação orotraqueal neonatal.', order: 5, xpReward: 60 },

      // Aulas do curso de Aleitamento Materno
      { courseId: 'course-breastfeeding', title: 'Fisiologia da Lactação', content: 'Produção e ejeção do leite materno.', order: 1, xpReward: 45 },
      { courseId: 'course-breastfeeding', title: 'Técnica de Amamentação', content: 'Pega correta e posicionamento adequado.', order: 2, xpReward: 45 },
      { courseId: 'course-breastfeeding', title: 'Ordenha e Armazenamento do Leite', content: 'Técnicas de ordenha manual e armazenamento seguro.', order: 3, xpReward: 45 },
      { courseId: 'course-breastfeeding', title: 'Intercorrências Mamárias', content: 'Manejo de fissuras, ingurgitamento e mastite.', order: 4, xpReward: 45 },
      { courseId: 'course-breastfeeding', title: 'Banco de Leite Humano', content: 'Organização e funcionamento do banco de leite.', order: 5, xpReward: 45 }
    ]

    await prisma.lesson.createMany({
      data: lessonsData,
      skipDuplicates: true
    })

    logger.info(`✅ Created ${lessonsData.length} lessons`)

    // ============================================
    // 4. CRIAR MATRÍCULAS E PROGRESSO
    // ============================================
    const enrollmentsData = [
      // Ana está fazendo vários cursos
      { userId: users[3].id, courseId: 'course-prenatal-care', progress: 67, enrolledAt: new Date('2025-01-01') },
      { userId: users[3].id, courseId: 'course-breastfeeding', progress: 100, completedAt: new Date('2025-01-10') },
      { userId: users[3].id, courseId: 'course-patient-safety', progress: 40 },

      // João focado em pediatria
      { userId: users[4].id, courseId: 'course-neonatal-reanimation', progress: 80 },
      { userId: users[4].id, courseId: 'course-child-development', progress: 100, completedAt: new Date('2025-01-15') },
      { userId: users[4].id, courseId: 'course-patient-safety', progress: 100, completedAt: new Date('2025-01-05') },

      // Patricia com foco em psicologia
      { userId: users[5].id, courseId: 'course-perinatal-psychology', progress: 85 },
      { userId: users[5].id, courseId: 'course-humanized-birth', progress: 60 },

      // Roberto assistente social
      { userId: users[6].id, courseId: 'course-social-vulnerabilities', progress: 75 },
      { userId: users[6].id, courseId: 'course-esus-ab', progress: 100, completedAt: new Date('2025-01-20') },

      // Fernanda nutricionista
      { userId: users[7].id, courseId: 'course-maternal-nutrition', progress: 100, completedAt: new Date('2025-01-12') },
      { userId: users[7].id, courseId: 'course-prenatal-care', progress: 50 },

      // Maria coordenadora
      { userId: users[1].id, courseId: 'course-high-risk-pregnancy', progress: 90 },
      { userId: users[1].id, courseId: 'course-humanized-birth', progress: 100, completedAt: new Date('2025-01-08') },

      // Carlos supervisor
      { userId: users[2].id, courseId: 'course-infection-control', progress: 100, completedAt: new Date('2025-01-18') },
      { userId: users[2].id, courseId: 'course-patient-safety', progress: 100, completedAt: new Date('2025-01-10') }
    ]

    await Promise.all(
      enrollmentsData.map(enrollment =>
        prisma.courseEnrollment.upsert({
          where: {
            userId_courseId: {
              userId: enrollment.userId,
              courseId: enrollment.courseId
            }
          },
          update: {},
          create: enrollment
        })
      )
    )

    logger.info(`✅ Created ${enrollmentsData.length} course enrollments`)

    // ============================================
    // 5. CRIAR CONQUISTAS (ACHIEVEMENTS)
    // ============================================
    const achievementsData = [
      {
        id: 'achievement-first-course',
        title: 'Primeiro Curso Completo',
        description: 'Parabéns! Você completou seu primeiro curso de treinamento.',
        icon: '🎓',
        xpReward: 100,
        type: 'COURSE_COMPLETION',
        condition: JSON.stringify({ type: 'course_completion', count: 1 })
      },
      {
        id: 'achievement-five-courses',
        title: 'Estudante Dedicado',
        description: 'Complete 5 cursos de treinamento.',
        icon: '📚',
        xpReward: 500,
        type: 'COURSE_COMPLETION',
        condition: JSON.stringify({ type: 'course_completion', count: 5 })
      },
      {
        id: 'achievement-ten-courses',
        title: 'Expert em Saúde',
        description: 'Complete 10 cursos de treinamento.',
        icon: '🏆',
        xpReward: 1000,
        type: 'COURSE_COMPLETION',
        condition: JSON.stringify({ type: 'course_completion', count: 10 })
      },
      {
        id: 'achievement-1000-xp',
        title: 'Milestone 1.000 XP',
        description: 'Alcance 1.000 pontos de experiência.',
        icon: '⭐',
        xpReward: 100,
        type: 'XP_MILESTONE',
        condition: JSON.stringify({ type: 'xp_milestone', amount: 1000 })
      },
      {
        id: 'achievement-5000-xp',
        title: 'Milestone 5.000 XP',
        description: 'Alcance 5.000 pontos de experiência.',
        icon: '🌟',
        xpReward: 500,
        type: 'XP_MILESTONE',
        condition: JSON.stringify({ type: 'xp_milestone', amount: 5000 })
      },
      {
        id: 'achievement-7-day-streak',
        title: 'Sequência de 7 Dias',
        description: 'Acesse o sistema por 7 dias consecutivos.',
        icon: '🔥',
        xpReward: 200,
        type: 'LOGIN_STREAK',
        condition: JSON.stringify({ type: 'login_streak', days: 7 })
      },
      {
        id: 'achievement-30-day-streak',
        title: 'Compromisso Total',
        description: 'Acesse o sistema por 30 dias consecutivos.',
        icon: '💪',
        xpReward: 1000,
        type: 'LOGIN_STREAK',
        condition: JSON.stringify({ type: 'login_streak', days: 30 })
      },
      {
        id: 'achievement-community-helper',
        title: 'Ajudante da Comunidade',
        description: 'Envie 50 mensagens no chat colaborativo.',
        icon: '🤝',
        xpReward: 300,
        type: 'COMMUNITY_PARTICIPATION',
        condition: JSON.stringify({ type: 'messages_sent', count: 50 })
      },
      {
        id: 'achievement-safety-specialist',
        title: 'Especialista em Segurança',
        description: 'Complete todos os cursos de segurança do paciente.',
        icon: '🛡️',
        xpReward: 400,
        type: 'COURSE_COMPLETION',
        condition: JSON.stringify({ type: 'category_completion', category: 'Segurança' })
      },
      {
        id: 'achievement-obstetrics-master',
        title: 'Mestre em Obstetrícia',
        description: 'Complete todos os cursos de obstetrícia.',
        icon: '👶',
        xpReward: 600,
        type: 'COURSE_COMPLETION',
        condition: JSON.stringify({ type: 'category_completion', category: 'Obstetrícia' })
      }
    ]

    await Promise.all(
      achievementsData.map(achievement =>
        prisma.achievement.upsert({
          where: { id: achievement.id },
          update: {},
          create: achievement
        })
      )
    )

    logger.info(`✅ Created ${achievementsData.length} achievements`)

    // Conceder algumas conquistas aos usuários
    const userAchievementsData = [
      { userId: users[3].id, achievementId: 'achievement-first-course' },
      { userId: users[3].id, achievementId: 'achievement-1000-xp' },
      { userId: users[4].id, achievementId: 'achievement-first-course' },
      { userId: users[4].id, achievementId: 'achievement-5000-xp' },
      { userId: users[4].id, achievementId: 'achievement-7-day-streak' },
      { userId: users[1].id, achievementId: 'achievement-first-course' },
      { userId: users[1].id, achievementId: 'achievement-five-courses' },
      { userId: users[2].id, achievementId: 'achievement-safety-specialist' }
    ]

    await Promise.all(
      userAchievementsData.map(ua =>
        prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: ua.userId,
              achievementId: ua.achievementId
            }
          },
          update: {},
          create: ua
        })
      )
    )

    logger.info(`✅ Granted ${userAchievementsData.length} user achievements`)

    // ============================================
    // 6. CRIAR CANAIS DE CHAT
    // ============================================
    const channelsData = [
      {
        id: 'channel-geral',
        name: 'Geral',
        description: 'Canal geral para discussões da equipe',
        type: 'PUBLIC'
      },
      {
        id: 'channel-obstetrics',
        name: 'Equipe de Obstetrícia',
        description: 'Canal exclusivo da equipe de obstetrícia',
        type: 'PRIVATE'
      },
      {
        id: 'channel-pediatrics',
        name: 'Equipe de Pediatria',
        description: 'Canal exclusivo da equipe de pediatria',
        type: 'PRIVATE'
      },
      {
        id: 'channel-nursing',
        name: 'Enfermagem',
        description: 'Canal da equipe de enfermagem',
        type: 'PRIVATE'
      },
      {
        id: 'channel-emergencia',
        name: 'Emergência',
        description: 'Canal para comunicações urgentes',
        type: 'PUBLIC'
      },
      {
        id: 'channel-avisos',
        name: 'Avisos',
        description: 'Canal oficial de avisos da gestão',
        type: 'PUBLIC'
      }
    ]

    const channels = await Promise.all(
      channelsData.map(channel =>
        prisma.channel.upsert({
          where: { id: channel.id },
          update: {},
          create: channel
        })
      )
    )

    logger.info(`✅ Created ${channels.length} channels`)

    // Adicionar membros aos canais
    const channelMembersData = [
      // Canal Geral - todos
      ...users.map(user => ({ userId: user.id, channelId: 'channel-geral', role: user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER' })),

      // Canal Emergência - todos
      ...users.map(user => ({ userId: user.id, channelId: 'channel-emergencia', role: user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER' })),

      // Canal Avisos - todos
      ...users.map(user => ({ userId: user.id, channelId: 'channel-avisos', role: user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER' })),

      // Canal Obstetrícia
      { userId: users[0].id, channelId: 'channel-obstetrics', role: 'ADMIN' },
      { userId: users[1].id, channelId: 'channel-obstetrics', role: 'MODERATOR' },
      { userId: users[3].id, channelId: 'channel-obstetrics', role: 'MEMBER' },

      // Canal Pediatria
      { userId: users[0].id, channelId: 'channel-pediatrics', role: 'ADMIN' },
      { userId: users[4].id, channelId: 'channel-pediatrics', role: 'MODERATOR' },

      // Canal Enfermagem
      { userId: users[0].id, channelId: 'channel-nursing', role: 'ADMIN' },
      { userId: users[2].id, channelId: 'channel-nursing', role: 'MODERATOR' },
      { userId: users[3].id, channelId: 'channel-nursing', role: 'MEMBER' }
    ]

    await Promise.all(
      channelMembersData.map((cm, index) =>
        prisma.channelMember.upsert({
          where: {
            userId_channelId: {
              userId: cm.userId,
              channelId: cm.channelId
            }
          },
          update: {},
          create: cm
        }).catch(err => {
          logger.warn(`Skipping duplicate channel member ${index}`)
        })
      )
    )

    logger.info(`✅ Created channel memberships`)

    // Criar mensagens de exemplo
    const now = new Date()
    const messagesData = [
      {
        content: 'Bom dia, equipe! Vamos ter uma ótima semana de trabalho! 🌟',
        senderId: users[1].id,
        channelId: 'channel-geral',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        content: 'Bom dia, Maria! Com certeza! 💪',
        senderId: users[3].id,
        channelId: 'channel-geral',
        createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000)
      },
      {
        content: 'Pessoal, lembrem-se de atualizar os prontuários no e-SUS após cada atendimento.',
        senderId: users[0].id,
        channelId: 'channel-avisos',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        content: 'Atenção: Temos uma capacitação sobre reanimação neonatal na próxima quarta-feira às 14h.',
        senderId: users[2].id,
        channelId: 'channel-avisos',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000)
      },
      {
        content: 'Alguém pode me ajudar com um caso de gestação gemelar? Preciso discutir o plano de cuidados.',
        senderId: users[3].id,
        channelId: 'channel-obstetrics',
        createdAt: new Date(now.getTime() - 20 * 60 * 1000)
      },
      {
        content: 'Claro, Ana! Podemos conversar após o almoço. Tenho experiência com gemelaridade.',
        senderId: users[1].id,
        channelId: 'channel-obstetrics',
        createdAt: new Date(now.getTime() - 15 * 60 * 1000)
      }
    ]

    await prisma.message.createMany({
      data: messagesData,
      skipDuplicates: true
    })

    logger.info(`✅ Created ${messagesData.length} messages`)

    // ============================================
    // 7. CRIAR EVENTOS DO CALENDÁRIO
    // ============================================
    const today = new Date()
    const eventsData = [
      {
        id: 'event-team-meeting',
        title: 'Reunião de Equipe Mensal',
        description: 'Reunião mensal para discutir indicadores e planejar ações.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
        type: 'MEETING',
        location: 'Sala de Reuniões Principal',
        organizerId: users[1].id
      },
      {
        id: 'event-neonatal-training',
        title: 'Capacitação: Reanimação Neonatal',
        description: 'Treinamento prático de reanimação neonatal para toda a equipe.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 14, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18, 0),
        type: 'TRAINING',
        location: 'Centro de Simulação',
        organizerId: users[0].id
      },
      {
        id: 'event-deadline-reports',
        title: 'Prazo: Relatórios Mensais',
        description: 'Data limite para entrega dos relatórios mensais de atendimento.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 23, 59),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 23, 59),
        type: 'DEADLINE',
        organizerId: users[0].id
      },
      {
        id: 'event-breastfeeding-week',
        title: 'Semana Mundial de Aleitamento Materno',
        description: 'Atividades e palestras sobre aleitamento materno.',
        startDate: new Date(today.getFullYear(), 7, 1, 8, 0), // 1º de agosto
        endDate: new Date(today.getFullYear(), 7, 7, 18, 0), // 7 de agosto
        type: 'OTHER',
        location: 'Auditório Principal',
        organizerId: users[1].id,
        isAllDay: true
      },
      {
        id: 'event-labor-day',
        title: 'Dia do Trabalho',
        description: 'Feriado nacional.',
        startDate: new Date(today.getFullYear(), 4, 1, 0, 0), // 1º de maio
        endDate: new Date(today.getFullYear(), 4, 1, 23, 59),
        type: 'HOLIDAY',
        organizerId: users[0].id,
        isAllDay: true
      },
      {
        id: 'event-case-discussion',
        title: 'Discussão de Casos Clínicos',
        description: 'Reunião semanal para discussão de casos complexos.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 12, 0),
        type: 'MEETING',
        location: 'Sala de Estudos',
        organizerId: users[4].id
      },
      {
        id: 'event-infection-control',
        title: 'Auditoria de Controle de Infecção',
        description: 'Auditoria mensal dos protocolos de controle de infecção.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 9, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 12, 0),
        type: 'OTHER',
        location: 'Todas as Unidades',
        organizerId: users[2].id
      },
      {
        id: 'event-psychology-workshop',
        title: 'Workshop: Saúde Mental da Equipe',
        description: 'Workshop sobre autocuidado e saúde mental dos profissionais.',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12, 15, 0),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12, 17, 0),
        type: 'TRAINING',
        location: 'Auditório',
        organizerId: users[5].id
      }
    ]

    await Promise.all(
      eventsData.map(event =>
        prisma.event.upsert({
          where: { id: event.id },
          update: {},
          create: event
        })
      )
    )

    logger.info(`✅ Created ${eventsData.length} events`)

    // ============================================
    // 8. CRIAR PROJETOS
    // ============================================
    const projectsData = [
      {
        id: 'project-sepsis-protocol',
        name: 'Implementação do Protocolo de Sepse',
        description: 'Projeto para implementar o novo protocolo de identificação e tratamento de sepse neonatal e puerperal, seguindo diretrizes do ILAS.',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 30)
      },
      {
        id: 'project-humanized-birth',
        name: 'Programa de Parto Humanizado',
        description: 'Implementação de práticas baseadas em evidências para assistência humanizada ao parto, incluindo métodos não farmacológicos de alívio da dor.',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 3, 30)
      },
      {
        id: 'project-esus-integration',
        name: 'Integração MV e e-SUS APS',
        description: 'Projeto de integração entre os sistemas MV e e-SUS APS para eliminar dupla digitação e melhorar qualidade dos dados.',
        status: 'PLANNING',
        priority: 'URGENT',
        startDate: new Date(today.getFullYear(), today.getMonth(), 15),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 2, 15)
      },
      {
        id: 'project-breastfeeding-promotion',
        name: 'Promoção do Aleitamento Materno',
        description: 'Campanha de promoção e apoio ao aleitamento materno exclusivo até 6 meses.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() + 4, 30)
      },
      {
        id: 'project-training-platform',
        name: 'Plataforma de Educação Permanente',
        description: 'Desenvolvimento e implementação da plataforma digital de educação permanente para profissionais.',
        status: 'COMPLETED',
        priority: 'HIGH',
        startDate: new Date(today.getFullYear(), today.getMonth() - 6, 1),
        dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 30)
      }
    ]

    const projects = await Promise.all(
      projectsData.map(project =>
        prisma.project.upsert({
          where: { id: project.id },
          update: {},
          create: project
        })
      )
    )

    logger.info(`✅ Created ${projects.length} projects`)

    // Adicionar membros aos projetos
    const projectMembersData = [
      // Projeto Sepse
      { userId: users[1].id, projectId: 'project-sepsis-protocol', role: 'OWNER' },
      { userId: users[0].id, projectId: 'project-sepsis-protocol', role: 'ADMIN' },
      { userId: users[3].id, projectId: 'project-sepsis-protocol', role: 'MEMBER' },
      { userId: users[4].id, projectId: 'project-sepsis-protocol', role: 'MEMBER' },

      // Projeto Parto Humanizado
      { userId: users[1].id, projectId: 'project-humanized-birth', role: 'OWNER' },
      { userId: users[3].id, projectId: 'project-humanized-birth', role: 'ADMIN' },
      { userId: users[5].id, projectId: 'project-humanized-birth', role: 'MEMBER' },

      // Projeto Integração
      { userId: users[0].id, projectId: 'project-esus-integration', role: 'OWNER' },
      { userId: users[2].id, projectId: 'project-esus-integration', role: 'ADMIN' },

      // Projeto Aleitamento
      { userId: users[3].id, projectId: 'project-breastfeeding-promotion', role: 'OWNER' },
      { userId: users[7].id, projectId: 'project-breastfeeding-promotion', role: 'MEMBER' },

      // Projeto Plataforma (concluído)
      { userId: users[0].id, projectId: 'project-training-platform', role: 'OWNER' }
    ]

    await Promise.all(
      projectMembersData.map(pm =>
        prisma.projectMember.upsert({
          where: {
            userId_projectId: {
              userId: pm.userId,
              projectId: pm.projectId
            }
          },
          update: {},
          create: pm
        })
      )
    )

    logger.info(`✅ Created project memberships`)

    // ============================================
    // 9. CRIAR TAREFAS DOS PROJETOS
    // ============================================
    const tasksData = [
      // Tarefas do Projeto Sepse
      {
        id: 'task-sepsis-literature',
        title: 'Revisar literatura sobre sepse',
        description: 'Levantamento bibliográfico sobre protocolos de sepse neonatal e puerperal.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        assigneeId: users[3].id,
        projectId: 'project-sepsis-protocol'
      },
      {
        id: 'task-sepsis-criteria',
        title: 'Definir critérios de diagnóstico',
        description: 'Estabelecer critérios claros para diagnóstico de sepse baseados no ILAS.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth() - 1, 25),
        assigneeId: users[1].id,
        projectId: 'project-sepsis-protocol'
      },
      {
        id: 'task-sepsis-flowchart',
        title: 'Criar fluxograma de atendimento',
        description: 'Desenvolver fluxograma claro para identificação e manejo de sepse.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        assigneeId: users[4].id,
        projectId: 'project-sepsis-protocol'
      },
      {
        id: 'task-sepsis-training',
        title: 'Treinar equipe médica e enfermagem',
        description: 'Conduzir treinamento de toda a equipe sobre o novo protocolo.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20),
        assigneeId: users[2].id,
        projectId: 'project-sepsis-protocol'
      },
      {
        id: 'task-sepsis-monitoring',
        title: 'Implementar sistema de monitoramento',
        description: 'Criar indicadores e painéis para monitoramento do protocolo.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        assigneeId: users[0].id,
        projectId: 'project-sepsis-protocol'
      },

      // Tarefas do Projeto Parto Humanizado
      {
        id: 'task-birth-protocols',
        title: 'Atualizar protocolos de assistência ao parto',
        description: 'Revisar e atualizar protocolos baseados em evidências científicas.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        assigneeId: users[1].id,
        projectId: 'project-humanized-birth'
      },
      {
        id: 'task-birth-environment',
        title: 'Adequar ambiente do pré-parto',
        description: 'Adaptar salas de pré-parto para ambiente mais acolhedor.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        assigneeId: users[0].id,
        projectId: 'project-humanized-birth'
      },
      {
        id: 'task-birth-companion',
        title: 'Implementar presença do acompanhante',
        description: 'Garantir presença de acompanhante em todas as fases do parto.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
        assigneeId: users[3].id,
        projectId: 'project-humanized-birth'
      },
      {
        id: 'task-birth-psychology',
        title: 'Criar protocolo de apoio psicológico',
        description: 'Desenvolver protocolo de suporte emocional durante o trabalho de parto.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8),
        assigneeId: users[5].id,
        projectId: 'project-humanized-birth'
      },

      // Tarefas do Projeto Integração
      {
        id: 'task-integration-requirements',
        title: 'Levantar requisitos de integração',
        description: 'Mapear campos e fluxos de dados entre MV e e-SUS APS.',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        assigneeId: users[0].id,
        projectId: 'project-esus-integration'
      },
      {
        id: 'task-integration-api',
        title: 'Desenvolver API de integração',
        description: 'Criar API REST para sincronização de dados entre sistemas.',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        assigneeId: users[0].id,
        projectId: 'project-esus-integration'
      },
      {
        id: 'task-integration-testing',
        title: 'Realizar testes de integração',
        description: 'Executar bateria de testes para validar sincronização.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        assigneeId: users[0].id,
        projectId: 'project-esus-integration'
      },

      // Tarefas do Projeto Aleitamento
      {
        id: 'task-breastfeeding-materials',
        title: 'Desenvolver materiais educativos',
        description: 'Criar cartilhas e vídeos sobre aleitamento materno.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
        assigneeId: users[3].id,
        projectId: 'project-breastfeeding-promotion'
      },
      {
        id: 'task-breastfeeding-groups',
        title: 'Organizar grupos de apoio',
        description: 'Criar grupos de apoio para gestantes e puérperas.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        assigneeId: users[7].id,
        projectId: 'project-breastfeeding-promotion'
      },
      {
        id: 'task-breastfeeding-indicators',
        title: 'Monitorar indicadores de amamentação',
        description: 'Acompanhar taxa de aleitamento materno exclusivo até 6 meses.',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        dueDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
        assigneeId: users[3].id,
        projectId: 'project-breastfeeding-promotion'
      }
    ]

    await Promise.all(
      tasksData.map(task =>
        prisma.task.upsert({
          where: { id: task.id },
          update: {},
          create: task
        })
      )
    )

    logger.info(`✅ Created ${tasksData.length} tasks`)

    // ============================================
    // 10. CRIAR POLÍTICAS E DOCUMENTOS
    // ============================================
    const policiesData = [
      {
        id: 'policy-data-security',
        title: 'Política de Segurança da Informação',
        content: `# Política de Segurança da Informação em Saúde

## 1. Objetivo
Esta política estabelece diretrizes para proteção de dados de saúde conforme LGPD (Lei Geral de Proteção de Dados).

## 2. Abrangência
Aplica-se a todos os profissionais que acessam informações de pacientes.

## 3. Diretrizes
- Senhas devem ser complexas e trocadas a cada 90 dias
- Proibido compartilhar credenciais de acesso
- Logs de acesso são auditados mensalmente
- Dados de pacientes são criptografados em repouso e em trânsito

## 4. Penalidades
Violações podem resultar em advertência, suspensão ou demissão.`,
        version: '2.0',
        category: 'Segurança',
        requiresAcknowledgment: true
      },
      {
        id: 'policy-hand-hygiene',
        title: 'Protocolo de Higienização das Mãos',
        content: `# Protocolo de Higienização das Mãos

## Baseado em: ANVISA e OMS

## 5 Momentos da Higienização
1. Antes de contato com o paciente
2. Antes de procedimento limpo/asséptico
3. Após risco de exposição a fluidos corporais
4. Após contato com o paciente
5. Após contato com áreas próximas ao paciente

## Técnica Correta
- Duração: 40-60 segundos (água e sabão) ou 20-30 segundos (álcool gel)
- Cobrir todas as superfícies das mãos
- Incluir espaços interdigitais, polegares e punhos`,
        version: '3.1',
        category: 'Controle de Infecção',
        requiresAcknowledgment: true
      },
      {
        id: 'policy-prenatal-care',
        title: 'Protocolo de Assistência Pré-Natal',
        content: `# Protocolo de Assistência Pré-Natal

## Baseado em: Ministério da Saúde - Cadernos de Atenção Básica

## Calendário Mínimo
- Iniciar no 1º trimestre
- Mínimo 6 consultas (idealmente mensais até 28 semanas)
- Após 28 semanas: quinzenais
- Após 36 semanas: semanais

## Primeira Consulta
- Anamnese completa
- Exame físico geral e obstétrico
- Solicitação de exames laboratoriais
- Classificação de risco
- Calendário vacinal

## Exames Obrigatórios
- Hemograma, tipagem sanguínea, glicemia
- Sorologias: HIV, sífilis, toxoplasmose, hepatites
- Urina tipo I e urocultura
- Ultrassonografia obstétrica`,
        version: '1.5',
        category: 'Protocolos Clínicos',
        requiresAcknowledgment: false
      },
      {
        id: 'policy-code-ethics',
        title: 'Código de Ética e Conduta',
        content: `# Código de Ética e Conduta Profissional

## Princípios Fundamentais
- Respeito à dignidade humana
- Sigilo profissional
- Atendimento sem discriminação
- Atualização constante

## Relação com Pacientes
- Tratamento respeitoso e humanizado
- Comunicação clara e acessível
- Privacidade e confidencialidade garantidas
- Consentimento informado obrigatório

## Relação entre Profissionais
- Trabalho em equipe
- Respeito mútuo
- Comunicação efetiva
- Colaboração interdisciplinar`,
        version: '1.0',
        category: 'Ética',
        requiresAcknowledgment: true
      },
      {
        id: 'policy-adverse-events',
        title: 'Notificação de Eventos Adversos',
        content: `# Protocolo de Notificação de Eventos Adversos

## O que são Eventos Adversos?
Incidentes não intencionais que causam dano ao paciente.

## Cultura de Segurança
- Notificação é educativa, não punitiva
- Foco em melhorias sistêmicas
- Confidencialidade do notificador

## Como Notificar
1. Preencher formulário de notificação
2. Descrever objetivamente o ocorrido
3. Enviar ao Núcleo de Segurança do Paciente
4. Aguardar análise e feedback

## Prazos
- Eventos graves: notificação imediata
- Demais eventos: até 48 horas`,
        version: '2.2',
        category: 'Segurança',
        requiresAcknowledgment: true
      },
      {
        id: 'policy-waste-management',
        title: 'Gerenciamento de Resíduos de Saúde',
        content: `# Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS)

## Classificação dos Resíduos

### Grupo A (Biológico)
- Culturas, bolsas de sangue, tecidos
- Descarte em saco branco leitoso

### Grupo B (Químico)
- Medicamentos, reagentes
- Descarte conforme tipo de substância

### Grupo D (Comum)
- Resíduos administrativos
- Descarte em saco preto

### Grupo E (Perfurocortante)
- Agulhas, lâminas, escalpes
- Descarte em caixa rígida específica`,
        version: '1.3',
        category: 'Meio Ambiente',
        requiresAcknowledgment: false
      }
    ]

    await Promise.all(
      policiesData.map(policy =>
        prisma.policy.upsert({
          where: { id: policy.id },
          update: {},
          create: policy
        })
      )
    )

    logger.info(`✅ Created ${policiesData.length} policies`)

    // Registrar leitura de algumas políticas
    const policyReadsData = [
      { userId: users[0].id, policyId: 'policy-data-security', acknowledged: true },
      { userId: users[1].id, policyId: 'policy-data-security', acknowledged: true },
      { userId: users[2].id, policyId: 'policy-data-security', acknowledged: true },
      { userId: users[3].id, policyId: 'policy-hand-hygiene', acknowledged: true },
      { userId: users[3].id, policyId: 'policy-prenatal-care', acknowledged: false },
      { userId: users[4].id, policyId: 'policy-hand-hygiene', acknowledged: true },
      { userId: users[4].id, policyId: 'policy-adverse-events', acknowledged: true }
    ]

    await Promise.all(
      policyReadsData.map(pr =>
        prisma.policyRead.upsert({
          where: {
            userId_policyId: {
              userId: pr.userId,
              policyId: pr.policyId
            }
          },
          update: {},
          create: pr
        })
      )
    )

    logger.info(`✅ Created policy reads`)

    // ============================================
    // 11. CRIAR LINKS ÚTEIS
    // ============================================
    const linksData = [
      {
        id: 'link-maternar-portal',
        title: 'Portal Maternar Santa Maria',
        url: 'https://maternarsm.com.br',
        description: 'Portal oficial do Maternar Santa Mariense com informações institucionais e serviços.',
        category: 'SYSTEM'
      },
      {
        id: 'link-prontuario-mv',
        title: 'Sistema MV - Prontuário Eletrônico',
        url: 'https://mv.maternarsm.com.br',
        description: 'Acesso ao sistema MV para registro de atendimentos hospitalares.',
        category: 'SYSTEM'
      },
      {
        id: 'link-esus-ab',
        title: 'e-SUS APS',
        url: 'https://esus.maternarsm.com.br',
        description: 'Sistema e-SUS Atenção Primária à Saúde para registro de atendimentos ambulatoriais.',
        category: 'SYSTEM'
      },
      {
        id: 'link-bvs-saude',
        title: 'Biblioteca Virtual em Saúde',
        url: 'https://bvsalud.org',
        description: 'Biblioteca com artigos científicos, diretrizes e protocolos de saúde.',
        category: 'TRAINING'
      },
      {
        id: 'link-ministerio-saude',
        title: 'Ministério da Saúde',
        url: 'https://www.gov.br/saude',
        description: 'Portal oficial do Ministério da Saúde com publicações e normativas.',
        category: 'EXTERNAL'
      },
      {
        id: 'link-anvisa',
        title: 'ANVISA - Agência Nacional de Vigilância Sanitária',
        url: 'https://www.gov.br/anvisa',
        description: 'Portal da ANVISA com regulamentações e notificações sanitárias.',
        category: 'EXTERNAL'
      },
      {
        id: 'link-sbp',
        title: 'Sociedade Brasileira de Pediatria',
        url: 'https://www.sbp.com.br',
        description: 'Portal da SBP com diretrizes e documentos científicos de pediatria.',
        category: 'TRAINING'
      },
      {
        id: 'link-febrasgo',
        title: 'FEBRASGO - Federação Brasileira de Ginecologia e Obstetrícia',
        url: 'https://www.febrasgo.org.br',
        description: 'Portal da FEBRASGO com protocolos e evidências em obstetrícia.',
        category: 'TRAINING'
      },
      {
        id: 'link-coren',
        title: 'COREN-RS',
        url: 'https://coren-rs.gov.br',
        description: 'Conselho Regional de Enfermagem do Rio Grande do Sul.',
        category: 'EXTERNAL'
      },
      {
        id: 'link-crm',
        title: 'CREMERS',
        url: 'https://www.cremers.org.br',
        description: 'Conselho Regional de Medicina do Rio Grande do Sul.',
        category: 'EXTERNAL'
      },
      {
        id: 'link-suporte-ti',
        title: 'Suporte Técnico - TI',
        url: 'mailto:suporte@maternarsm.com.br',
        description: 'Contato com suporte técnico para problemas com sistemas. Ramal: 2500',
        category: 'SUPPORT'
      },
      {
        id: 'link-rh',
        title: 'Departamento de Recursos Humanos',
        url: 'mailto:rh@maternarsm.com.br',
        description: 'Contato com RH para questões trabalhistas, férias e benefícios. Ramal: 2100',
        category: 'SUPPORT'
      }
    ]

    await Promise.all(
      linksData.map(link =>
        prisma.link.upsert({
          where: { id: link.id },
          update: {},
          create: link
        })
      )
    )

    logger.info(`✅ Created ${linksData.length} useful links`)

    // ============================================
    // RESUMO FINAL
    // ============================================
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info('🎉 Enhanced database seeding completed successfully!')
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info('')
    logger.info('📊 Summary:')
    logger.info(`   👥 Users: ${users.length}`)
    logger.info(`   📚 Courses: ${courses.length}`)
    logger.info(`   📖 Lessons: ${lessonsData.length}`)
    logger.info(`   ✍️  Course Enrollments: ${enrollmentsData.length}`)
    logger.info(`   🏆 Achievements: ${achievementsData.length}`)
    logger.info(`   💬 Chat Channels: ${channels.length}`)
    logger.info(`   📅 Events: ${eventsData.length}`)
    logger.info(`   📁 Projects: ${projects.length}`)
    logger.info(`   ✅ Tasks: ${tasksData.length}`)
    logger.info(`   📄 Policies: ${policiesData.length}`)
    logger.info(`   🔗 Links: ${linksData.length}`)
    logger.info('')
    logger.info('🔐 Default credentials:')
    logger.info('   Admin: admin@maternarsantamariense.com / admin123')
    logger.info('   Users: [email] / user123')
    logger.info('')
    logger.info('✨ Database is ready for use!')

  } catch (error) {
    logger.error('❌ Error during enhanced database seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnhanced().catch((error) => {
  logger.error('💥 Seeding failed:', error)
  process.exit(1)
})
