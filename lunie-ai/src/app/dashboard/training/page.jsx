'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import FileDropzone from '@/components/upload/FileDropzone'
import Link from 'next/link'    
import { 
  Upload, 
  FileText, 
  Globe, 
  MessageSquare, 
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export default function TrainingDataPage() {
  const [user, setUser] = useState(null)
  const [chatbots, setChatbots] = useState([])
  const [selectedChatbot, setSelectedChatbot] = useState('')
  const [trainingData, setTrainingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // For delete confirmation modal
  const [deleting, setDeleting] = useState(null) // Track which file is being deleted
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch user's chatbots
        const { data: chatbotsData } = await supabase
          .from('chatbots')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setChatbots(chatbotsData || [])
        
        // Auto-select first chatbot if available
        if (chatbotsData && chatbotsData.length > 0) {
          setSelectedChatbot(chatbotsData[0].id)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  useEffect(() => {
    if (selectedChatbot) {
      fetchTrainingData()
    }
  }, [selectedChatbot])

  const fetchTrainingData = async () => {
    if (!selectedChatbot) return

    const { data, error } = await supabase
      .from('training_data')
      .select(`
        id,
        type,
        title,
        source_url,
        file_size,
        file_type,
        processing_status,
        created_at,
        processed_at,
        processing_error
      `)
      .eq('chatbot_id', selectedChatbot)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch training data')
      console.error(error)
    } else {
      setTrainingData(data || [])
    }
  }

  const handleFilesAdded = (newFiles) => {
    // Refresh the training data list
    fetchTrainingData()
    toast.success(`${newFiles.length} file(s) added successfully`)
  }

  // Updated delete function with proper file removal
  const handleDeleteFile = async (fileItem) => {
    setDeleting(fileItem.id)
    
    try {
      // Call the proper delete API endpoint
      const response = await fetch(`/api/files/delete/${fileItem.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('File deleted completely from storage and database')
        fetchTrainingData() // Refresh the list
        setDeleteConfirm(null) // Close confirmation modal
      } else {
        toast.error(`Delete failed: ${result.error}`)
        console.error('Delete error:', result.error)
      }
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`)
      console.error('Delete error:', error)
    } finally {
      setDeleting(null)
    }
  }

  // Show delete confirmation modal
  const showDeleteConfirmation = (fileItem) => {
    setDeleteConfirm(fileItem)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700'
    }
    
    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-700'} border-0`}>
        {status}
      </Badge>
    )
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const filteredData = trainingData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.processing_status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <DialogTitle>Confirm Deletion</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{deleteConfirm?.title}"
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-sm font-medium text-red-800 mb-2">
              This action will:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span>Remove the file from storage permanently</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span>Delete all processed content and chunks</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span>Remove AI training data and embeddings</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span className="font-medium">Cannot be undone</span>
              </li>
            </ul>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting === deleteConfirm?.id}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteFile(deleteConfirm)}
              disabled={deleting === deleteConfirm?.id}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting === deleteConfirm?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Training Data</h1>
        <p className="text-gray-600">Upload and manage content to train your chatbots</p>
      </div>

      {/* Chatbot Selection */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Select Chatbot</CardTitle>
          <CardDescription>
            Choose which chatbot you want to add training data to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chatbots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't created any chatbots yet.</p>
              <Button asChild className="bg-[#94B9F9] hover:bg-[#94B9F9]/90">
                <Link href="/dashboard/chatbots/new">
                  Create Your First Chatbot
                </Link>
              </Button>
            </div>
          ) : (
            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Select a chatbot" />
              </SelectTrigger>
              <SelectContent>
                {chatbots.map((chatbot) => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>
                    {chatbot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Main Content - Only show if chatbot is selected */}
      {selectedChatbot && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Add Website
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Add Text
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Q&A Pairs
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Upload Training Files</CardTitle>
                <CardDescription>
                  Upload documents, images, and other files to train your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDropzone 
                  onFilesAdded={handleFilesAdded}
                  chatbotId={selectedChatbot}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Add Website Content</CardTitle>
                <CardDescription>
                  Import content from websites and web pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Website scraping feature coming in Week 3!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Tab */}
          <TabsContent value="text" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Add Text Content</CardTitle>
                <CardDescription>
                  Manually add text content to train your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Manual text input feature coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Question & Answer Pairs</CardTitle>
                <CardDescription>
                  Add specific Q&A pairs for your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Q&A management feature coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Training Data List */}
      {selectedChatbot && trainingData.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  Manage your uploaded training data
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[#EBF6FC] rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#94B9F9]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(item.file_size)}</span>
                        <span>{item.file_type}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.processing_status)}
                      {getStatusBadge(item.processing_status)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => showDeleteConfirmation(item)}
                        disabled={deleting === item.id}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        {deleting === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}