import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads')
const avatarsDir = path.join(uploadsDir, 'avatars')
const documentsDir = path.join(uploadsDir, 'documents')
const chatFilesDir = path.join(uploadsDir, 'chat')

for (const dir of [uploadsDir, avatarsDir, documentsDir, chatFilesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`))
  }
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let dest = uploadsDir

    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      if (req.path.includes('avatar')) {
        dest = avatarsDir
      } else {
        dest = chatFilesDir
      }
    } else {
      dest = documentsDir
    }

    cb(null, dest)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueId = uuidv4()
    const ext = path.extname(file.originalname)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${uniqueId}-${safeName}`)
  }
})

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.UPLOAD_MAX_SIZE // Default 10MB
  }
})

// Upload types
export const uploadAvatar = upload.single('avatar')
export const uploadDocument = upload.single('document')
export const uploadChatFile = upload.single('file')
export const uploadMultiple = upload.array('files', 10)

// Service class
export class UploadService {

  getFileUrl(filename: string, type: 'avatar' | 'document' | 'chat' = 'chat'): string {
    const baseUrl = process.env.API_URL || `http://localhost:${config.PORT}`
    return `${baseUrl}/uploads/${type}s/${filename}`
  }

  async deleteFile(filepath: string): Promise<boolean> {
    try {
      const fullPath = path.join(uploadsDir, filepath)

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        logger.info(`File deleted: ${fullPath}`)
        return true
      }

      return false
    } catch (error) {
      logger.error('Error deleting file:', error)
      return false
    }
  }

  getFilePath(filename: string, type: 'avatar' | 'document' | 'chat' = 'chat'): string {
    const dirs: Record<string, string> = {
      avatar: avatarsDir,
      document: documentsDir,
      chat: chatFilesDir
    }

    return path.join(dirs[type], filename)
  }

  isValidImageType(mimetype: string): boolean {
    return ALLOWED_IMAGE_TYPES.includes(mimetype)
  }

  isValidDocumentType(mimetype: string): boolean {
    return ALLOWED_DOCUMENT_TYPES.includes(mimetype)
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const uploadService = new UploadService()

// Error handler middleware
export const uploadErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande',
        maxSize: uploadService.formatFileSize(config.UPLOAD_MAX_SIZE)
      })
    }

    return res.status(400).json({
      error: 'Erro no upload do arquivo',
      message: error.message
    })
  }

  if (error) {
    return res.status(400).json({
      error: error.message
    })
  }

  next()
}
