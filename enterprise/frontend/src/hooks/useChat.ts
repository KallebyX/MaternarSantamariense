import { useState } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { GET_CHANNELS, GET_CHANNEL, GET_MESSAGES } from '../graphql/queries'
import { SEND_MESSAGE } from '../graphql/mutations'
import { MESSAGE_ADDED } from '../graphql/subscriptions'
import { useToast } from '../components/ui/Toast'

export const useChat = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const { data: channelsData, loading: channelsLoading } = useQuery(GET_CHANNELS, {
    errorPolicy: 'all'
  })

  const { data: channelData, loading: channelLoading } = useQuery(GET_CHANNEL, {
    variables: { id: selectedChannelId },
    errorPolicy: 'all',
    skip: !selectedChannelId
  })

  const { data: messagesData, loading: messagesLoading } = useQuery(GET_MESSAGES, {
    variables: { channelId: selectedChannelId },
    errorPolicy: 'all',
    skip: !selectedChannelId
  })

  // Subscribe to new messages
  useSubscription(MESSAGE_ADDED, {
    variables: { channelId: selectedChannelId },
    skip: !selectedChannelId,
    onData: ({ data }) => {
      if (data?.data?.messageAdded) {
        // Message added, cache will update automatically
        console.log('New message received:', data.data.messageAdded)
      }
    }
  })

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    refetchQueries: [
      { query: GET_MESSAGES, variables: { channelId: selectedChannelId } },
      { query: GET_CHANNELS }
    ]
  })

  const channels = channelsData?.channels || []
  const currentChannel = channelData?.channel || null
  const messages = messagesData?.messages || []

  const sendMessage = async (content: string, channelId?: string) => {
    const targetChannelId = channelId || selectedChannelId
    
    if (!targetChannelId || !content.trim()) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Selecione um canal e digite uma mensagem'
      })
      return
    }

    setLoading(true)
    try {
      await sendMessageMutation({
        variables: {
          input: {
            content,
            type: 'TEXT',
            channelId: targetChannelId
          }
        }
      })

      showToast({
        type: 'success',
        title: 'Mensagem enviada',
        message: 'Sua mensagem foi enviada com sucesso'
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao enviar mensagem',
        message: error.message || 'Não foi possível enviar a mensagem'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    channels,
    currentChannel,
    messages: [...messages].reverse(), // Most recent first
    loading: channelsLoading || channelLoading || messagesLoading || loading,
    selectedChannelId,
    setSelectedChannelId,
    sendMessage
  }
}

