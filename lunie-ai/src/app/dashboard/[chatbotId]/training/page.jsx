

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { useParams } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Badge } from '@/components/ui/badge'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import WebsiteURLInput from '@/components/training/WebsiteURLInput'
// import WebsiteManagementDashboard from '@/components/training/WebsiteManagementDashboard'

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Upload,
//   FileText,
//   Globe,
//   MessageSquare,
//   Search,
//   Trash2,
//   Eye,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   AlertTriangle,
//   Filter,
//   Bot,
//   FileImage,
//   FileSpreadsheet,
//   X,
//   Calendar,
//   BarChart3,
//   Type,
//   HardDrive
// } from 'lucide-react'
// import { toast } from 'sonner'
// import FileDropzone from '@/components/upload/FileDropzone'

// // Enhanced Processing Status Badge Component
// const ProcessingStatusBadge = ({ status, metadata = {}, fileType }) => {
//   const getStatusConfig = (status) => {
//     switch (status) {
//       case 'completed':
//         return {
//           className: 'bg-green-100 text-green-700 border-green-200',
//           icon: CheckCircle2,
//           text: 'Completed'
//         }
//       case 'pending':
//         return {
//           className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//           icon: Clock,
//           text: 'Pending'
//         }
//       case 'processing':
//         return {
//           className: 'bg-blue-100 text-blue-700 border-blue-200',
//           icon: Loader2,
//           text: 'Processing'
//         }
//       case 'failed':
//         return {
//           className: 'bg-red-100 text-red-700 border-red-200',
//           icon: AlertCircle,
//           text: 'Failed'
//         }
//       default:
//         return {
//           className: 'bg-gray-100 text-gray-700 border-gray-200',
//           icon: Clock,
//           text: status || 'Unknown'
//         }
//     }
//   }

//   const config = getStatusConfig(status)
//   const StatusIcon = config.icon

//   return (
//     <Badge className={`${config.className} border text-xs flex items-center gap-1`}>
//       <StatusIcon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
//       {config.text}
//     </Badge>
//   )
// }

