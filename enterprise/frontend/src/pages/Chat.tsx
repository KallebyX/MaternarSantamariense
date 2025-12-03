import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  Search,
  Plus,
  Phone,
  Video,
  Settings,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  UserPlus,
  Archive,
  Bell,
  BellOff,
  Image as ImageIcon,
  File,
  Download,
  Check,
  CheckCheck,
  Pin,
  Star,
  X,
  Mic,
  ChevronLeft
} from 'lucide-react'

import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarGroup } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Tooltip } from '../components/ui/Tooltip'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  type: 'text' | 'file' | 'image' | 'system'
  fileName?: string
  fileSize?: string
  read?: boolean
  reactions?: { emoji: string; count: number }[]
}

interface ChatItem {
  id: string
  type: 'direct' | 'group'
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status?: 'online' | 'away' | 'offline'
  department: string
  isPinned: boolean
  participants?: number
}

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState('1')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const chats: ChatItem[] = [
    {
      id: '1',
      type: 'direct' as const,
      name: 'Dra. Maria Silva',
      avatar: '/avatars/maria.jpg',
      lastMessage: 'Claro, precisamos estar sempre atualizando nossos conhecimentos. Obrigada!',
      lastMessageTime: '09:30',
      unreadCount: 0,
      status: 'online' as const,
      department: 'Atenção Primária',
      isPinned: true
    },
    {
      id: '2',
      type: 'direct' as const,
      name: 'Ana Costa',
      avatar: '/avatars/ana.jpg',
      lastMessage: 'Ótima ideia! Podemos organizar juntas o encontro, o que acha?',
      lastMessageTime: '11:20',
      unreadCount: 0,
      status: 'online' as const,
      department: 'Enfermagem',
      isPinned: false
    },
    {
      id: '3',
      type: 'direct' as const,
      name: 'Gestora da Política de Saúde da Mulher',
      avatar: '/avatars/gestora.jpg',
      lastMessage: 'Perfeito. Minha ideia é organizarmos uma formação prática e teórica...',
      lastMessageTime: '08:45',
      unreadCount: 1,
      status: 'online' as const,
      department: 'Gestão',
      isPinned: true
    }
  ]

  const messages: Message[] = [
    {
      id: '0',
      senderId: 'system',
      senderName: 'Sistema',
      content: 'Hoje',
      timestamp: '',
      type: 'system'
    },
    {
      id: '1',
      senderId: '1',
      senderName: 'Dra. Maria Silva',
      senderAvatar: '/avatars/maria.jpg',
      content: 'Bom dia!',
      timestamp: '09:00',
      type: 'text',
      read: true
    },
    {
      id: '2',
      senderId: '1',
      senderName: 'Dra. Maria Silva',
      senderAvatar: '/avatars/maria.jpg',
      content: 'Foi lançado um novo Guia do Pré-natal e Puerpério na Atenção Primária à Saúde.',
      timestamp: '09:01',
      type: 'text',
      read: true
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Dra. Maria Silva',
      senderAvatar: '/avatars/maria.jpg',
      content: 'Vou encaminhá-lo para que possamos incluí-lo como pauta nas próximas reuniões de equipe',
      timestamp: '09:02',
      type: 'text',
      read: true
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'Você',
      content: 'Bom dia!',
      timestamp: '09:25',
      type: 'text',
      read: true
    },
    {
      id: '5',
      senderId: 'me',
      senderName: 'Você',
      content: 'Claro, precisamos estar sempre atualizando nossos conhecimentos. Obrigada!',
      timestamp: '09:30',
      type: 'text',
      read: true
    }
  ]

  const currentChat = chats.find(chat => chat.id === selectedChat)
  const filteredChats = chats
    .filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (message.length > 0) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [message])

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((acc, msg, idx) => {
    const prevMsg = messages[idx - 1]
    const isGrouped = prevMsg && prevMsg.senderId === msg.senderId && msg.type !== 'system'

    if (isGrouped) {
      const lastGroup = acc[acc.length - 1]
      lastGroup.messages.push(msg)
    } else {
      acc.push({
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        messages: [msg]
      })
    }
    return acc
  }, [] as Array<{ senderId: string; senderName: string; senderAvatar?: string; messages: Message[] }>)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex bg-background rounded-none sm:rounded-lg border-0 sm:border border-border overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'fixed inset-0 z-50 bg-background' : 'hidden'}
        lg:relative lg:flex
        w-full sm:w-full md:w-80 lg:w-80 xl:w-96 
        border-r-0 lg:border-r border-border flex-col bg-background
      `}>
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-4 lg:p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-accent rounded-lg shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-lg sm:text-xl md:text-xl font-bold text-foreground truncate">Conversas</h1>
            </div>
            <div className="flex gap-1 sm:gap-2 shrink-0">
              <Tooltip content="Nova conversa">
                <Button size="sm" variant="primary" className="p-2 sm:p-3">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Buscar conversas..."
            icon={<Search className="w-3 h-3 sm:w-4 sm:h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            className="text-sm sm:text-base"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <motion.div variants={container} initial="hidden" animate="show">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                variants={item}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`
                  p-3 sm:p-4 md:p-4 cursor-pointer border-b border-border transition-colors
                  ${selectedChat === chat.id
                    ? 'bg-accent/50 border-l-2 sm:border-l-4 border-l-primary'
                    : 'hover:bg-accent/30'
                  }
                `}
                onClick={() => {
                  setSelectedChat(chat.id)
                  setIsMobileSidebarOpen(false)
                }}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="relative shrink-0">
                    <Avatar
                      src={chat.avatar}
                      name={chat.name}
                      size="sm"
                      className="sm:w-10 sm:h-10 md:w-12 md:h-12"
                      status={chat.type === 'direct' ? chat.status : undefined}
                    />
                    {chat.type === 'group' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center ring-1 sm:ring-2 ring-background">
                        <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <h3 className="text-[13px] sm:text-sm md:text-sm font-semibold text-foreground truncate">
                          {chat.name}
                        </h3>
                        {chat.isPinned && (
                          <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                        {chat.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5 sm:mt-1">
                      <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="shrink-0 min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <Badge variant="default" className="text-[9px] sm:text-[10px] md:text-xs px-1.5 py-0.5">
                        {chat.department}
                      </Badge>
                      {chat.type === 'group' && (
                        <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
                          {chat.participants} membros
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 md:p-4 lg:p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 hover:bg-accent rounded-lg shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <Avatar
                    src={currentChat.avatar}
                    name={currentChat.name}
                    size="sm"
                    className="sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0"
                    status={currentChat.type === 'direct' ? currentChat.status : undefined}
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg md:text-lg font-semibold text-foreground truncate">
                      {currentChat.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {currentChat.type === 'direct' ? (
                        <>
                          {currentChat.status === 'online' && (
                            <span className="text-green-600 dark:text-green-400">Online</span>
                          )}
                          {currentChat.status === 'away' && (
                            <span className="text-amber-600 dark:text-amber-400">Ausente</span>
                          )}
                          {currentChat.status === 'offline' && (
                            <span className="hidden sm:inline">Última vez: 2h atrás</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">{currentChat.participants} membros • </span>
                          <span>{currentChat.department}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <Tooltip content="Ligar">
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 hidden sm:flex">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Vídeo chamada">
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 hidden sm:flex">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Buscar">
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 hidden md:flex">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Mais opções">
                    <Button variant="ghost" size="sm" className="p-1.5 sm:p-2">
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-4 space-y-3 sm:space-y-4 md:space-y-6 bg-muted/20">
              <AnimatePresence>
                {groupedMessages.map((group, groupIdx) => (
                  <motion.div
                    key={groupIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.03 }}
                    className={`flex ${group.senderId === 'me' ? 'justify-end' : group.senderId === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {group.senderId === 'system' ? (
                      /* System Message */
                      <div className="flex items-center gap-2 sm:gap-3 my-2 sm:my-3 md:my-4 w-full max-w-xs sm:max-w-sm">
                        <div className="h-px bg-border flex-1" />
                        <Badge variant="default" className="text-[10px] sm:text-xs font-medium px-2 py-1">
                          {group.messages[0].content}
                        </Badge>
                        <div className="h-px bg-border flex-1" />
                      </div>
                    ) : (
                      /* Regular Messages */
                      <div className={`flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[65%] ${group.senderId === 'me' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar (only for first message in group, and not for own messages) */}
                        {group.senderId !== 'me' && (
                          <Avatar
                            src={group.senderAvatar}
                            name={group.senderName}
                            size="xs"
                            className="self-end shrink-0 sm:w-8 sm:h-8 md:w-9 md:h-9"
                          />
                        )}

                        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                          {/* Sender name (only for non-own messages) */}
                          {group.senderId !== 'me' && (
                            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-2 sm:ml-3 truncate">
                              {group.senderName}
                            </span>
                          )}

                          {/* Messages */}
                          {group.messages.map((msg, msgIdx) => (
                            <motion.div
                              key={msg.id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: msgIdx * 0.02 }}
                              className="group relative"
                            >
                              <div
                                className={`
                                  rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm transition-all
                                  ${msg.senderId === 'me'
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-card text-card-foreground border border-border rounded-bl-sm hover:shadow-md'
                                  }
                                  ${msgIdx === 0 ? (msg.senderId === 'me' ? 'rounded-tr-xl sm:rounded-tr-2xl' : 'rounded-tl-xl sm:rounded-tl-2xl') : ''}
                                `}
                              >
                                {msg.type === 'text' && (
                                  <p className="text-[13px] sm:text-sm md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                )}

                                {msg.type === 'file' && (
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-[180px] sm:min-w-[200px]">
                                    <div className={`
                                      w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0
                                      ${msg.senderId === 'me' ? 'bg-primary-foreground/20' : 'bg-primary/10'}
                                    `}>
                                      <File className={`w-4 h-4 sm:w-5 sm:h-5 ${msg.senderId === 'me' ? 'text-primary-foreground' : 'text-primary'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] sm:text-sm font-medium truncate">{msg.fileName}</p>
                                      <p className={`text-[11px] sm:text-xs ${msg.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {msg.fileSize}
                                      </p>
                                    </div>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      className={`p-1.5 sm:p-2 shrink-0 ${msg.senderId === 'me' ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''}`}
                                    >
                                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                                  <span className={`text-[10px] sm:text-xs ${msg.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {msg.timestamp}
                                  </span>
                                  {msg.senderId === 'me' && (
                                    <div className="flex items-center shrink-0">
                                      {msg.read ? (
                                        <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground/70" />
                                      ) : (
                                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground/70" />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Reactions */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className="flex gap-1 mt-1 sm:mt-2 -mb-0.5 sm:-mb-1 flex-wrap">
                                    {msg.reactions.map((reaction, idx) => (
                                      <div
                                        key={idx}
                                        className={`
                                          px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1
                                          ${msg.senderId === 'me'
                                            ? 'bg-primary-foreground/20'
                                            : 'bg-accent'
                                          }
                                        `}
                                      >
                                        <span>{reaction.emoji}</span>
                                        <span className="text-[10px] sm:text-xs font-medium">{reaction.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Hover actions */}
                              <div className={`
                                absolute top-0 ${msg.senderId === 'me' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
                                opacity-0 group-hover:opacity-100 transition-opacity
                                hidden sm:flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2
                              `}>
                                <Tooltip content="Reagir">
                                  <button className="p-1 sm:p-1.5 hover:bg-accent rounded-md">
                                    <Smile className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Responder">
                                  <button className="p-1 sm:p-1.5 hover:bg-accent rounded-md">
                                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                  </button>
                                </Tooltip>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <Avatar
                      src={currentChat.avatar}
                      name={currentChat.name}
                      size="xs"
                      className="sm:w-7 sm:h-7 shrink-0"
                    />
                    <div className="bg-card border border-border rounded-xl sm:rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-3">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-2 sm:p-3 md:p-4 border-t border-border bg-card">
              <div className="flex items-end gap-1 sm:gap-2">
                <Tooltip content="Anexar arquivo">
                  <Button variant="ghost" size="sm" className="p-2 sm:p-2.5 shrink-0">
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Tooltip>

                <div className="flex-1 relative min-w-0">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="
                      w-full px-3 py-2 sm:px-4 sm:py-3
                      bg-muted/50 border border-border rounded-xl sm:rounded-2xl
                      resize-none
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-foreground placeholder:text-muted-foreground
                      text-[14px] sm:text-base
                      min-h-[36px] sm:min-h-[44px] max-h-24 sm:max-h-32
                      leading-tight sm:leading-normal
                    "
                    rows={1}
                  />
                </div>

                <Tooltip content="Emoji">
                  <Button variant="ghost" size="sm" className="p-2 sm:p-2.5 shrink-0 hidden sm:flex">
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Tooltip>

                {message.trim() ? (
                  <Tooltip content="Enviar">
                    <Button
                      onClick={handleSendMessage}
                      variant="primary"
                      size="sm"
                      className="h-9 w-9 sm:h-11 sm:w-11 p-0 shrink-0"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip content="Gravar áudio">
                    <Button variant="ghost" size="sm" className="h-9 w-9 sm:h-11 sm:w-11 p-0 shrink-0">
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
            <div className="text-center max-w-[280px] sm:max-w-sm md:max-w-md">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Escolha uma conversa da lista ou inicie uma nova para começar a conversar
              </p>
              <Button 
                variant="primary" 
                className="mt-4 sm:mt-6 text-sm sm:text-base px-4 sm:px-6" 
                icon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
              >
                Nova Conversa
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
