import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    // Buscar o admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@maternarsm.com.br' }
    })

    if (!admin) {
      console.log('❌ Admin não encontrado. Criando novo admin...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@maternarsm.com.br',
          username: 'admin',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'Sistema',
          role: 'ADMIN',
          department: 'Tecnologia',
          position: 'Administrador do Sistema',
          totalXP: 1000,
          level: 10
        }
      })
      
      console.log('✅ Admin criado com sucesso!')
      console.log('📧 Email: admin@maternarsm.com.br')
      console.log('🔑 Senha: admin123')
    } else {
      // Resetar senha
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Senha do admin resetada com sucesso!')
      console.log('📧 Email: admin@maternarsm.com.br')
      console.log('🔑 Nova senha: admin123')
    }

    // Listar todos os usuários
    console.log('\n📋 Lista de usuários no sistema:')
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })
    
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()