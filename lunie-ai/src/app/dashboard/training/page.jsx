// //src/app/dashboard/training/page.jsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import FileDropzone from '@/components/upload/FileDropzone'
// import Link from 'next/link'    
// import { 
//   Upload, 
//   FileText, 
//   Globe, 
//   MessageSquare, 
//   Search,
//   Filter,
//   Download,
//   Trash2,
//   Eye,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   AlertTriangle
// } from 'lucide-react'
// import { toast } from 'sonner'

// export default function TrainingDataPage() {
//   const [user, setUser] = useState(null)
//   const [chatbots, setChatbots] = useState([])
//   const [selectedChatbot, setSelectedChatbot] = useState('')
//   const [trainingData, setTrainingData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState('upload')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [deleteConfirm, setDeleteConfirm] = useState(null) // For delete confirmation modal
//   const [deleting, setDeleting] = useState(null) // Track which file is being deleted

//   const supabase = createClient()

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       setUser(user)

//       if (user) {
//         // Fetch user's chatbots
//         const { data: chatbotsData } = await supabase
//           .from('chatbots')
//           .select('id, name, created_at')
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false })

//         setChatbots(chatbotsData || [])

//         // Auto-select first chatbot if available
//         if (chatbotsData && chatbotsData.length > 0) {
//           setSelectedChatbot(chatbotsData[0].id)
//         }
//       }

//       setLoading(false)
//     }

//     fetchData()
//   }, [supabase])

//   useEffect(() => {
//     if (selectedChatbot) {
//       fetchTrainingData()
//     }
//   }, [selectedChatbot])

//   const fetchTrainingData = async () => {
//     if (!selectedChatbot) return

//     const { data, error } = await supabase
//       .from('training_data')
//       .select(`
//         id,
//         type,
//         title,
//         source_url,
//         file_size,
//         file_type,
//         processing_status,
//         created_at,
//         processed_at,
//         processing_error
//       `)
//       .eq('chatbot_id', selectedChatbot)
//       .order('created_at', { ascending: false })

//     if (error) {
//       toast.error('Failed to fetch training data')
//       console.error(error)
//     } else {
//       setTrainingData(data || [])
//     }
//   }

//   const handleFilesAdded = (newFiles) => {
//     // Refresh the training data list
//     fetchTrainingData()
//     toast.success(`${newFiles.length} file(s) added successfully`)
//   }

//   // Updated delete function with proper file removal
//   const handleDeleteFile = async (fileItem) => {
//     setDeleting(fileItem.id)

//     try {
//       // Call the proper delete API endpoint
//       const response = await fetch(`/api/files/delete/${fileItem.id}`, {
//         method: 'DELETE',
//       })

//       const result = await response.json()

//       if (response.ok) {
//         toast.success('File deleted completely from storage and database')
//         fetchTrainingData() // Refresh the list
//         setDeleteConfirm(null) // Close confirmation modal
//       } else {
//         toast.error(`Delete failed: ${result.error}`)
//         console.error('Delete error:', result.error)
//       }
//     } catch (error) {
//       toast.error(`Delete failed: ${error.message}`)
//       console.error('Delete error:', error)
//     } finally {
//       setDeleting(null)
//     }
//   }

//   // Show delete confirmation modal
//   const showDeleteConfirmation = (fileItem) => {
//     setDeleteConfirm(fileItem)
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle2 className="w-4 h-4 text-green-500" />
//       case 'pending':
//         return <Clock className="w-4 h-4 text-yellow-500" />
//       case 'processing':
//         return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
//       case 'failed':
//         return <AlertCircle className="w-4 h-4 text-red-500" />
//       default:
//         return <Clock className="w-4 h-4 text-gray-400" />
//     }
//   }

//   const getStatusBadge = (status) => {
//     const variants = {
//       completed: 'bg-green-100 text-green-700',
//       pending: 'bg-yellow-100 text-yellow-700',
//       processing: 'bg-blue-100 text-blue-700',
//       failed: 'bg-red-100 text-red-700'
//     }

//     return (
//       <Badge className={`${variants[status] || 'bg-gray-100 text-gray-700'} border-0`}>
//         {status}
//       </Badge>
//     )
//   }

