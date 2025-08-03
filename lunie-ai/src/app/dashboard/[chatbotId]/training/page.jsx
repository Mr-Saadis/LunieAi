// src/app/dashboard/[chatbotId]/training/page.jsx 
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bot} from 'lucide-react'
import FileDropzone from '@/components/upload/FileDropzone'
import { 
  Upload, 
  FileText, 
  Globe, 
  MessageSquare, 
  Search,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

export default function TrainingDataPage() {
  const [trainingData, setTrainingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const params = useParams()
  const chatbotId = params.chatbotId
  const supabase = createClient()

  useEffect(() => {
    if (chatbotId) {
      fetchTrainingData()
    }
  }, [chatbotId])

  const fetchTrainingData = async () => {
    if (!chatbotId) return

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
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch training data')
      console.error(error)
    } else {
      setTrainingData(data || [])
    }

    setLoading(false)
  }

  const handleFilesAdded = (newFiles) => {
    fetchTrainingData()
    toast.success(`${newFiles.length} file(s) added successfully`)
  }

  const handleDeleteFile = async (fileItem) => {
    setDeleting(fileItem.id)
    
    try {
      const response = await fetch(`/api/files/delete/${fileItem.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success('File deleted completely from storage and database')
        fetchTrainingData()
        setDeleteConfirm(null)
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
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-700'} border-0 text-xs`}>
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
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#94B9F9]/20 border-t-[#94B9F9] rounded-full animate-spin"></div>
          <Bot className="w-6 h-6 text-[#94B9F9] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{deleteConfirm?.title}"
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3 my-4">
            <p className="text-xs font-medium text-red-800 mb-2">
              This action will:
            </p>
            <ul className="text-xs text-red-700 space-y-1">
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span>Remove the file permanently</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span>Delete all processed content</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                <span className="font-medium">Cannot be undone</span>
              </li>
            </ul>
          </div>
          
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting === deleteConfirm?.id}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteFile(deleteConfirm)}
              disabled={deleting === deleteConfirm?.id}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
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

      {/* Header - Mobile Optimized */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Training Data</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Upload and manage content to train this chatbot</p>
        </div>
      </div>

      {/* Main Content - Mobile Responsive Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Optimized Tab List */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-max grid-cols-4 gap-1 p-1 h-auto min-w-full sm:w-auto">
            <TabsTrigger 
              value="upload" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="website" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Website</span>
              <span className="sm:hidden">Website</span>
            </TabsTrigger>
            <TabsTrigger 
              value="text" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Text</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
            <TabsTrigger 
              value="qa" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Q&A Pairs</span>
              <span className="sm:hidden">Q&A</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Upload Training Files</CardTitle>
              <CardDescription className="text-sm">
                Upload documents, images, and other files to train your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone 
                onFilesAdded={handleFilesAdded}
                chatbotId={chatbotId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Tab */}
        <TabsContent value="website" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Add Website Content</CardTitle>
              <CardDescription className="text-sm">
                Import content from websites and web pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <Globe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Website scraping feature coming in Week 3!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text Tab */}
        <TabsContent value="text" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Add Text Content</CardTitle>
              <CardDescription className="text-sm">
                Manually add text content to train your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Manual text input feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qa" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Question & Answer Pairs</CardTitle>
              <CardDescription className="text-sm">
                Add specific Q&A pairs for your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Q&A management feature coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Training Data List - Mobile Optimized */}
      {trainingData.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Uploaded Files</CardTitle>
                <CardDescription className="text-sm">
                  Manage your uploaded training data
                </CardDescription>
              </div>
              
              {/* Mobile Search & Filter */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                
                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32">
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
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {filteredData.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                  {/* File Info */}
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#EBF6FC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#94B9F9]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(item.file_size)}</span>
                        <span className="hidden sm:inline">{item.file_type}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-2 sm:ml-4">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.processing_status)}
                      {getStatusBadge(item.processing_status)}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => showDeleteConfirmation(item)}
                        disabled={deleting === item.id}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        {deleting === item.id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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