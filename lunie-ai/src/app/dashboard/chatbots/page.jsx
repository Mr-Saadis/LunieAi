// src/app/dashboard/chatbots/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Bot, 
  Plus, 
  Search,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Copy,
  Archive,
  Trash2,
  Play,
  BarChart3,
  Database,
  Eye,
  Settings,
  RefreshCw,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState([])
  const [filteredChatbots, setFilteredChatbots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')
  // Removed viewMode state - always use list view
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchChatbots()
  }, [])

  useEffect(() => {
    filterAndSortChatbots()
  }, [chatbots, searchTerm, filterStatus, sortBy])

  const fetchChatbots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: chatbotsData, error } = await supabase
        .from('chatbots')
        .select(`
          *,
          training_data (count),
          conversations (count)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Process the data to get counts
      const processedChatbots = chatbotsData.map(chatbot => ({
        ...chatbot,
        training_count: chatbot.training_data?.length || 0,
        conversation_count: chatbot.conversations?.length || 0
      }))

      setChatbots(processedChatbots)
      
      // Calculate stats
      const total = processedChatbots.length
      const active = processedChatbots.filter(c => c.is_active).length
      const inactive = total - active
      setStats({ total, active, inactive })

    } catch (error) {
      console.error('Error fetching chatbots:', error)
      toast.error('Failed to load chatbots')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortChatbots = () => {
    let filtered = chatbots

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(chatbot =>
        chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chatbot.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(chatbot => {
        if (filterStatus === 'active') return chatbot.is_active
        if (filterStatus === 'inactive') return !chatbot.is_active
        return true
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'updated_at':
          return new Date(b.updated_at) - new Date(a.updated_at)
        case 'conversations':
          return (b.conversation_count || 0) - (a.conversation_count || 0)
        default:
          return new Date(b.updated_at) - new Date(a.updated_at)
      }
    })

    setFilteredChatbots(filtered)
  }

  const handleChatbotAction = async (chatbot, action) => {
    try {
      switch (action) {
        case 'view_playground':
          router.push(`/dashboard/${chatbot.id}/playground`)
          break
        case 'edit_training':
          router.push(`/dashboard/${chatbot.id}/training`)
          break
        case 'view_analytics':
          router.push(`/dashboard/${chatbot.id}/analytics`)
          break
        case 'edit_settings':
          router.push(`/dashboard/${chatbot.id}/settings`)
          break
        case 'duplicate':
          await duplicateChatbot(chatbot)
          break
        case 'toggle_status':
          await toggleChatbotStatus(chatbot)
          break
        case 'archive':
          await archiveChatbot(chatbot)
          break
        case 'delete':
          await deleteChatbot(chatbot)
          break
      }
    } catch (error) {
      console.error('Action failed:', error)
      toast.error('Action failed. Please try again.')
    }
  }

  const duplicateChatbot = async (chatbot) => {
    const newName = `${chatbot.name} (Copy)`
    toast.success(`Creating copy: ${newName}`)
    // TODO: Implement actual duplication logic
  }

  const toggleChatbotStatus = async (chatbot) => {
    const { error } = await supabase
      .from('chatbots')
      .update({ is_active: !chatbot.is_active })
      .eq('id', chatbot.id)

    if (error) throw error

    toast.success(`Chatbot ${chatbot.is_active ? 'deactivated' : 'activated'}`)
    fetchChatbots()
  }

  const archiveChatbot = async (chatbot) => {
    // TODO: Add archived field to schema
    toast.success(`${chatbot.name} archived`)
  }

  const deleteChatbot = async (chatbot) => {
    if (!confirm(`Are you sure you want to delete "${chatbot.name}"? This action cannot be undone.`)) {
      return
    }

    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', chatbot.id)

    if (error) throw error

    toast.success(`${chatbot.name} deleted`)
    fetchChatbots()
  }

  const getAIModelDisplay = (model) => {
    const models = {
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gemini-pro': 'Gemini Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash'
    }
    return models[model] || model
  }

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Updated just now'
    if (diffInHours < 24) return `Updated ${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Updated yesterday'
    return `Updated ${date.toLocaleDateString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Manage Your Chatbots</h1>
            <p className="text-sm md:text-base text-gray-600">Create, manage, and monitor your chatbots in one place.</p>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
              <span>Total: <strong className="text-gray-900">{stats.total}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Active: <strong className="text-green-600">{stats.active}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Inactive: <strong className="text-gray-600">{stats.inactive}</strong></span>
            </div>
          </div>
          <Button asChild className="bg-[#94B9F9] hover:bg-[#94B9F9]/90 w-full md:w-auto">
            <Link href="/dashboard/chatbots/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Chatbot
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="border-gray-200">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-3 md:space-y-0 md:flex md:gap-4 md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search chatbots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Last Updated</SelectItem>
                      <SelectItem value="created_at">Date Created</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="conversations">Conversations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" onClick={fetchChatbots}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chatbots Display */}
        {filteredChatbots.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-8 md:p-12 text-center">
              <Bot className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No chatbots found' : 'No chatbots yet'}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first AI chatbot to get started'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button asChild className="bg-[#94B9F9] hover:bg-[#94B9F9]/90 w-full md:w-auto">
                  <Link href="/dashboard/chatbots/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Chatbot
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Mobile List View - Always visible on mobile */}
            <div className="md:hidden space-y-4">
              {filteredChatbots.map((chatbot, index) => (
                <Card key={`mobile-${chatbot.id}`} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Mobile Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                          <div className="w-8 h-8 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 truncate text-sm">{chatbot.name}</h3>
                              <div className={`w-2 h-2 rounded-full ${chatbot.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <p className="text-xs text-gray-500">{formatLastUpdated(chatbot.updated_at)}</p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'view_playground')}>
                              <Play className="w-4 h-4 mr-2" />
                              Playground
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'edit_training')}>
                              <Database className="w-4 h-4 mr-2" />
                              Training
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'view_analytics')}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'edit_settings')}>
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'duplicate')}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'toggle_status')}>
                              {chatbot.is_active ? <Archive className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                              {chatbot.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleChatbotAction(chatbot, 'delete')}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Mobile Stats */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Training Data</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Number of files and content used to train this chatbot</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="font-medium text-gray-900">{chatbot.training_count} files</div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">AI Model</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The AI model powering this chatbot's responses</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-[#94B9F9]" />
                            <span className="font-medium text-gray-900 text-xs">{getAIModelDisplay(chatbot.ai_model)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Action Button */}
                      <Button 
                        onClick={() => handleChatbotAction(chatbot, 'view_playground')}
                        className="w-full bg-[#94B9F9] hover:bg-[#94B9F9]/90"
                        size="sm"
                      >
                        Open Playground
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop List View - Always list view now */}
            <div className="hidden md:block space-y-4">
              {filteredChatbots.map((chatbot, index) => (
                <Card key={`desktop-${chatbot.id}`} className="border-gray-200 hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-4">
                    {/* Desktop List View */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <div className="w-10 h-10 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-xl flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{chatbot.name}</h3>
                              <div className={`w-2 h-2 rounded-full ${chatbot.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <p className="text-sm text-gray-500">{formatLastUpdated(chatbot.updated_at)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <div className="font-medium">{chatbot.training_count}</div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Number of training files</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="text-gray-500">Files</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <div className="font-medium">{getAIModelDisplay(chatbot.ai_model)}</div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>AI model used for responses</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="text-gray-500">AI Model</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {chatbot.is_public ? 'Public' : 'Private'}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Chatbot visibility setting</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">No usage yet</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleChatbotAction(chatbot, 'view_playground')}
                          >
                            View Playground
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'edit_training')}>
                                <Database className="w-4 h-4 mr-2" />
                                Edit Training
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'view_analytics')}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'edit_settings')}>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'duplicate')}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChatbotAction(chatbot, 'toggle_status')}>
                                {chatbot.is_active ? <Archive className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                {chatbot.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleChatbotAction(chatbot, 'delete')}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}