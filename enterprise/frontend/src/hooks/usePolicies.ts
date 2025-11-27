import { useQuery, useMutation } from '@apollo/client'
import { GET_POLICIES, GET_POLICY } from '../graphql/queries'
import { MARK_POLICY_AS_READ, ACKNOWLEDGE_POLICY } from '../graphql/mutations'
import { useToast } from '../components/ui/Toast'
import { useState } from 'react'

export const usePolicies = () => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data, loading: policiesLoading, refetch } = useQuery(GET_POLICIES, {
    errorPolicy: 'all'
  })

  const [markAsReadMutation] = useMutation(MARK_POLICY_AS_READ, {
    refetchQueries: [{ query: GET_POLICIES }]
  })

  const [acknowledgeMutation] = useMutation(ACKNOWLEDGE_POLICY, {
    refetchQueries: [{ query: GET_POLICIES }]
  })

  const policies = data?.policies || []

  const markAsRead = async (policyId: string) => {
    setLoading(true)
    try {
      await markAsReadMutation({
        variables: { policyId }
      })

      showToast({
        type: 'success',
        title: 'Política marcada como lida',
        message: 'O registro foi salvo'
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Não foi possível marcar como lida'
      })
    } finally {
      setLoading(false)
    }
  }

  const acknowledge = async (policyId: string) => {
    setLoading(true)
    try {
      await acknowledgeMutation({
        variables: { policyId }
      })

      showToast({
        type: 'success',
        title: 'Política confirmada',
        message: 'Você confirmou ter lido e entendido a política'
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: error.message || 'Não foi possível confirmar a leitura'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    policies,
    loading: policiesLoading || loading,
    markAsRead,
    acknowledge,
    refetch
  }
}

// Hook para buscar uma política específica
export const usePolicy = (policyId: string) => {
  const { data, loading, error } = useQuery(GET_POLICY, {
    variables: { id: policyId },
    errorPolicy: 'all',
    skip: !policyId
  })

  return {
    policy: data?.policy,
    loading,
    error
  }
}

