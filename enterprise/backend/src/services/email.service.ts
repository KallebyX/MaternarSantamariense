import nodemailer from 'nodemailer'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

// Email templates
const templates = {
  welcome: (firstName: string) => ({
    subject: 'Bem-vindo ao Maternar Santa Mariense',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maternar Santa Mariense</h1>
          </div>
          <div class="content">
            <h2>Olá, ${firstName}!</h2>
            <p>Seja bem-vindo(a) à plataforma Maternar Santa Mariense!</p>
            <p>Estamos muito felizes em ter você conosco. Aqui você encontrará:</p>
            <ul>
              <li>Cursos e treinamentos sobre saúde materno-infantil</li>
              <li>Protocolos e documentos importantes</li>
              <li>Ferramentas de comunicação com a equipe</li>
              <li>Sistema de gamificação para reconhecer seu progresso</li>
            </ul>
            <p>Acesse a plataforma e comece sua jornada de aprendizado!</p>
            <a href="https://maternarsantamariense.com" class="button">Acessar Plataforma</a>
          </div>
          <div class="footer">
            <p>Maternar Santa Mariense - Sistema de Gestão e Treinamento</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (firstName: string, resetLink: string) => ({
    subject: 'Recuperação de Senha - Maternar Santa Mariense',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maternar Santa Mariense</h1>
          </div>
          <div class="content">
            <h2>Olá, ${firstName}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetLink}" class="button">Redefinir Senha</a>
            <div class="warning">
              <strong>Atenção:</strong> Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
            </div>
          </div>
          <div class="footer">
            <p>Maternar Santa Mariense - Sistema de Gestão e Treinamento</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  eventReminder: (firstName: string, eventTitle: string, eventDate: string, eventLocation: string) => ({
    subject: `Lembrete: ${eventTitle} - Maternar Santa Mariense`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899; margin: 20px 0; }
          .event-detail { margin: 10px 0; }
          .event-detail strong { color: #6b7280; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Maternar Santa Mariense</h1>
          </div>
          <div class="content">
            <h2>Olá, ${firstName}!</h2>
            <p>Lembramos que você tem um evento agendado:</p>
            <div class="event-card">
              <h3 style="margin-top: 0; color: #ec4899;">${eventTitle}</h3>
              <div class="event-detail">
                <strong>Data:</strong> ${eventDate}
              </div>
              <div class="event-detail">
                <strong>Local:</strong> ${eventLocation || 'A definir'}
              </div>
            </div>
            <a href="https://maternarsantamariense.com/calendar" class="button">Ver no Calendário</a>
          </div>
          <div class="footer">
            <p>Maternar Santa Mariense - Sistema de Gestão e Treinamento</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  courseCompleted: (firstName: string, courseTitle: string, xpEarned: number) => ({
    subject: `Parabéns! Você completou o curso "${courseTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .trophy { font-size: 64px; }
          .xp-badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Parabéns!</h1>
          </div>
          <div class="content">
            <div class="trophy">🏆</div>
            <h2>Olá, ${firstName}!</h2>
            <p>Você completou o curso:</p>
            <h3 style="color: #10b981;">${courseTitle}</h3>
            <div class="xp-badge">+${xpEarned} XP</div>
            <p>Continue assim! Cada curso completo te aproxima de novas conquistas.</p>
            <a href="https://maternarsantamariense.com/training" class="button">Ver Mais Cursos</a>
          </div>
          <div class="footer">
            <p>Maternar Santa Mariense - Sistema de Gestão e Treinamento</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  achievementUnlocked: (firstName: string, achievementTitle: string, achievementDescription: string, xpReward: number) => ({
    subject: `Nova Conquista Desbloqueada: ${achievementTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .badge { font-size: 64px; }
          .achievement-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
          .xp-badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova Conquista!</h1>
          </div>
          <div class="content">
            <div class="badge">🎖️</div>
            <h2>Olá, ${firstName}!</h2>
            <p>Você desbloqueou uma nova conquista!</p>
            <div class="achievement-card">
              <h3 style="margin-top: 0; color: #8b5cf6;">${achievementTitle}</h3>
              <p style="color: #6b7280;">${achievementDescription}</p>
              <div class="xp-badge">+${xpReward} XP</div>
            </div>
            <a href="https://maternarsantamariense.com/gamification" class="button">Ver Todas as Conquistas</a>
          </div>
          <div class="footer">
            <p>Maternar Santa Mariense - Sistema de Gestão e Treinamento</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_PORT === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS
        }
      })

      logger.info('Email service initialized')
    } else {
      logger.warn('Email service not configured - missing SMTP credentials')
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email not sent - service not configured')
      return false
    }

    try {
      await this.transporter.sendMail({
        from: `"Maternar Santa Mariense" <noreply@maternarsantamariense.com>`,
        to,
        subject,
        html
      })

      logger.info(`Email sent to ${to}: ${subject}`)
      return true
    } catch (error) {
      logger.error('Failed to send email:', error)
      return false
    }
  }

  // Convenience methods

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const template = templates.welcome(firstName)
    return this.sendEmail(email, template.subject, template.html)
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetLink: string): Promise<boolean> {
    const template = templates.passwordReset(firstName, resetLink)
    return this.sendEmail(email, template.subject, template.html)
  }

  async sendEventReminderEmail(
    email: string,
    firstName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string
  ): Promise<boolean> {
    const template = templates.eventReminder(firstName, eventTitle, eventDate, eventLocation)
    return this.sendEmail(email, template.subject, template.html)
  }

  async sendCourseCompletedEmail(
    email: string,
    firstName: string,
    courseTitle: string,
    xpEarned: number
  ): Promise<boolean> {
    const template = templates.courseCompleted(firstName, courseTitle, xpEarned)
    return this.sendEmail(email, template.subject, template.html)
  }

  async sendAchievementEmail(
    email: string,
    firstName: string,
    achievementTitle: string,
    achievementDescription: string,
    xpReward: number
  ): Promise<boolean> {
    const template = templates.achievementUnlocked(firstName, achievementTitle, achievementDescription, xpReward)
    return this.sendEmail(email, template.subject, template.html)
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      logger.info('SMTP connection verified')
      return true
    } catch (error) {
      logger.error('SMTP connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