//   const formatFileSize = (bytes) => {
//     if (!bytes) return '0 B'
//     const k = 1024
//     const sizes = ['B', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
//   }

//   const filteredData = trainingData.filter(item => {
//     const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesFilter = filterStatus === 'all' || item.processing_status === filterStatus
//     return matchesSearch && matchesFilter
//   })

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Delete Confirmation Dialog */}
//       <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <div className="flex items-center space-x-2">
//               <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
//               <DialogTitle>Confirm Deletion</DialogTitle>
//             </div>
//             <DialogDescription>
//               Are you sure you want to delete{" "}
//               <span className="font-semibold text-gray-900">
//                 "{deleteConfirm?.title}"
//               </span>
//               ?
//             </DialogDescription>
//           </DialogHeader>

//           <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
//             <p className="text-sm font-medium text-red-800 mb-2">
//               This action will:
//             </p>
//             <ul className="text-sm text-red-700 space-y-1">
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span>Remove the file from storage permanently</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span>Delete all processed content and chunks</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span>Remove AI training data and embeddings</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span className="font-medium">Cannot be undone</span>
//               </li>
//             </ul>
//           </div>

//           <DialogFooter className="gap-2 sm:gap-0">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setDeleteConfirm(null)}
//               disabled={deleting === deleteConfirm?.id}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={() => handleDeleteFile(deleteConfirm)}
//               disabled={deleting === deleteConfirm?.id}
//               className="bg-red-600 hover:bg-red-700 text-white"
//             >
//               {deleting === deleteConfirm?.id ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 'Delete Permanently'
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-semibold text-gray-900 mb-2">Training Data</h1>
//         <p className="text-gray-600">Upload and manage content to train your chatbots</p>
//       </div>

//       {/* Chatbot Selection */}
//       <Card className="border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-lg">Select Chatbot</CardTitle>
//           <CardDescription>
//             Choose which chatbot you want to add training data to
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {chatbots.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-600 mb-4">You haven't created any chatbots yet.</p>
//               <Button asChild className="bg-[#94B9F9] hover:bg-[#94B9F9]/90">
//                 <Link href="/dashboard/chatbots/new">
//                   Create Your First Chatbot
//                 </Link>
//               </Button>
//             </div>
//           ) : (
//             <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
//               <SelectTrigger className="w-full max-w-sm">
//                 <SelectValue placeholder="Select a chatbot" />
//               </SelectTrigger>
//               <SelectContent>
//                 {chatbots.map((chatbot) => (
//                   <SelectItem key={chatbot.id} value={chatbot.id}>
//                     {chatbot.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           )}
//         </CardContent>
//       </Card>

//       {/* Main Content - Only show if chatbot is selected */}
//       {selectedChatbot && (
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
//             <TabsTrigger value="upload" className="flex items-center gap-2">
//               <Upload className="w-4 h-4" />
//               Upload Files
//             </TabsTrigger>
//             <TabsTrigger value="website" className="flex items-center gap-2">
//               <Globe className="w-4 h-4" />
//               Add Website
//             </TabsTrigger>
//             <TabsTrigger value="text" className="flex items-center gap-2">
//               <FileText className="w-4 h-4" />
//               Add Text
//             </TabsTrigger>
//             <TabsTrigger value="qa" className="flex items-center gap-2">
//               <MessageSquare className="w-4 h-4" />
//               Q&A Pairs
//             </TabsTrigger>
//           </TabsList>

//           {/* File Upload Tab */}
//           <TabsContent value="upload" className="space-y-6">
//             <Card className="border-gray-200">
//               <CardHeader>
//                 <CardTitle>Upload Training Files</CardTitle>
//                 <CardDescription>
//                   Upload documents, images, and other files to train your chatbot
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <FileDropzone 
//                   onFilesAdded={handleFilesAdded}
//                   chatbotId={selectedChatbot}
//                 />
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Website Tab */}
//           <TabsContent value="website" className="space-y-6">
//             <Card className="border-gray-200">
//               <CardHeader>
//                 <CardTitle>Add Website Content</CardTitle>
//                 <CardDescription>
//                   Import content from websites and web pages
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center py-12 text-gray-500">
//                   <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p>Website scraping feature coming in Week 3!</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Text Tab */}
//           <TabsContent value="text" className="space-y-6">
//             <Card className="border-gray-200">
//               <CardHeader>
//                 <CardTitle>Add Text Content</CardTitle>
//                 <CardDescription>
//                   Manually add text content to train your chatbot
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center py-12 text-gray-500">
//                   <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p>Manual text input feature coming soon!</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Q&A Tab */}
//           <TabsContent value="qa" className="space-y-6">
//             <Card className="border-gray-200">
//               <CardHeader>
//                 <CardTitle>Question & Answer Pairs</CardTitle>
//                 <CardDescription>
//                   Add specific Q&A pairs for your chatbot
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center py-12 text-gray-500">
//                   <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p>Q&A management feature coming soon!</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       )}

