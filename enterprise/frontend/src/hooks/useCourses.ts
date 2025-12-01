import { useQuery, useMutation } from '@apollo/client'
import { GET_COURSES, GET_MY_COURSES, GET_COURSE } from '../graphql/queries'
import { ENROLL_IN_COURSE, COMPLETE_LESSON } from '../graphql/mutations'
import { useToast } from '../components/ui/Toast'
import { useEffect, useState } from 'react'

export const useCourses = () => {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const { data: coursesData, loading: coursesLoading, refetch: refetchCourses } = useQuery(GET_COURSES, {
    errorPolicy: 'all'
  })

  const { data: myCoursesData, loading: myCoursesLoading, refetch: refetchMyCourses } = useQuery(GET_MY_COURSES, {
    errorPolicy: 'all'
  })

  const [enrollMutation] = useMutation(ENROLL_IN_COURSE, {
    refetchQueries: [{ query: GET_COURSES }, { query: GET_MY_COURSES }]
  })

  const [completeLessonMutation] = useMutation(COMPLETE_LESSON, {
    refetchQueries: [{ query: GET_MY_COURSES }]
  })

  const enroll = async (courseId: string) => {
    setLoading(true)
    try {
      const { data } = await enrollMutation({
        variables: { courseId }
      })

      showToast({
        type: 'success',
        title: 'Inscrito com sucesso!',
        message: 'Você pode agora começar o curso'
      })

      return data.enrollInCourse
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao inscrever-se',
        message: error.message || 'Não foi possível fazer a inscrição'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const completeLesson = async (lessonId: string) => {
    setLoading(true)
    try {
      const { data } = await completeLessonMutation({
        variables: { lessonId }
      })

      showToast({
        type: 'success',
        title: 'Lição concluída!',
        message: `Você ganhou ${data.completeLesson.xpEarned} XP`
      })

      return data.completeLesson
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erro ao completar lição',
        message: error.message || 'Não foi possível completar a lição'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    courses: coursesData?.courses || [],
    myCourses: myCoursesData?.myCourses || [],
    loading: coursesLoading || myCoursesLoading || loading,
    enroll,
    completeLesson,
    refetchCourses,
    refetchMyCourses
  }
}

// Hook para buscar um curso específico
export const useCourse = (courseId: string) => {
  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    errorPolicy: 'all',
    skip: !courseId
  })

  return {
    course: data?.course,
    loading,
    error
  }
}

