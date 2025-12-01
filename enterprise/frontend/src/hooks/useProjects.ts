import { useQuery, useMutation } from '@apollo/client'
import { GET_PROJECTS, GET_PROJECT, GET_MY_PROJECTS } from '../graphql/queries'
import { CREATE_PROJECT, CREATE_TASK, UPDATE_TASK, DELETE_TASK } from '../graphql/mutations'
import { useToast } from '../components/ui/Toast'
import { useState } from 'react'

export const useProjects = () => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data, loading: projectsLoading, refetch } = useQuery(GET_PROJECTS, {
    errorPolicy: 'all'
  })

  const [createProjectMutation] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }]
  })

  const [createTaskMutation] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }]
  })

  const [updateTaskMutation] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }]
  })

  const [deleteTaskMutation] = useMutation(DELETE_TASK, {
    refetchQueries: [{ query: GET_PROJECTS }]
  })

  const projects = data?.projects || []

  const createProject = async (input: any) => {
    setLoading(true)
    try {
      const { data } = await createProjectMutation({
        variables: { input }
      })

      showToast({
        type: 'success',
        title: 'Projeto criado!',
        message: 'O projeto foi adicionado com sucesso'
      })

      return data?.createProject
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar projeto',
        message: error.message || 'Não foi possível criar o projeto'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (input: any) => {
    setLoading(true)
    try {
      const { data } = await createTaskMutation({
        variables: { input }
      })

      showToast({
        type: 'success',
        title: 'Tarefa criada!',
        message: 'A tarefa foi adicionada ao projeto'
      })

      return data?.createTask
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao criar tarefa',
        message: error.message || 'Não foi possível criar a tarefa'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (taskId: string, input: any) => {
    setLoading(true)
    try {
      const { data } = await updateTaskMutation({
        variables: { id: taskId, input }
      })

      showToast({
        type: 'success',
        title: 'Tarefa atualizada!',
        message: 'As alterações foram salvas'
      })

      return data?.updateTask
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao atualizar tarefa',
        message: error.message || 'Não foi possível atualizar a tarefa'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setLoading(true)
    try {
      await deleteTaskMutation({
        variables: { id: taskId }
      })

      showToast({
        type: 'success',
        title: 'Tarefa removida',
        message: 'A tarefa foi excluída com sucesso'
      })
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao remover tarefa',
        message: error.message || 'Não foi possível remover a tarefa'
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    projects,
    loading: projectsLoading || loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    refetch
  }
}

// Hook para buscar um projeto específico
export const useProject = (projectId: string) => {
  const { data, loading, error } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    errorPolicy: 'all',
    skip: !projectId
  })

  return {
    project: data?.project,
    loading,
    error
  }
}

