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

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState('1')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const chats = [
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
    <div className="h-[calc(100vh-8rem)] flex bg-background rounded-lg border border-border overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'fixed inset-0 z-50' : 'hidden'}
        lg:relative lg:flex
        w-full lg:w-80 border-r border-border flex-col bg-background
      `}>
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Conversas</h1>
            </div>
            <div className="flex gap-2">
              <Tooltip content="Nova conversa">
                <Button size="sm" variant="primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Buscar conversas..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <motion.div variants={container} initial="hidden" animate="show">
            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                variants={item}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  p-4 cursor-pointer border-b border-border transition-colors
                  ${selectedChat === chat.id
                    ? 'bg-accent/50 border-l-4 border-l-primary'
                    : 'hover:bg-accent/30'
                  }
                `}
                onClick={() => {
                  setSelectedChat(chat.id)
                  setIsMobileSidebarOpen(false)
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar
                      src={chat.avatar}
                      name={chat.name}
                      size="md"
                      status={chat.type === 'direct' ? chat.status : undefined}
                    />
                    {chat.type === 'group' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
                        <Users className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {chat.name}
                        </h3>
                        {chat.isPinned && (
                          <Pin className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {chat.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="shrink-0 min-w-[20px] h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-xs">
                        {chat.department}
                      </Badge>
                      {chat.type === 'group' && (
                        <span className="text-xs text-muted-foreground">
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
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-accent rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <Avatar
                    src={currentChat.avatar}
                    name={currentChat.name}
                    size="md"
                    status={currentChat.type === 'direct' ? currentChat.status : undefined}
                  />

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {currentChat.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentChat.type === 'direct' ? (
                        <>
                          {currentChat.status === 'online' && (
                            <span className="text-green-600 dark:text-green-400">Online</span>
                          )}
                          {currentChat.status === 'away' && (
                            <span className="text-amber-600 dark:text-amber-400">Ausente</span>
                          )}
                          {currentChat.status === 'offline' && 'Última vez: 2h atrás'}
                        </>
                      ) : (
                        `${currentChat.participants} membros • ${currentChat.department}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip content="Ligar">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Vídeo chamada">
                    <Button variant="ghost" size="sm">
                      <Video className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Buscar">
                    <Button variant="ghost" size="sm">
                      <Search className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Mais opções">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20">
              <AnimatePresence>
                {groupedMessages.map((group, groupIdx) => (
                  <motion.div
                    key={groupIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.05 }}
                    className={`flex ${group.senderId === 'me' ? 'justify-end' : group.senderId === 'system' ? 'justify-center' : 'justify-start'}`}
                  >
                    {group.senderId === 'system' ? (
                      /* System Message */
                      <div className="flex items-center gap-3 my-4">
                        <div className="h-px bg-border flex-1" />
                        <Badge variant="default" className="text-xs font-medium">
                          {group.messages[0].content}
                        </Badge>
                        <div className="h-px bg-border flex-1" />
                      </div>
                    ) : (
                      /* Regular Messages */
                      <div className={`flex gap-2 max-w-[70%] ${group.senderId === 'me' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar (only for first message in group, and not for own messages) */}
                        {group.senderId !== 'me' && (
                          <Avatar
                            src={group.senderAvatar}
                            name={group.senderName}
                            size="sm"
                            className="self-end"
                          />
                        )}

                        <div className="flex flex-col gap-1">
                          {/* Sender name (only for non-own messages) */}
                          {group.senderId !== 'me' && (
                            <span className="text-xs font-medium text-muted-foreground ml-3">
                              {group.senderName}
                            </span>
                          )}

                          {/* Messages */}
                          {group.messages.map((msg, msgIdx) => (
                            <motion.div
                              key={msg.id}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: msgIdx * 0.03 }}
                              className="group relative"
                            >
                              <div
                                className={`
                                  rounded-2xl px-4 py-2.5 shadow-sm transition-all
                                  ${msg.senderId === 'me'
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-card text-card-foreground border border-border rounded-bl-sm hover:shadow-md'
                                  }
                                  ${msgIdx === 0 ? (msg.senderId === 'me' ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}
                                `}
                              >
                                {msg.type === 'text' && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                )}

                                {msg.type === 'file' && (
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <div className={`
                                      w-10 h-10 rounded-lg flex items-center justify-center
                                      ${msg.senderId === 'me' ? 'bg-primary-foreground/20' : 'bg-primary/10'}
                                    `}>
                                      <File className={`w-5 h-5 ${msg.senderId === 'me' ? 'text-primary-foreground' : 'text-primary'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                      <p className={`text-xs ${msg.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {msg.fileSize}
                                      </p>
                                    </div>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      className={msg.senderId === 'me' ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <span className={`text-xs ${msg.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {msg.timestamp}
                                  </span>
                                  {msg.senderId === 'me' && (
                                    <div className="flex items-center">
                                      {msg.read ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Reactions */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className="flex gap-1 mt-2 -mb-1">
                                    {msg.reactions.map((reaction, idx) => (
                                      <div
                                        key={idx}
                                        className={`
                                          px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                                          ${msg.senderId === 'me'
                                            ? 'bg-primary-foreground/20'
                                            : 'bg-accent'
                                          }
                                        `}
                                      >
                                        <span>{reaction.emoji}</span>
                                        <span className="text-xs font-medium">{reaction.count}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Hover actions */}
                              <div className={`
                                absolute top-0 ${msg.senderId === 'me' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
                                opacity-0 group-hover:opacity-100 transition-opacity
                                flex items-center gap-1 px-2
                              `}>
                                <Tooltip content="Reagir">
                                  <button className="p-1.5 hover:bg-accent rounded-md">
                                    <Smile className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </Tooltip>
                                <Tooltip content="Responder">
                                  <button className="p-1.5 hover:bg-accent rounded-md">
                                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
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
                    className="flex items-center gap-2"
                  >
                    <Avatar
                      src={currentChat.avatar}
                      name={currentChat.name}
                      size="xs"
                    />
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-end gap-2">
                <Tooltip content="Anexar arquivo">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </Tooltip>

                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="
                      w-full px-4 py-3
                      bg-muted/50 border border-border rounded-2xl
                      resize-none
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-foreground placeholder:text-muted-foreground
                      min-h-[44px] max-h-32
                    "
                    rows={1}
                  />
                </div>

                <Tooltip content="Emoji">
                  <Button variant="ghost" size="sm">
                    <Smile className="w-5 h-5" />
                  </Button>
                </Tooltip>

                {message.trim() ? (
                  <Tooltip content="Enviar">
                    <Button
                      onClick={handleSendMessage}
                      variant="primary"
                      size="sm"
                      className="h-11 w-11 p-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip content="Gravar áudio">
                    <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                      <Mic className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista ou inicie uma nova para começar a conversar
              </p>
              <Button variant="primary" className="mt-6" icon={<Plus className="w-4 h-4" />}>
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
