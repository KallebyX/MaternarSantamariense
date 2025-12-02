import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Clock,
  MapPin,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  Bell,
  Edit
} from 'lucide-react'

import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { CreateEventModal } from '../components/modals/CreateEventModal'
import { useCalendar } from '../hooks/useCalendar'

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  // Use real calendar hook
  const { events, loading, createEvent, refetch } = useCalendar()

  // Calculate stats from real events
  const todayEvents = useMemo(() => {
    const today = new Date()
    return events?.filter((event: any) => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === today.toDateString()
    }) || []
  }, [events])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      ?.filter((event: any) => new Date(event.startDate) >= now)
      ?.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      ?.slice(0, 5) || []
  }, [events])

  const thisWeekEvents = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return events?.filter((event: any) => {
      const eventDate = new Date(event.startDate)
      return eventDate >= startOfWeek && eventDate < endOfWeek
    }) || []
  }, [events])

  const meetingsCount = useMemo(() => {
    return events?.filter((event: any) => event.type === 'MEETING').length || 0
  }, [events])

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <Users className="w-4 h-4" />
      case 'TRAINING': return <CalendarIcon className="w-4 h-4" />
      case 'APPOINTMENT': return <Clock className="w-4 h-4" />
      case 'REVIEW': return <Edit className="w-4 h-4" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'MEETING': return 'bg-blue-500'
      case 'TRAINING': return 'bg-green-500'
      case 'APPOINTMENT': return 'bg-purple-500'
      case 'REVIEW': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    // Add empty cells for days before first day
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, events: [] })
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dayEvents = events?.filter((event: any) => {
        const eventDate = new Date(event.startDate)
        return eventDate.toDateString() === date.toDateString()
      }) || []
      days.push({ date, events: dayEvents })
    }

    return days
  }, [currentDate, events])

  const handleCreateEvent = async (eventData: any) => {
    await createEvent(eventData)
    setShowCreateModal(false)
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando calendário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus compromissos e eventos
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-foreground">{thisWeekEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reuniões</p>
                <p className="text-2xl font-bold text-foreground">{meetingsCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{events?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(['month', 'week', 'day'] as const).map((viewType) => (
                  <Button
                    key={viewType}
                    variant={view === viewType ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView(viewType)}
                  >
                    {viewType === 'month' ? 'Mês' : viewType === 'week' ? 'Semana' : 'Dia'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isToday = day.date?.toDateString() === new Date().toDateString()
                const hasEvents = day.events.length > 0

                return (
                  <div
                    key={i}
                    className={`p-2 h-20 border border-border rounded cursor-pointer transition-colors
                      ${day.date ? 'hover:bg-accent/50' : 'bg-muted/20'}
                      ${isToday ? 'bg-primary/10 border-primary/30' : ''}
                    `}
                    onClick={() => {
                      if (day.date) {
                        setSelectedDate(day.date)
                        setShowCreateModal(true)
                      }
                    }}
                  >
                    {day.date && (
                      <>
                        <div className={`text-sm ${
                          isToday ? 'font-bold text-primary' : 'text-foreground'
                        }`}>
                          {day.date.getDate()}
                        </div>
                        {hasEvents && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {day.events.slice(0, 2).map((event: any) => (
                              <div
                                key={event.id}
                                className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                                title={event.title}
                              />
                            ))}
                            {day.events.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{day.events.length - 2}</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Eventos de Hoje
              </h3>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map((event: any) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getEventColor(event.type)} mt-2`} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </p>
                        {event.location && (
                          <div className="flex items-center mt-2">
                            <MapPin className="w-3 h-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum evento agendado para hoje
                </p>
              )}
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Próximos Eventos
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-colors">
                      <div className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString('pt-BR')} às {formatTime(event.startDate)}
                        </p>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum evento próximo
                </p>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Reunião
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateModal(true)}>
                  <Video className="w-4 h-4 mr-2" />
                  Videochamada
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateModal(true)}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedDate={selectedDate}
        onSuccess={handleCreateEvent}
      />
    </div>
  )
}

export default Calendar
