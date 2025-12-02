import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  Search,
  Plus,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  File,
  Download,
  Check,
  CheckCheck,
  Pin,
  X,
  Mic,
  ChevronLeft,
  Loader2,
  RefreshCw
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Tooltip } from '../components/ui/Tooltip'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../hooks/useAuth'

const Chat: React.FC = () => {
  const { user } = useAuth()
  const {
    channels,
    currentChannel,
    messages,
    loading,
    selectedChannelId,
    setSelectedChannelId,
    sendMessage
  } = useChat()

  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter channels based on search
  const filteredChannels = channels.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChannelId) {
      await sendMessage(messageInput)
      setMessageInput('')
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

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  // Group messages by date
  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { [key: string]: any[] } = {}
    msgs.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(msg)
    })
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

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

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          {loading && channels.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? 'Nenhum canal encontrado' : 'Nenhum canal disponível'}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredChannels.map((channel: any) => (
                <motion.div
                  key={channel.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    p-4 cursor-pointer border-b border-border transition-colors
                    ${selectedChannelId === channel.id
                      ? 'bg-accent/50 border-l-4 border-l-primary'
                      : 'hover:bg-accent/30'
                    }
                  `}
                  onClick={() => {
                    setSelectedChannelId(channel.id)
                    setIsMobileSidebarOpen(false)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {channel.type === 'DIRECT' ? (
                          <MessageCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <Users className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {channel.name}
                        </h3>
                        {channel.updatedAt && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(channel.updatedAt)}
                          </span>
                        )}
                      </div>

                      {channel.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {channel.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" className="text-xs">
                          {channel.type === 'PUBLIC' ? 'Público' : channel.type === 'PRIVATE' ? 'Privado' : 'Direto'}
                        </Badge>
                        {channel.members && (
                          <span className="text-xs text-muted-foreground">
                            {channel.members.length} membros
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannelId && currentChannel ? (
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

                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {currentChannel.type === 'DIRECT' ? (
                      <MessageCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {currentChannel.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentChannel.members?.length || 0} membros
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                    <p className="text-sm text-muted-foreground">Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {Object.entries(messageGroups).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="h-px bg-border flex-1" />
                        <Badge variant="default" className="text-xs font-medium">
                          {formatDate(msgs[0].createdAt)}
                        </Badge>
                        <div className="h-px bg-border flex-1" />
                      </div>

                      {/* Messages for this date */}
                      {msgs.map((msg: any, idx: number) => {
                        const isOwn = msg.sender?.id === user?.id
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                              {!isOwn && (
                                <Avatar
                                  src={msg.sender?.avatar}
                                  name={`${msg.sender?.firstName || ''} ${msg.sender?.lastName || ''}`}
                                  size="sm"
                                  className="self-end"
                                />
                              )}

                              <div className="flex flex-col gap-1">
                                {!isOwn && (
                                  <span className="text-xs font-medium text-muted-foreground ml-3">
                                    {msg.sender?.firstName} {msg.sender?.lastName}
                                  </span>
                                )}

                                <div
                                  className={`
                                    rounded-2xl px-4 py-2.5 shadow-sm
                                    ${isOwn
                                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                                      : 'bg-card text-card-foreground border border-border rounded-bl-sm'
                                    }
                                  `}
                                >
                                  {msg.type === 'TEXT' && (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>
                                  )}

                                  {msg.type === 'FILE' && (
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                      <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center
                                        ${isOwn ? 'bg-primary-foreground/20' : 'bg-primary/10'}
                                      `}>
                                        <File className={`w-5 h-5 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                      </div>
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        className={isOwn ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''}
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                      {formatTime(msg.createdAt)}
                                    </span>
                                    {isOwn && (
                                      <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ))}
                </AnimatePresence>
              )}
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
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
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

                {messageInput.trim() ? (
                  <Tooltip content="Enviar">
                    <Button
                      onClick={handleSendMessage}
                      variant="primary"
                      size="sm"
                      className="h-11 w-11 p-0"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
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
                {channels.length === 0 ? 'Nenhum canal disponível' : 'Selecione uma conversa'}
              </h3>
              <p className="text-muted-foreground">
                {channels.length === 0
                  ? 'Aguarde a criação de canais ou entre em contato com o administrador'
                  : 'Escolha uma conversa da lista para começar a conversar'
                }
              </p>
              {channels.length === 0 && (
                <Button
                  variant="primary"
                  className="mt-6"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => window.location.reload()}
                >
                  Recarregar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