// // File Content Viewer Modal
// // File Content Viewer Modal - Updated with Real API
// const FileViewerModal = ({ file, isOpen, onClose }) => {
//   const [content, setContent] = useState('')
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (isOpen && file) {
//       fetchFileContent()
//     }
//   }, [isOpen, file])

//   const fetchFileContent = async () => {
//     setLoading(true)
//     try {
//       // Real API call to fetch file content
//       const response = await fetch(`/api/files/content/${file.id}`)

//       if (response.ok) {
//         const data = await response.json()
//         setContent(data.content || 'No content available')
//       } else {
//         const error = await response.json()
//         setContent(`Error loading content: ${error.error || 'Unknown error'}`)
//         toast.error('Failed to load file content')
//       }
//     } catch (error) {
//       console.error('Error fetching file content:', error)
//       setContent('Network error occurred while loading content')
//       toast.error('Failed to load file content')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getFileIcon = (fileType) => {
//     if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
//     if (fileType?.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />
//     if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
//     if (fileType?.includes('document') || fileType?.includes('docx')) return <FileText className="w-5 h-5 text-blue-600" />
//     return <FileText className="w-5 h-5 text-gray-500" />
//   }

//   const formatFileSize = (bytes) => {
//     if (!bytes) return '0 B'
//     const k = 1024
//     const sizes = ['B', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
//   }

//   const formatMetadata = (metadata) => {
//     if (!metadata || typeof metadata !== 'object') return []

//     const items = []

//     // Word count
//     if (metadata.wordCount) {
//       items.push({
//         label: 'Word Count',
//         value: metadata.wordCount.toLocaleString(),
//         icon: Type
//       })
//     }

//     // Pages for PDF
//     if (metadata.pages) {
//       items.push({
//         label: 'Pages',
//         value: metadata.pages,
//         icon: FileText
//       })
//     }

//     // Processing time
//     if (metadata.processingTimeMs) {
//       items.push({
//         label: 'Processing Time',
//         value: `${(metadata.processingTimeMs / 1000).toFixed(2)}s`,
//         icon: Clock
//       })
//     }

//     // File type specific metadata
//     if (metadata.fileType) {
//       items.push({
//         label: 'Processing Method',
//         value: metadata.fileType,
//         icon: BarChart3
//       })
//     }

//     // Language for OCR
//     if (metadata.language) {
//       items.push({
//         label: 'Language',
//         value: metadata.language.toUpperCase(),
//         icon: Globe
//       })
//     }

//     // Image dimensions
//     if (metadata.serviceMetadata?.image_dimensions) {
//       const [width, height] = metadata.serviceMetadata.image_dimensions
//       items.push({
//         label: 'Dimensions',
//         value: `${width} × ${height}`,
//         icon: FileImage
//       })
//     }

//     // Chunks for processed content
//     if (metadata.chunkCount) {
//       items.push({
//         label: 'Text Chunks',
//         value: metadata.chunkCount,
//         icon: BarChart3
//       })
//     }

//     // Enhanced flag for images
//     if (metadata.enhanced) {
//       items.push({
//         label: 'Enhanced OCR',
//         value: 'Yes',
//         icon: CheckCircle2
//       })
//     }

//     return items
//   }

//   if (!file) return null

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[93vh] m-4">
//         <DialogHeader className="pb-4">
//           <div className="flex items-start justify-between">
//             <div className="flex items-center space-x-3">
//               {getFileIcon(file.file_type)}
//               <div>
//                 <DialogTitle className="text-lg font-semibold">{file.title}</DialogTitle>
//                 <DialogDescription className="text-sm mt-1">
//                   {file.file_type} • {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleString()}
//                 </DialogDescription>
//               </div>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* File Metadata */}
//           {file.metadata && Object.keys(file.metadata).length > 0 && (
//             <div className="border rounded-lg p-4 bg-gray-50">
//               <h4 className="font-medium text-sm text-gray-900 mb-3">File Information</h4>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {formatMetadata(file.metadata).map((item, index) => (
//                   <div key={index} className="flex items-center space-x-2">
//                     <item.icon className="w-4 h-4 text-gray-500" />
//                     <div>
//                       <div className="text-xs text-gray-500">{item.label}</div>
//                       <div className="text-sm font-medium">{item.value}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Processing Status */}
//           <div className="flex items-center justify-between p-3 pb-2 bg-gray-50 rounded-lg">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm font-medium text-gray-700">Processing Status:</span>
//               <ProcessingStatusBadge
//                 status={file.processing_status}
//                 metadata={file.metadata}
//                 fileType={file.file_type}
//               />
//             </div>
//             {file.processed_at && (
//               <div className="text-xs text-gray-500">
//                 Processed on {new Date(file.processed_at).toLocaleString()}
//               </div>
//             )}
//           </div>

//           {/* Processing Error (if any) */}
//           {file.processing_error && (
//             <div className="border rounded-lg p-3 bg-red-50 border-red-200">
//               <div className="flex items-center space-x-2 mb-2">
//                 <AlertCircle className="w-4 h-4 text-red-500" />
//                 <h4 className="font-medium text-sm text-red-900">Processing Error</h4>
//               </div>
//               <p className="text-sm text-red-700">{file.processing_error}</p>
//             </div>
//           )}

//           {/* File Content */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="font-medium text-sm text-gray-900">Processed Content</h4>
//               {content && !loading && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => {
//                     navigator.clipboard.writeText(content)
//                     toast.success('Content copied to clipboard')
//                   }}
//                 >
//                   Copy Content
//                 </Button>
//               )}
//             </div>

//             <ScrollArea className="h-45  w-full border rounded-lg">
//               <div className="p-4">
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
//                     <span className="ml-2 text-sm text-gray-500">Loading content...</span>
//                   </div>
//                 ) : file.processing_status === 'failed' ? (
//                   <div className="flex flex-col items-center justify-center py-8 text-gray-500">
//                     <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
//                     <p className="text-sm">Content not available due to processing failure</p>
//                     {file.processing_error && (
//                       <p className="text-xs text-red-600 mt-2">{file.processing_error}</p>
//                     )}
//                   </div>
//                 ) : file.processing_status === 'pending' || file.processing_status === 'processing' ? (
//                   <div className="flex flex-col items-center justify-center py-8 text-gray-500">
//                     <Clock className="w-12 h-12 mb-3 opacity-50" />
//                     <p className="text-sm">Content will be available after processing completes</p>
//                   </div>
//                 ) : (
//                   <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
//                     {content || 'No content available'}
//                   </pre>
//                 )}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>

//         <DialogFooter className="flex items-center justify-between">
//           <div className="text-xs  text-gray-500">
//             File ID: {file.id}
//           </div>
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default function TrainingDataPage() {

//   const [trainingData, setTrainingData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState('upload')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterStatus, setFilterStatus] = useState('all')
//   const [deleteConfirm, setDeleteConfirm] = useState(null)
//   const [deleting, setDeleting] = useState(null)
//   const [viewingFile, setViewingFile] = useState(null)

//   const params = useParams()
//   const chatbotId = params?.chatbotId || '123'
//   const supabase = createClient()

//   useEffect(() => {
//     if (chatbotId) {
//       fetchTrainingData()
//     }
//   }, [chatbotId])
//   const fetchTrainingData = async () => {
//     if (!chatbotId) return

//     const { data, error } = await supabase
//       .from('training_data')
//       .select(`
//         *
//       `)
//       .eq('chatbot_id', chatbotId)
//       .order('created_at', { ascending: false })

//     if (error) {
//       toast.error('Failed to fetch training data')
//       console.error(error)
//     } else {
//       setTrainingData(data || [])
//     }

//     setLoading(false)
//   }



//   const formatFileSize = (bytes) => {
//     if (!bytes) return '0 B'
//     const k = 1024
//     const sizes = ['B', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
//   }

//   const getWordCount = (metadata) => {
//     if (metadata?.wordCount) {
//       return metadata.wordCount.toLocaleString()
//     }
//     return 'N/A'
//   }

//   const getProcessingInfo = (item) => {
//     const info = []

//     if (item.metadata?.wordCount) {
//       info.push(`${item.metadata.wordCount.toLocaleString()} words`)
//     }

//     if (item.metadata?.pages) {
//       info.push(`${item.metadata.pages} pages`)
//     }

//     if (item.metadata?.processingTimeMs) {
//       info.push(`${(item.metadata.processingTimeMs / 1000).toFixed(1)}s processing`)
//     }

//     return info.length > 0 ? info.join(' • ') : 'Basic info'
//   }

//   const handleFilesAdded = (newFiles) => {
//     fetchTrainingData()
//     toast.success(`${newFiles.length} file(s) added successfully`)
//   }

//   const handleDeleteFile = async (fileItem) => {
//     setDeleting(fileItem.id)

//     try {
//       const response = await fetch(`/api/files/delete/${fileItem.id}`, {
//         method: 'DELETE',
//       })

//       const result = await response.json()

//       if (response.ok) {
//         toast.success('File deleted completely from storage and database')
//         fetchTrainingData()
//         setDeleteConfirm(null)
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

//   const showDeleteConfirmation = (fileItem) => {
//     setDeleteConfirm(fileItem)
//   }

//   const getFileIcon = (fileType) => {
//     if (fileType?.includes('pdf')) return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
//     if (fileType?.includes('image')) return <FileImage className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
//     if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
//     if (fileType?.includes('document') || fileType?.includes('docx')) return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
//     return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
//   }

//   const filteredData = trainingData.filter(item => {
//     const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesFilter = filterStatus === 'all' || item.processing_status === filterStatus
//     return matchesSearch && matchesFilter
//   })

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <div className="relative">
//           <div className="w-12 h-12 border-4 border-[#94B9F9]/20 border-t-[#94B9F9] rounded-full animate-spin"></div>
//           <Bot className="w-6 h-6 text-[#94B9F9] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Delete Confirmation Dialog */}
//       <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
//         <DialogContent className="sm:max-w-md mx-4">
//           <DialogHeader>
//             <div className="flex items-center space-x-2">
//               <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
//               <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
//             </div>
//             <DialogDescription className="text-sm">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold text-gray-900">
//                 "{deleteConfirm?.title}"
//               </span>
//               ?
//             </DialogDescription>
//           </DialogHeader>

//           <div className="bg-red-50 border border-red-200 rounded-md p-3 my-4">
//             <p className="text-xs font-medium text-red-800 mb-2">
//               This action will:
//             </p>
//             <ul className="text-xs text-red-700 space-y-1">
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span>Remove the file permanently</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span>Delete all processed content</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-red-500 mr-2 flex-shrink-0">•</span>
//                 <span className="font-medium">Cannot be undone</span>
//               </li>
//             </ul>
//           </div>

//           <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setDeleteConfirm(null)}
//               disabled={deleting === deleteConfirm?.id}
//               className="w-full sm:w-auto"
//             >
//               Cancel
//             </Button>
//             <Button
//               type="button"
//               onClick={() => handleDeleteFile(deleteConfirm)}
//               disabled={deleting === deleteConfirm?.id}
//               className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
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

//       {/* File Viewer Modal */}
//       <FileViewerModal
//         file={viewingFile}
//         isOpen={!!viewingFile}
//         onClose={() => setViewingFile(null)}
//       />

//       {/* Header */}
//       <div className="space-y-3">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Training Data</h1>
//           <p className="text-sm sm:text-base text-gray-600 mt-1">Upload and manage content to train this chatbot</p>
//         </div>
//       </div>

//       {/* Main Content - Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//         <div className="overflow-x-auto">
//           <TabsList className="grid w-max grid-cols-4 gap-1 p-1 h-auto min-w-full sm:w-auto">
//             <TabsTrigger
//               value="upload"
//               className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
//             >
//               <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
//               <span className="hidden sm:inline">Upload Files</span>
//               <span className="sm:hidden">Upload</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="website"
//               className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
//             >
//               <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
//               <span className="hidden sm:inline">Add Website</span>
//               <span className="sm:hidden">Website</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="text"
//               className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
//             >
//               <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
//               <span className="hidden sm:inline">Add Text</span>
//               <span className="sm:hidden">Text</span>
//             </TabsTrigger>
//             <TabsTrigger
//               value="qa"
//               className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm whitespace-nowrap"
//             >
//               <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
//               <span className="hidden sm:inline">Q&A Pairs</span>
//               <span className="sm:hidden">Q&A</span>
//             </TabsTrigger>
//           </TabsList>
//         </div>

//         {/* File Upload Tab */}
//         <TabsContent value="upload" className="space-y-6">
//           <Card className="border-gray-200">
//             <CardHeader className="pb-4">
//               <CardTitle className="text-lg sm:text-xl">Upload Training Files</CardTitle>
//               <CardDescription className="text-sm">
//                 Upload documents, images, and other files to train your chatbot
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FileDropzone
//                 onFilesAdded={handleFilesAdded}
//                 chatbotId={chatbotId}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Website Tab */}
//         {/* <TabsContent value="website" className="space-y-6">
//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Add Website Content</CardTitle>
//               <CardDescription className="text-sm">
//                 Import content from websites and web pages
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="text-center py-8 sm:py-12 text-gray-500">
//                 <Globe className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-sm sm:text-base">Website scraping feature coming in Week 3!</p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent> */}

//         <TabsContent value="website" className="space-y-6">
//           <WebsiteURLInput
//             chatbotId={chatbotId}
//             onWebsiteAdded={() => {
//               fetchTrainingData()
//               toast.success('Website added successfully!')
//             }}
//           />
//           <WebsiteManagementDashboard chatbotId={chatbotId} />
//         </TabsContent>





//         {/* Text Tab */}
//         <TabsContent value="text" className="space-y-6">
//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Add Text Content</CardTitle>
//               <CardDescription className="text-sm">
//                 Manually add text content to train your chatbot
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="text-center py-8 sm:py-12 text-gray-500">
//                 <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-sm sm:text-base">Manual text input feature coming soon!</p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Q&A Tab */}
//         <TabsContent value="qa" className="space-y-6">
//           <Card className="border-gray-200">
//             <CardHeader>
//               <CardTitle className="text-lg sm:text-xl">Question & Answer Pairs</CardTitle>
//               <CardDescription className="text-sm">
//                 Add specific Q&A pairs for your chatbot
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="text-center py-8 sm:py-12 text-gray-500">
//                 <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
//                 <p className="text-sm sm:text-base">Q&A management feature coming soon!</p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Training Data List */}
//       {trainingData.length > 0 && (
//         <Card className="border-gray-200">
//           <CardHeader className="pb-4">
//             <div className="space-y-4">
//               <div>
//                 <CardTitle className="text-lg sm:text-xl">Uploaded Files</CardTitle>
//                 <CardDescription className="text-sm">
//                   Manage your uploaded training data
//                 </CardDescription>
//               </div>

//               {/* Search & Filter */}
//               <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     placeholder="Search files..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 text-sm"
//                   />
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Select value={filterStatus} onValueChange={setFilterStatus}>
//                     <SelectTrigger className="w-full sm:w-32">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="processing">Processing</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                       <SelectItem value="failed">Failed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <div className="space-y-3">
//               {filteredData.map((item) => (
//                 <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors">
//                   <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
//                     {/* File Info */}
//                     <div className="flex items-start space-x-3 min-w-0 flex-1">
//                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border">
//                         {getFileIcon(item.file_type)}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate mb-1">
//                           {item.title}
//                         </h4>
//                         <div className="space-y-1">
//                           {/* Primary info line */}
//                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
//                             <span className="flex items-center gap-1">
//                               <HardDrive className="w-3 h-3" />
//                               {formatFileSize(item.file_size)}
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Type className="w-3 h-3" />
//                               {getWordCount(item.metadata)} words
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Calendar className="w-3 h-3" />
//                               {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </span>
//                           </div>
//                           {/* Secondary info line */}
//                           <div className="text-xs text-gray-400">
//                             {getProcessingInfo(item)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status and Actions */}
//                     <div className="flex items-center justify-between sm:flex-col sm:items-end sm:space-y-3 sm:ml-4">
//                       {/* Status */}
//                       <div className="flex flex-col items-start sm:items-end space-y-1">
//                         <ProcessingStatusBadge
//                           status={item.processing_status}
//                           metadata={item.metadata}
//                           fileType={item.file_type}
//                         />
//                         {item.processed_at && (
//                           <div className="text-xs text-gray-400">
//                             Processed: {new Date(item.processed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                           </div>
//                         )}
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center space-x-1 sm:space-x-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => setViewingFile(item)}
//                           className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
//                           title="View file content"
//                         >
//                           <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => showDeleteConfirmation(item)}
//                           disabled={deleting === item.id}
//                           className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
//                           title="Delete file"
//                         >
//                           {deleting === item.id ? (
//                             <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
//                           ) : (
//                             <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {filteredData.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                   <p className="text-sm">
//                     {searchTerm || filterStatus !== 'all'
//                       ? 'No files match your search criteria'
//                       : 'No training files uploaded yet'}
//                   </p>
//                   {(searchTerm || filterStatus !== 'all') && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => {
//                         setSearchTerm('')
//                         setFilterStatus('all')
//                       }}
//                       className="mt-2"
//                     >
//                       Clear filters
//                     </Button>
//                   )}
//                 </div>
//               )}
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
import { Label } from '@/components/ui/label'
import WebsiteURLInput from '@/components/training/WebsiteURLInput'
import WebsiteManagementDashboard from '@/components/training/WebsiteManagementDashboard'

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
  HardDrive,
  Plus,
  Save,
  Edit2
} from 'lucide-react'
import { toast } from 'sonner'
import FileDropzone from '@/components/upload/FileDropzone'
import { createTrainingData, createQAPair, updateQAPair, deleteQAPair } from '@/lib/supabase/mutations'
import { getCurrentUser } from '@/lib/supabase/queries'

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

