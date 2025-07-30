'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Plus, 
  Settings, 
  MessageSquare, 
  Eye, 
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please log in to view your chatbots')
        return
      }

      const { data, error } = await supabase
        .from('chatbots')
        .select(`
          id,
          name,
          description,
          ai_model,
          theme_color,
          is_active,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching chatbots:', error)
        toast.error('Failed to load chatbots')
      } else {
        setChatbots(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getModelBadge = (model) => {
    const modelConfig = {
      'gpt-3.5-turbo': { label: 'GPT-3.5 Turbo', color: 'bg-[#94B9F9] text-white' },
      'gpt-4': { label: 'GPT-4', color: 'bg-[#F4CAF7] text-white' },
      'gpt-4-turbo': { label: 'GPT-4 Turbo', color: 'bg-[#FB8A8F] text-white' }
    }
    
    const config = modelConfig[model] || { label: model, color: 'bg-gray-500 text-white' }
    
    return (
      <Badge className={`${config.color} border-0 text-xs`}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#94B9F9]" />
          <p className="text-gray-600">Loading your chatbots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Chatbots</h1>
          <p className="text-gray-600">Manage your AI assistants</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg">
          <Link href="/dashboard/chatbots/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Chatbot
          </Link>
        </Button>
      </div>

      {/* Chatbots Grid */}
      {chatbots.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[#EBF6FC] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-[#94B9F9]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Your First Chatbot
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating an AI chatbot trained on your business data. 
              It takes just a few minutes to set up.
            </p>
            <Button asChild className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white shadow-lg">
              <Link href="/dashboard/chatbots/new">
                <Plus className="w-4 h-4 mr-2" />
                Create New Chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: chatbot.theme_color }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge className={chatbot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {chatbot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    {chatbot.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {chatbot.description || 'No description provided'}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Model</span>
                    {getModelBadge(chatbot.ai_model)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created</span>
                    <span>{new Date(chatbot.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <Button asChild size="sm" className="flex-1 bg-[#94B9F9] hover:bg-[#94B9F9]/90 text-white">
                      <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/dashboard/chatbots/${chatbot.id}/settings`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {chatbots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{chatbots.length}</p>
                </div>
                <div className="h-10 w-10 bg-[#EBF6FC] rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-[#94B9F9]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Chatbots</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {chatbots.filter(c => c.is_active).length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {chatbots.filter(c => {
                      const created = new Date(c.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-[#F4CAF7]/20 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-[#F4CAF7]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}