//       {/* Training Data List */}
//       {selectedChatbot && trainingData.length > 0 && (
//         <Card className="border-gray-200">
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Uploaded Files</CardTitle>
//                 <CardDescription>
//                   Manage your uploaded training data
//                 </CardDescription>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Search className="w-4 h-4 text-gray-400" />
//                   <Input
//                     placeholder="Search files..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-64"
//                   />
//                 </div>
//                 <Select value={filterStatus} onValueChange={setFilterStatus}>
//                   <SelectTrigger className="w-32">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="processing">Processing</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                     <SelectItem value="failed">Failed</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {filteredData.map((item) => (
//                 <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                   <div className="flex items-center space-x-4">
//                     <div className="w-10 h-10 bg-[#EBF6FC] rounded-lg flex items-center justify-center">
//                       <FileText className="w-5 h-5 text-[#94B9F9]" />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-gray-900">{item.title}</h4>
//                       <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
//                         <span>{formatFileSize(item.file_size)}</span>
//                         <span>{item.file_type}</span>
//                         <span>{new Date(item.created_at).toLocaleDateString()}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-4">
//                     <div className="flex items-center space-x-2">
//                       {getStatusIcon(item.processing_status)}
//                       {getStatusBadge(item.processing_status)}
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <Button size="sm" variant="outline">
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                       <Button 
//                         size="sm" 
//                         variant="outline"
//                         onClick={() => showDeleteConfirmation(item)}
//                         disabled={deleting === item.id}
//                         className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
//                       >
//                         {deleting === item.id ? (
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Trash2 className="w-4 h-4" />
//                         )}
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }



'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Filter,
  Bot,
  FileImage,
  FileSpreadsheet,
  X,
  Calendar,
  BarChart3,
  Type,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'
import FileDropzone from '@/components/upload/FileDropzone'

// Mock FileDropzone component
// const FileDropzone = ({ onFilesAdded, chatbotId }) => {
//   const [uploading, setUploading] = useState(false)

//   const handleFileUpload = async (files) => {
//     setUploading(true)
//     // Simulate file upload
//     setTimeout(() => {
//       onFilesAdded(files)
//       setUploading(false)
//     }, 2000)
//   }

//   return (
//     <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//       <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//       <h3 className="text-lg font-medium text-gray-900 mb-2">
//         {uploading ? 'Uploading...' : 'Upload your files'}
//       </h3>
//       <p className="text-sm text-gray-500 mb-4">
//         Drag and drop your files here, or click to browse
//         <br />
//         Supports: PDF, Word, Excel, Images (max 10MB)
//       </p>
//       <Button
//         onClick={() => handleFileUpload([{ name: 'Sample File.pdf' }])}
//         disabled={uploading}
//       >
//         {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//         Choose Files
//       </Button>
//     </div>
//   )
// }

// Enhanced Processing Status Badge Component
const ProcessingStatusBadge = ({ status, metadata = {}, fileType }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2,
          text: 'Completed'
        }
      case 'pending':
        return {
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock,
          text: 'Pending'
        }
      case 'processing':
        return {
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Loader2,
          text: 'Processing'
        }
      case 'failed':
        return {
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
          text: 'Failed'
        }
      default:
        return {
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Clock,
          text: status || 'Unknown'
        }
    }
  }

  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Badge className={`${config.className} border text-xs flex items-center gap-1`}>
      <StatusIcon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.text}
    </Badge>
  )
}