// Add Text Component
const AddTextContent = ({ chatbotId, onTextAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    setLoading(true)

    try {
      const trainingData = {
        type: 'text',
        title: formData.title.trim(),
        content: formData.content.trim(),
        metadata: {
          wordCount: formData.content.trim().split(/\s+/).length,
          addedManually: true
        }
      }

      const user = await getCurrentUser()
      await createTrainingData(chatbotId, user.id, trainingData)

      toast.success('Text content added successfully!')
      onTextAdded?.()
      
      // Reset form
      setFormData({ title: '', content: '' })
    } catch (error) {
      console.error('Error adding text:', error)
      toast.error(error.message || 'Failed to add text content')
    } finally {
      setLoading(false)
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter a descriptive title for this content..."
            disabled={loading}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
            <span className="text-xs text-gray-500">
              {wordCount} words
            </span>
          </div>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter your text content here. This could be business information, FAQ content, product descriptions, policies, or any other text you want your chatbot to learn from..."
            rows={8}
            disabled={loading}
            className="resize-vertical"
          />
          <p className="mt-2 text-xs text-gray-500">
            Tip: Add clear, well-structured content. The more detailed and organized your text, the better your chatbot will perform.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="flex items-center space-x-2"
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Content</span>
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Q&A Pair Form Component
const QAPairForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    category: initialData?.category || '',
    is_active: initialData?.is_active !== false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in both question and answer')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      if (!initialData) {
        setFormData({ question: '', answer: '', category: '', is_active: true })
      }
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Category (Optional)</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., General, Support, Pricing"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div>
          <Label>Question <span className="text-red-500">*</span></Label>
          <Input
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter the question..."
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label>Answer <span className="text-red-500">*</span></Label>
          <Textarea
            value={formData.answer}
            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Enter the answer..."
            rows={4}
            required
            className="mt-1"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Q&A
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Q&A Pair Card Component
const QAPairCard = ({ pair, isEditing, onEdit, onCancelEdit, onUpdate, onDelete }) => {
  const [editData, setEditData] = useState({
    question: pair.question,
    answer: pair.answer,
    category: pair.category || '',
    is_active: pair.is_active
  })
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await onUpdate(editData)
    } finally {
      setUpdating(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editData.is_active}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Question</Label>
            <Input
              value={editData.question}
              onChange={(e) => setEditData(prev => ({ ...prev, question: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Answer</Label>
            <Textarea
              value={editData.answer}
              onChange={(e) => setEditData(prev => ({ ...prev, answer: e.target.value }))}
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onCancelEdit}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {pair.category && (
              <Badge variant="secondary" className="text-xs">
                {pair.category}
              </Badge>
            )}
            <Badge 
              variant={pair.is_active ? "default" : "destructive"}
              className="text-xs"
            >
              {pair.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Question:</h4>
              <p className="text-sm text-gray-700">{pair.question}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Answer:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{pair.answer}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Q&A Manager Component
const QAPairsManager = ({ chatbotId }) => {
  const [qaPairs, setQaPairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadQAPairs()
  }, [chatbotId])

  const loadQAPairs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('qa_pairs')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQaPairs(data || [])
    } catch (error) {
      console.error('Error loading Q&A pairs:', error)
      toast.error('Failed to load Q&A pairs')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQAPair = async (qaData) => {
    try {
      const user = await getCurrentUser()
      const newPair = await createQAPair(chatbotId, user.id, qaData)
      setQaPairs(prev => [newPair, ...prev])
      toast.success('Q&A pair added successfully!')
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding Q&A pair:', error)
      toast.error(error.message || 'Failed to add Q&A pair')
    }
  }

  const handleUpdateQAPair = async (qaPairId, updates) => {
    try {
      const user = await getCurrentUser()
      const updatedPair = await updateQAPair(qaPairId, user.id, updates)
      setQaPairs(prev => prev.map(pair => 
        pair.id === qaPairId ? updatedPair : pair
      ))
      toast.success('Q&A pair updated successfully!')
      setEditingId(null)
    } catch (error) {
      console.error('Error updating Q&A pair:', error)
      toast.error(error.message || 'Failed to update Q&A pair')
    }
  }

  const handleDeleteQAPair = async (qaPairId) => {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) return

    try {
      const user = await getCurrentUser()
      await deleteQAPair(qaPairId, user.id)
      setQaPairs(prev => prev.filter(pair => pair.id !== qaPairId))
      toast.success('Q&A pair deleted successfully!')
    } catch (error) {
      console.error('Error deleting Q&A pair:', error)
      toast.error(error.message || 'Failed to delete Q&A pair')
    }
  }

  const filteredPairs = qaPairs.filter(pair =>
    pair.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pair.category && pair.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Question & Answer Pairs</h3>
          <p className="text-sm text-gray-500">Add specific Q&A pairs for your chatbot</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Q&A</span>
        </Button>
      </div>

      {/* Search */}
      {qaPairs.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Q&A pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <QAPairForm
          onSubmit={handleAddQAPair}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Q&A List */}
      {filteredPairs.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {qaPairs.length === 0 ? 'No Q&A pairs yet' : 'No matching Q&A pairs'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {qaPairs.length === 0 
              ? 'Add your first question and answer pair to get started.'
              : 'Try adjusting your search query.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPairs.map((pair) => (
            <QAPairCard
              key={pair.id}
              pair={pair}
              isEditing={editingId === pair.id}
              onEdit={() => setEditingId(pair.id)}
              onCancelEdit={() => setEditingId(null)}
              onUpdate={(updates) => handleUpdateQAPair(pair.id, updates)}
              onDelete={() => handleDeleteQAPair(pair.id)}
            />
          ))}
        </div>
      )}
    </div>
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
      const response = await fetch(`/api/files/content/${file.id}`)

      if (response.ok) {
        const data = await response.json()
        setContent(data.content || 'No content available')
      } else {
        const error = await response.json()
        setContent(`Error loading content: ${error.error || 'Unknown error'}`)
        toast.error('Failed to load file content')
      }
    } catch (error) {
      console.error('Error fetching file content:', error)
      setContent('Network error occurred while loading content')
      toast.error('Failed to load file content')
    } finally {
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[93vh] m-4">
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
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Processing Status */}
          <div className="flex items-center justify-between p-3 pb-2 bg-gray-50 rounded-lg">
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-gray-900">Processed Content</h4>
              {content && !loading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(content)
                    toast.success('Content copied to clipboard')
                  }}
                >
                  Copy Content
                </Button>
              )}
            </div>

            <ScrollArea className="h-96 w-full border rounded-lg">
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading content...</span>
                  </div>
                ) : file.processing_status === 'failed' ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">Content not available due to processing failure</p>
                  </div>
                ) : file.processing_status === 'pending' || file.processing_status === 'processing' ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">Content will be available after processing completes</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
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
      .select(`*`)
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

  const handleTextAdded = () => {
    fetchTrainingData()
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
          <WebsiteURLInput
            chatbotId={chatbotId}
            onWebsiteAdded={() => {
              fetchTrainingData()
              toast.success('Website added successfully!')
            }}
          />
          <WebsiteManagementDashboard chatbotId={chatbotId} />
        </TabsContent>

        {/* Text Tab - NOW FUNCTIONAL */}
        <TabsContent value="text" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Add Text Content</CardTitle>
              <CardDescription className="text-sm">
                Manually add text content to train your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTextContent 
                chatbotId={chatbotId} 
                onTextAdded={handleTextAdded}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A Tab - NOW FUNCTIONAL */}
        <TabsContent value="qa" className="space-y-6">
          <Card className="border-gray-200">
            <CardContent>
              <QAPairsManager chatbotId={chatbotId} />
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
                            {item.file_size && (
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {formatFileSize(item.file_size)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Type className="w-3 h-3" />
                              {getWordCount(item.metadata)} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleDateString()}
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
    </div>
  )
}