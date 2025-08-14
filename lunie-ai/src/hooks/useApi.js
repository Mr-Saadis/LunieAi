// lib/hooks/useApi.js - CENTRALIZED API HOOKS
'use client'

import useSWR from 'swr'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Generic fetcher for SWR
const fetcher = async (url) => {
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'An error occurred')
  }
  
  return response.json()
}

// Custom hooks for data fetching
export function useChatbots() {
  const { data, error, isLoading, mutate } = useSWR('/api/chatbots', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // 5 seconds
  })

  return {
    chatbots: data?.data || [],
    loading: isLoading,
    error,
    refresh: mutate
  }
}

export function useChatbot(chatbotId) {
  const { data, error, isLoading, mutate } = useSWR(
    chatbotId ? `/api/chatbots/${chatbotId}` : null,
    fetcher
  )

  return {
    chatbot: data?.data,
    loading: isLoading,
    error,
    refresh: mutate
  }
}

export function useTrainingData(chatbotId) {
  const { data, error, isLoading, mutate } = useSWR(
    chatbotId ? `/api/chatbots/${chatbotId}/training-data` : null,
    fetcher,
    {
      refreshInterval: 10000, // Auto-refresh every 10 seconds for processing status
    }
  )

  return {
    trainingData: data?.data || [],
    loading: isLoading,
    error,
    refresh: mutate
  }
}

// Mutation hooks for data updates
export function useCreateChatbot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatbotData) => {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatbotData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create chatbot')
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['chatbots'])
      toast.success('Chatbot created successfully!')
      return data
    },
    onError: (error) => {
      toast.error(error.message)
      throw error
    }
  })
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ chatbotId, updates }) => {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update chatbot')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['chatbots'])
      queryClient.invalidateQueries(['chatbot', variables.chatbotId])
      toast.success('Chatbot updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatbotId) => {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete chatbot')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbots'])
      toast.success('Chatbot deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// File upload with progress tracking
export function useFileUpload() {
  return useMutation({
    mutationFn: async ({ chatbotId, file, onProgress }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chatbotId', chatbotId)

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100)
            onProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Upload failed'))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))

        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
    },
    onSuccess: () => {
      toast.success('File uploaded successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