// File Content Viewer Modal
const FileViewerModal = ({ file, isOpen, onClose }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && file) {
      fetchFileContent()
    }
  }, [isOpen, file])

  const fetchFileContent = async () => {
    setLoading(true)
    try {
      // Simulate API call to fetch file content
      setTimeout(() => {
        setContent(`This is the processed content from ${file.title}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`)
        setLoading(false)
      }, 1000)
    } catch (error) {
      toast.error('Failed to load file content')
      setLoading(false)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType?.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    if (fileType?.includes('document') || fileType?.includes('docx')) return <FileText className="w-5 h-5 text-blue-600" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const formatMetadata = (metadata) => {
    if (!metadata || typeof metadata !== 'object') return []

    const items = []

    // Word count
    if (metadata.wordCount) {
      items.push({ label: 'Word Count', value: metadata.wordCount.toLocaleString(), icon: Type })
    }

    // Pages for PDF
    if (metadata.pages) {
      items.push({ label: 'Pages', value: metadata.pages, icon: FileText })
    }

    // Processing time
    if (metadata.processingTimeMs) {
      items.push({ label: 'Processing Time', value: `${(metadata.processingTimeMs / 1000).toFixed(2)}s`, icon: Clock })
    }

    // File type specific metadata
    if (metadata.fileType) {
      items.push({ label: 'Processing Method', value: metadata.fileType, icon: BarChart3 })
    }

    // Image dimensions
    if (metadata.serviceMetadata?.image_dimensions) {
      const [width, height] = metadata.serviceMetadata.image_dimensions
      items.push({ label: 'Dimensions', value: `${width} × ${height}`, icon: FileImage })
    }

    return items
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] mx-4">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.file_type)}
              <div>
                <DialogTitle className="text-lg font-semibold">{file.title}</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {file.file_type} • {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleString()}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Metadata */}
          {file.metadata && Object.keys(file.metadata).length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-sm text-gray-900 mb-3">File Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formatMetadata(file.metadata).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-sm font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Processing Status:</span>
              <ProcessingStatusBadge
                status={file.processing_status}
                metadata={file.metadata}
                fileType={file.file_type}
              />
            </div>
            {file.processed_at && (
              <div className="text-xs text-gray-500">
                Processed on {new Date(file.processed_at).toLocaleString()}
              </div>
            )}
          </div>

          {/* File Content */}
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Processed Content</h4>
            <ScrollArea className="h-96 w-full border rounded-lg">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading content...</span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {content || 'No content available'}
                  </pre>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TrainingDataPage() {
  // const [trainingData, setTrainingData] = useState([
  //   {
  //     id: '1',
  //     type: 'file',
  //     title: 'Company Handbook.pdf',
  //     source_url: null,
  //     file_size: 2048576,
  //     file_type: 'application/pdf',
  //     processing_status: 'completed',
  //     created_at: '2025-01-15T10:30:00.000Z',
  //     processed_at: '2025-01-15T10:32:15.000Z',
  //     metadata: {
  //       pages: 25,
  //       fileInfo: {
  //         Title: "Company Employee Handbook",
  //         Creator: "HR Department",
  //         ModDate: "D:20250115103000+00'00'",
  //         Producer: "Adobe PDF Library",
  //         CreationDate: "D:20250115103000+00'00'"
  //       },
  //       wordCount: 15420,
  //       processingTimeMs: 5200
  //     }
  //   },
  //   {
  //     id: '2',
  //     type: 'file',
  //     title: 'Product Catalog.xlsx',
  //     source_url: null,
  //     file_size: 1536000,
  //     file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     processing_status: 'completed',
  //     created_at: '2025-01-15T11:45:00.000Z',
  //     processed_at: '2025-01-15T11:46:30.000Z',
  //     metadata: {
  //       fileType: 'xlsx',
  //       wordCount: 3245,
  //       sheets: 5,
  //       processingTimeMs: 2800
  //     }
  //   },
  //   {
  //     id: '3',
  //     type: 'file',
  //     title: 'Registration Form.png',
  //     source_url: null,
  //     file_size: 202851,
  //     file_type: 'image/png',
  //     processing_status: 'completed',
  //     created_at: '2025-01-15T14:20:00.000Z',
  //     processed_at: '2025-01-15T14:21:45.000Z',
  //     metadata: {
  //       enhanced: true,
  //       fileType: "image_fastapi_ocr",
  //       language: "eng",
  //       wordCount: 205,
  //       chunkCount: 2,
  //       serviceMetadata: {
  //         file_size: 202851,
  //         raw_text_length: 1062,
  //         image_dimensions: [1920, 1020],
  //         original_filename: "Registration Form.png",
  //         processed_dimensions: [1920, 1020],
  //         processed_text_length: 1068
  //       },
  //       processingMethod: "fastapi_ocr",
  //       processingTimeMs: 3488,
  //       pythonProcessingTime: 3.457
  //     }
  //   },
  //   {
  //     id: '4',
  //     type: 'file',
  //     title: 'Service Agreement.docx',
  //     source_url: null,
  //     file_size: 524288,
  //     file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //     processing_status: 'processing',
  //     created_at: '2025-01-15T15:10:00.000Z',
  //     processed_at: null,
  //     metadata: {
  //       fileType: "docx",
  //       wordCount: 904,
  //       originalLength: 7940,
  //       conversionMessages: []
  //     }
  //   }
  // ])

  const [trainingData, setTrainingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewingFile, setViewingFile] = useState(null)

  const params = useParams()
  const chatbotId = params?.chatbotId || '123'
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
        processing_error,
        metadata,
        
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



  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getWordCount = (metadata) => {
    if (metadata?.wordCount) {
      return metadata.wordCount.toLocaleString()
    }
    return 'N/A'
  }

  const getProcessingInfo = (item) => {
    const info = []

    if (item.metadata?.wordCount) {
      info.push(`${item.metadata.wordCount.toLocaleString()} words`)
    }

    if (item.metadata?.pages) {
      info.push(`${item.metadata.pages} pages`)
    }

    if (item.metadata?.processingTimeMs) {
      info.push(`${(item.metadata.processingTimeMs / 1000).toFixed(1)}s processing`)
    }

    return info.length > 0 ? info.join(' • ') : 'Basic info'
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

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
    if (fileType?.includes('image')) return <FileImage className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
    if (fileType?.includes('document') || fileType?.includes('docx')) return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
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

      {/* File Viewer Modal */}
      <FileViewerModal
        file={viewingFile}
        isOpen={!!viewingFile}
        onClose={() => setViewingFile(null)}
      />

      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Training Data</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Upload and manage content to train this chatbot</p>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

      {/* Training Data List */}
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

              {/* Search & Filter */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>

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
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors">
                  <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    {/* File Info */}
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border">
                        {getFileIcon(item.file_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate mb-1">
                          {item.title}
                        </h4>
                        <div className="space-y-1">
                          {/* Primary info line */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(item.file_size)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Type className="w-3 h-3" />
                              {getWordCount(item.metadata)} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {/* Secondary info line */}
                          <div className="text-xs text-gray-400">
                            {getProcessingInfo(item)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-3 sm:ml-4">
                      {/* Status */}
                      <div className="flex flex-col items-start sm:items-end space-y-1">
                        <ProcessingStatusBadge
                          status={item.processing_status}
                          metadata={item.metadata}
                          fileType={item.file_type}
                        />
                        {item.processed_at && (
                          <div className="text-xs text-gray-400">
                            Processed: {new Date(item.processed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingFile(item)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                          title="View file content"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showDeleteConfirmation(item)}
                          disabled={deleting === item.id}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          title="Delete file"
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
                </div>
              ))}

              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {searchTerm || filterStatus !== 'all'
                      ? 'No files match your search criteria'
                      : 'No training files uploaded yet'}
                  </p>
                  {(searchTerm || filterStatus !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterStatus('all')
                      }}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state when no files */}
      {trainingData.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No training data yet</h3>
              <p className="text-gray-500 mb-4">
                Upload your first file to start training your chatbot
              </p>
              <Button onClick={() => setActiveTab('upload')}>
                Upload Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}