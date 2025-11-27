import { useQuery, useMutation } from '@apollo/client'
import { GET_EVENTS, GET_EVENT } from '../graphql/queries'
import { CREATE_EVENT, UPDATE_EVENT_ATTENDANCE } from '../graphql/mutations'
import { useToast } from '../components/ui/Toast'
import { useState } from 'react'

export const useCalendar = (startDate?: Date, endDate?: Date) => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data, loading: eventsLoading, refetch } = useQuery(GET_EVENTS, {
    variables: {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    },
    errorPolicy: 'all'
  })

  const [createEventMutation] = useMutation(CREATE_EVENT, {
    refetchQueries: [{ query: GET_EVENTS }]
  })

  const [updateAttendanceMutation] = useMutation(UPDATE_EVENT_ATTENDANCE, {
    refetchQueries: [{ query: GET_EVENTS }]
  })

  const events = data?.events || []

  const createEvent = async (input: any) => {
    setLoading(true)
    try {
      const { data } = await createEventMutation({
        variables: { input }
      })

      showToast({
        type: 'success',
        title: 'Evento criado!',
        message: 'O evento foi adicionado ao calendário'
      })

      return data?.createEvent
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar evento',
        message: error.message || 'Não foi possível criar o evento'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = async (eventId: string, status: string) => {
    setLoading(true)
    try {
      await updateAttendanceMutation({
        variables: { eventId, status }
      })

      showToast({
        type: 'success',
        title: 'Presença atualizada',
        message: 'Sua resposta foi salva'
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao atualizar presença',
        message: error.message || 'Não foi possível atualizar a presença'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading: eventsLoading || loading,
    createEvent,
    updateAttendance,
    refetch
  }
}

// Hook para buscar um evento específico
export const useEvent = (eventId: string) => {
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    errorPolicy: 'all',
    skip: !eventId
  })

  return {
    event: data?.event,
    loading,
    error
  }
}

