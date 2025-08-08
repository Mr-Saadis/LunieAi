// // // // src/components/upload/FileDropzone.jsx - UPDATED FOR CHATBOT CONTEXT
// // // 'use client'

// // // import { useState, useCallback } from 'react'
// // // import { Upload, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
// // // import { Button } from '@/components/ui/button'
// // // import { Progress } from '@/components/ui/progress'
// // // import { toast } from 'sonner'

// // // export default function FileDropzone({ onFilesAdded, chatbotId, maxSize = 10 * 1024 * 1024 }) {
// // //   const [isDragOver, setIsDragOver] = useState(false)
// // //   const [uploading, setUploading] = useState(false)
// // //   const [uploadProgress, setUploadProgress] = useState(0)
// // //   const [uploadingFiles, setUploadingFiles] = useState([])

// // //   const validateFile = (file) => {
// // //     const validTypes = [
// // //       // 'application/pdf',
// // //       // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // //       // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// // //       // 'image/png',
// // //       // 'image/jpeg',
// // //       // 'image/webp'
// // //       'application/pdf',
// // //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// // //       'image/png',
// // //       'image/jpeg',
// // //       'image/jpg',
// // //       'image/webp',
// // //       'image/bmp',
// // //       'image/tiff'
// // //     ]

// // //     if (!validTypes.includes(file.type)) {
// // //       return { valid: false, error: `Unsupported file type: ${file.type}` }
// // //     }

// // //     if (file.size > maxSize) {
// // //       return { valid: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` }
// // //     }

// // //     return { valid: true }
// // //   }

// // //   const uploadFile = async (file) => {
// // //     // const formData = new FormData()
// // //     // formData.append('file', file)
// // //     // formData.append('chatbotId', chatbotId)

// // //     // In your FileDropzone or upload function
// // //     const formData = new FormData()
// // //     formData.append('file', file)
// // //     formData.append('chatbotId', chatbotId)
// // //     formData.append('method', 'easyocr')  // 🆕 Force EasyOCR
// // //     formData.append('enhance', 'true')
// // //     formData.append('post_process', 'true')

// // //     try {
// // //       const response = await fetch('/api/upload', {
// // //         method: 'POST',
// // //         body: formData,
// // //       })

// // //       const result = await response.json()

// // //       if (!response.ok) {
// // //         throw new Error(result.error || 'Upload failed')
// // //       }

// // //       return { success: true, data: result }
// // //     } catch (error) {
// // //       return { success: false, error: error.message }
// // //     }
// // //   }

// // //   const handleFiles = useCallback(async (files) => {
// // //     if (!chatbotId) {
// // //       toast.error('No chatbot selected')
// // //       return
// // //     }

// // //     const fileArray = Array.from(files)
// // //     const validFiles = []

// // //     // Validate all files first
// // //     for (const file of fileArray) {
// // //       const validation = validateFile(file)
// // //       if (validation.valid) {
// // //         validFiles.push(file)
// // //       } else {
// // //         toast.error(`${file.name}: ${validation.error}`)
// // //       }
// // //     }

// // //     if (validFiles.length === 0) {
// // //       return
// // //     }

// // //     setUploading(true)
// // //     setUploadProgress(0)
// // //     setUploadingFiles(validFiles.map(f => ({ name: f.name, status: 'pending' })))

// // //     const uploadedFiles = []
// // //     let completed = 0

// // //     for (const file of validFiles) {
// // //       // Update status to uploading
// // //       setUploadingFiles(prev =>
// // //         prev.map(f =>
// // //           f.name === file.name
// // //             ? { ...f, status: 'uploading' }
// // //             : f
// // //         )
// // //       )

// // //       const result = await uploadFile(file)
// // //       completed++

// // //       if (result.success) {
// // //         toast.success(`${file.name} uploaded successfully`)
// // //         uploadedFiles.push(result.data)

// // //         // Update status to completed
// // //         setUploadingFiles(prev =>
// // //           prev.map(f =>
// // //             f.name === file.name
// // //               ? { ...f, status: 'completed' }
// // //               : f
// // //           )
// // //         )
// // //       } else {
// // //         toast.error(`${file.name}: ${result.error}`)

// // //         // Update status to failed
// // //         setUploadingFiles(prev =>
// // //           prev.map(f =>
// // //             f.name === file.name
// // //               ? { ...f, status: 'failed', error: result.error }
// // //               : f
// // //           )
// // //         )
// // //       }

// // //       // Update progress
// // //       setUploadProgress((completed / validFiles.length) * 100)
// // //     }

// // //     setUploading(false)

// // //     // Clear uploading files after a delay
// // //     setTimeout(() => {
// // //       setUploadingFiles([])
// // //       setUploadProgress(0)
// // //     }, 2000)

// // //     if (uploadedFiles.length > 0) {
// // //       onFilesAdded(uploadedFiles)
// // //     }
// // //   }, [chatbotId, maxSize, onFilesAdded])

// // //   const handleDrop = useCallback(async (e) => {
// // //     e.preventDefault()
// // //     setIsDragOver(false)

// // //     const files = e.dataTransfer.files
// // //     await handleFiles(files)
// // //   }, [handleFiles])

// // //   const handleFileInput = useCallback(async (e) => {
// // //     const files = e.target.files
// // //     if (files) {
// // //       await handleFiles(files)
// // //     }
// // //     // Reset input
// // //     e.target.value = ''
// // //   }, [handleFiles])

// // //   const getStatusIcon = (status) => {
// // //     switch (status) {
// // //       case 'completed':
// // //         return <CheckCircle2 className="w-4 h-4 text-green-500" />
// // //       case 'failed':
// // //         return <AlertCircle className="w-4 h-4 text-red-500" />
// // //       case 'uploading':
// // //         return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
// // //       default:
// // //         return <File className="w-4 h-4 text-gray-400" />
// // //     }
// // //   }

// // //   return (
// // //     <div className="space-y-4">
// // //       {/* Drop Zone */}
// // //       <div
// // //         className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver
// // //           ? 'border-[#94B9F9] bg-[#EBF6FC]'
// // //           : uploading
// // //             ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
// // //             : 'border-gray-300 hover:border-[#94B9F9] hover:bg-[#EBF6FC]/50'
// // //           }`}
// // //         onDrop={handleDrop}
// // //         onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
// // //         onDragLeave={() => setIsDragOver(false)}
// // //         onClick={() => !uploading && document.getElementById('file-input')?.click()}
// // //       >
// // //         <Upload className={`mx-auto h-12 w-12 mb-4 ${uploading ? 'text-gray-400' : 'text-gray-500'
// // //           }`} />

// // //         <h3 className="text-lg font-medium text-gray-900 mb-2">
// // //           {uploading ? 'Uploading files...' : 'Upload training files'}
// // //         </h3>

// // //         <p className="text-sm text-gray-600 mb-4">
// // //           Drag and drop your files here, or click to browse
// // //           <br />
// // //           <span className="text-xs text-gray-500">
// // //             Supports: PDF, Word, Excel, Images (max {Math.round(maxSize / 1024 / 1024)}MB each)
// // //           </span>
// // //         </p>

// // //         {!uploading && (
// // //           <Button variant="outline" size="sm" className="mt-2">
// // //             Browse Files
// // //           </Button>
// // //         )}

// // //         {/* Progress Bar */}
// // //         {uploading && (
// // //           <div className="max-w-xs mx-auto">
// // //             <Progress value={uploadProgress} className="h-2" />
// // //             <p className="text-xs text-gray-500 mt-2">
// // //               {Math.round(uploadProgress)}% complete
// // //             </p>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* Hidden File Input */}
// // //       <input
// // //         id="file-input"
// // //         type="file"
// // //         multiple
// // //         accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp"
// // //         onChange={handleFileInput}
// // //         className="hidden"
// // //         disabled={uploading}
// // //       />

// // //       {/* Upload Status */}
// // //       {uploadingFiles.length > 0 && (
// // //         <div className="space-y-2">
// // //           <h4 className="text-sm font-medium text-gray-900">Upload Status:</h4>
// // //           <div className="space-y-2 max-h-32 overflow-y-auto">
// // //             {uploadingFiles.map((file, index) => (
// // //               <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
// // //                 <div className="flex items-center space-x-2">
// // //                   {getStatusIcon(file.status)}
// // //                   <span className="truncate">{file.name}</span>
// // //                 </div>
// // //                 <div className="flex items-center space-x-2">
// // //                   <span className={`text-xs capitalize ${file.status === 'completed' ? 'text-green-600' :
// // //                     file.status === 'failed' ? 'text-red-600' :
// // //                       file.status === 'uploading' ? 'text-blue-600' :
// // //                         'text-gray-500'
// // //                     }`}>
// // //                     {file.status}
// // //                   </span>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Instructions */}
// // //       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
// // //         <h4 className="text-sm font-medium text-blue-900 mb-2">📁 Supported file types:</h4>
// // //         <ul className="text-xs text-blue-800 space-y-1">
// // //           <li>• <strong>PDFs:</strong> Documents, reports, manuals</li>
// // //           <li>• <strong>Word:</strong> .docx files with text content</li>
// // //           <li>• <strong>Excel:</strong> .xlsx spreadsheets and data</li>
// // //           <li>• <strong>Images:</strong> .png, .jpg, .jpeg, .webp with text (OCR)</li>
// // //         </ul>
// // //       </div>
// // //     </div>
// // //   )
// // // }


// // // components/upload/FileDropzone.jsx - Optimized for EasyOCR
// // 'use client'

// // import { useState, useCallback, useRef } from 'react'
// // import { Button } from '@/components/ui/button'
// // import { Card, CardContent } from '@/components/ui/card'
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// // import { Switch } from '@/components/ui/switch'
// // import { Label } from '@/components/ui/label'
// // import { 
// //   Upload, 
// //   Image as ImageIcon, 
// //   FileText, 
// //   AlertCircle, 
// //   CheckCircle2, 
// //   Loader2,
// //   Settings,
// //   Zap,
// //   Eye
// // } from 'lucide-react'
// // import { toast } from 'sonner'

// // export default function FileDropzone({ onFilesAdded, chatbotId, maxSize = 10 * 1024 * 1024 }) {
// //   const [isDragOver, setIsDragOver] = useState(false)
// //   const [uploading, setUploading] = useState(false)
// //   const [uploadProgress, setUploadProgress] = useState({})
// //   const [showAdvanced, setShowAdvanced] = useState(false)
  
// //   // 🆕 EasyOCR Settings
// //   const [ocrSettings, setOcrSettings] = useState({
// //     method: 'auto',           // auto, easyocr, tesseract
// //     language: 'auto',         // auto, en, es, fr, etc.
// //     enhance: true,            // Image enhancement
// //     post_process: true,       // Text post-processing
// //     enhancement_level: 'medium' // none, medium, high
// //   })
  
// //   const fileInputRef = useRef(null)

// //   const handleDrop = useCallback(async (e) => {
// //     e.preventDefault()
// //     setIsDragOver(false)
    
// //     const files = Array.from(e.dataTransfer.files)
// //     await handleFiles(files)
// //   }, [chatbotId])

// //   const handleFileSelect = (e) => {
// //     const files = Array.from(e.target.files)
// //     handleFiles(files)
// //   }

// //   const handleFiles = async (files) => {
// //     if (!files.length) return

// //     const validFiles = files.filter(file => {
// //       const validTypes = [
// //         'application/pdf',
// //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// //         'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'
// //       ]
      
// //       if (!validTypes.includes(file.type)) {
// //         toast.error(`Unsupported file type: ${file.name}`)
// //         return false
// //       }
      
// //       if (file.size > maxSize) {
// //         toast.error(`File too large: ${file.name} (max ${Math.round(maxSize/1024/1024)}MB)`)
// //         return false
// //       }
      
// //       return true
// //     })

// //     if (validFiles.length === 0) return

// //     // Process files one by one for better progress tracking
// //     const successfulUploads = []
    
// //     for (const file of validFiles) {
// //       try {
// //         setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
// //         const result = await uploadFile(file)
        
// //         if (result.success) {
// //           successfulUploads.push(result)
// //           setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          
// //           // 🆕 Show OCR-specific success message
// //           if (file.type.startsWith('image/')) {
// //             const confidence = result.processing?.confidence || 0
// //             const method = result.processing?.method_used || 'unknown'
            
// //             if (confidence > 80) {
// //               toast.success(`🎯 Excellent OCR! ${file.name} processed with ${confidence.toFixed(1)}% confidence (${method})`)
// //             } else if (confidence > 60) {
// //               toast.success(`✅ Good OCR! ${file.name} processed with ${confidence.toFixed(1)}% confidence (${method})`)
// //             } else {
// //               toast.success(`📄 ${file.name} uploaded (${method} - try a clearer image for better OCR)`)
// //             }
// //           } else {
// //             const wordCount = result.processing?.word_count || 0
// //             toast.success(`📄 ${file.name} processed successfully! (${wordCount.toLocaleString()} words extracted)`)
// //           }
// //         }
// //       } catch (error) {
// //         console.error(`Upload failed for ${file.name}:`, error)
// //         toast.error(`Failed to upload ${file.name}: ${error.message}`)
// //         setUploadProgress(prev => ({ ...prev, [file.name]: -1 })) // -1 indicates error
// //       }
// //     }

// //     // Clear progress after delay
// //     setTimeout(() => {
// //       setUploadProgress({})
// //     }, 3000)

// //     if (successfulUploads.length > 0) {
// //       onFilesAdded?.(successfulUploads)
// //     }
// //   }

// //   const uploadFile = async (file) => {
// //     const formData = new FormData()
// //     formData.append('file', file)
// //     formData.append('chatbotId', chatbotId)
    
// //     // 🆕 Add EasyOCR settings for image files
// //     if (file.type.startsWith('image/')) {
// //       formData.append('method', ocrSettings.method)
// //       formData.append('language', ocrSettings.language)
// //       formData.append('enhance', ocrSettings.enhance.toString())
// //       formData.append('post_process', ocrSettings.post_process.toString())
// //       formData.append('enhancement_level', ocrSettings.enhancement_level)
      
// //       console.log('🔍 OCR Settings:', {
// //         method: ocrSettings.method,
// //         language: ocrSettings.language,
// //         enhance: ocrSettings.enhance,
// //         enhancement_level: ocrSettings.enhancement_level
// //       })
// //     }

// //     const response = await fetch('/api/upload', {
// //       method: 'POST',
// //       body: formData,
// //     })

// //     const result = await response.json()

// //     if (!response.ok) {
// //       throw new Error(result.error || 'Upload failed')
// //     }

// //     return { success: true, ...result }
// //   }

// //   const getFileTypeIcon = (file) => {
// //     if (file.type?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />
// //     if (file.type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
// //     return <FileText className="w-5 h-5 text-gray-500" />
// //   }

// //   return (
// //     <div className="space-y-4">
// //       {/* 🆕 OCR Settings Panel */}
// //       <Card className="border-blue-100 bg-blue-50/30">
// //         <CardContent className="p-4">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="flex items-center gap-2">
// //               <Zap className="w-4 h-4 text-blue-600" />
// //               <h3 className="font-medium text-sm text-blue-900">OCR Settings</h3>
// //               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
// //                 For Images
// //               </span>
// //             </div>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => setShowAdvanced(!showAdvanced)}
// //               className="text-xs"
// //             >
// //               <Settings className="w-3 h-3 mr-1" />
// //               {showAdvanced ? 'Hide' : 'Show'} Advanced
// //             </Button>
// //           </div>

// //           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
// //             {/* OCR Method */}
// //             <div>
// //               <Label className="text-xs text-gray-600">OCR Method</Label>
// //               <Select value={ocrSettings.method} onValueChange={(value) => 
// //                 setOcrSettings(prev => ({ ...prev, method: value }))
// //               }>
// //                 <SelectTrigger className="h-8 text-xs">
// //                   <SelectValue />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="auto">Auto (Best)</SelectItem>
// //                   <SelectItem value="easyocr">EasyOCR (Premium)</SelectItem>
// //                   <SelectItem value="tesseract">Tesseract (Basic)</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div>

// //             {/* Language
// //             <div>
// //               <Label className="text-xs text-gray-600">Language</Label>
// //               <Select value={ocrSettings.language} onValueChange={(value) => 
// //                 setOcrSettings(prev => ({ ...prev, language: value }))
// //               }>
// //                 <SelectTrigger className="h-8 text-xs">
// //                   <SelectValue />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="auto">Auto-Detect</SelectItem>
// //                   <SelectItem value="en">English</SelectItem>
// //                   <SelectItem value="es">Spanish</SelectItem>
// //                   <SelectItem value="fr">French</SelectItem>
// //                   <SelectItem value="de">German</SelectItem>
// //                   <SelectItem value="ar">Arabic</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div> */}

// //             {/* Enhancement */}
// //             <div className="flex items-center space-x-2">
// //               <Switch 
// //                 id="enhance"
// //                 checked={ocrSettings.enhance} 
// //                 onCheckedChange={(checked) => 
// //                   setOcrSettings(prev => ({ ...prev, enhance: checked }))
// //                 }
// //               />
// //               <Label htmlFor="enhance" className="text-xs">
// //                 Enhance Images
// //               </Label>
// //             </div>

// //             {/* Post-process */}
// //             <div className="flex items-center space-x-2">
// //               <Switch 
// //                 id="postprocess"
// //                 checked={ocrSettings.post_process} 
// //                 onCheckedChange={(checked) => 
// //                   setOcrSettings(prev => ({ ...prev, post_process: checked }))
// //                 }
// //               />
// //               <Label htmlFor="postprocess" className="text-xs">
// //                 Clean Text
// //               </Label>
// //             </div>
// //           </div>

// //           {/* Advanced Settings */}
// //           {showAdvanced && (
// //             <div className="mt-3 pt-3 border-t border-blue-200">
// //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// //                 <div>
// //                   <Label className="text-xs text-gray-600">Enhancement Level</Label>
// //                   <Select value={ocrSettings.enhancement_level} onValueChange={(value) => 
// //                     setOcrSettings(prev => ({ ...prev, enhancement_level: value }))
// //                   }>
// //                     <SelectTrigger className="h-8 text-xs">
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="none">None (Fastest)</SelectItem>
// //                       <SelectItem value="medium">Medium (Recommended)</SelectItem>
// //                       <SelectItem value="high">High (Best Quality)</SelectItem>
// //                     </SelectContent>
// //                   </Select>
// //                 </div>
                
// //                 <div className="flex items-center text-xs text-gray-500">
// //                   <Eye className="w-3 h-3 mr-1" />
// //                   {ocrSettings.method === 'easyocr' && 'Premium accuracy with GPU acceleration'}
// //                   {ocrSettings.method === 'tesseract' && 'Basic OCR processing'}
// //                   {ocrSettings.method === 'auto' && 'Automatically selects best method'}
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* Main Upload Area */}
// //       <Card>
// //         <CardContent className="p-0">
// //           <div
// //             className={`
// //               border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
// //               ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400'}
// //               ${uploading ? 'opacity-50 pointer-events-none' : ''}
// //             `}
// //             onDrop={handleDrop}
// //             onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
// //             onDragLeave={() => setIsDragOver(false)}
// //             onClick={() => fileInputRef.current?.click()}
// //           >
// //             <input
// //               ref={fileInputRef}
// //               type="file"
// //               multiple
// //               accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
// //               onChange={handleFileSelect}
// //               className="hidden"
// //             />

// //             <div className="flex flex-col items-center space-y-4">
// //               <div className="relative">
// //                 <Upload className="w-12 h-12 text-gray-400 mx-auto" />
// //                 {ocrSettings.method === 'easyocr' && (
// //                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
// //                     <Zap className="w-2 h-2 text-white" />
// //                   </div>
// //                 )}
// //               </div>

// //               <div>
// //                 <h3 className="text-lg font-medium text-gray-900 mb-2">
// //                   {uploading ? 'Processing...' : 'Upload your files'}
// //                 </h3>
// //                 <p className="text-sm text-gray-500">
// //                   Drag and drop your files here, or click to browse
// //                   <br />
// //                   <span className="font-medium">
// //                     Supports: PDF, Word, Excel, Images (max {Math.round(maxSize/1024/1024)}MB)
// //                   </span>
// //                 </p>

// //                 {ocrSettings.method === 'easyocr' && (
// //                   <div className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
// //                     <Zap className="w-3 h-3" />
// //                     EasyOCR Premium - Superior accuracy for images
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Upload Progress */}
// //               {Object.keys(uploadProgress).length > 0 && (
// //                 <div className="w-full max-w-md space-y-2">
// //                   {Object.entries(uploadProgress).map(([fileName, progress]) => (
// //                     <div key={fileName} className="flex items-center space-x-2 text-xs">
// //                       <div className="flex-1 min-w-0">
// //                         <div className="truncate font-medium">{fileName}</div>
// //                         <div className="w-full bg-gray-200 rounded-full h-1.5">
// //                           <div 
// //                             className={`h-1.5 rounded-full transition-all duration-300 ${
// //                               progress === -1 ? 'bg-red-500' : 
// //                               progress === 100 ? 'bg-green-500' : 'bg-blue-500'
// //                             }`}
// //                             style={{ width: progress === -1 ? '100%' : `${progress}%` }}
// //                           />
// //                         </div>
// //                       </div>
// //                       <div className="flex-shrink-0">
// //                         {progress === -1 ? (
// //                           <AlertCircle className="w-4 h-4 text-red-500" />
// //                         ) : progress === 100 ? (
// //                           <CheckCircle2 className="w-4 h-4 text-green-500" />
// //                         ) : (
// //                           <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
// //                         )}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Switch } from '@/components/ui/switch'
// import { Label } from '@/components/ui/label'
// import { Progress } from '@/components/ui/progress'
// import { 
//   Upload, 
//   FileText, 
//   AlertCircle, 
//   CheckCircle2, 
//   Loader2,
//   Settings,
//   Zap,
//   Eye,
//   FileSpreadsheet,
//   X,
//   File
// } from 'lucide-react'
// import { toast } from 'sonner'

// export default function FileDropzone({ onFilesAdded, chatbotId, maxSize = 10 * 1024 * 1024 }) {
//   const [isDragOver, setIsDragOver] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [uploadingFiles, setUploadingFiles] = useState([])
//   const [showAdvanced, setShowAdvanced] = useState(false)
  
//   // 🆕 EasyOCR Settings
//   const [ocrSettings, setOcrSettings] = useState({
//     method: 'auto',           // auto, easyocr, tesseract
//     language: 'auto',         // auto, en, es, fr, etc.
//     enhance: true,            // Image enhancement
//     post_process: true,       // Text post-processing
//     enhancement_level: 'medium' // none, medium, high
//   })
  
//   const fileInputRef = useRef(null)

//   // File validation function
//   const validateFile = (file) => {
//     const validTypes = [
//       'application/pdf',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'image/png', 
//       'image/jpeg', 
//       'image/jpg', 
//       'image/webp', 
//       'image/bmp', 
//       'image/tiff'
//     ]

//     if (!validTypes.includes(file.type)) {
//       return { valid: false, error: `Unsupported file type: ${file.type}` }
//     }

//     if (file.size > maxSize) {
//       return { valid: false, error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` }
//     }

//     return { valid: true }
//   }

//   // Enhanced upload function with OCR settings
//   const uploadFile = async (file) => {
//     const formData = new FormData()
//     formData.append('file', file)
//     formData.append('chatbotId', chatbotId)
    
//     // 🆕 Add EasyOCR settings for image files
//     if (file.type.startsWith('image/')) {
//       formData.append('method', ocrSettings.method === 'auto' ? 'easyocr' : ocrSettings.method)
//       formData.append('language', ocrSettings.language === 'auto' ? 'en' : ocrSettings.language)
//       formData.append('enhance', ocrSettings.enhance.toString())
//       formData.append('post_process', ocrSettings.post_process.toString())
//       formData.append('enhancement_level', ocrSettings.enhancement_level)
      
//       console.log('🔍 OCR Settings for', file.name, ':', {
//         method: ocrSettings.method,
//         language: ocrSettings.language,
//         enhance: ocrSettings.enhance,
//         enhancement_level: ocrSettings.enhancement_level
//       })
//     }

//     try {
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.error || 'Upload failed')
//       }

//       return { success: true, data: result }
//     } catch (error) {
//       return { success: false, error: error.message }
//     }
//   }

//   // Enhanced file handling with progress tracking
//   const handleFiles = useCallback(async (files) => {
//     if (!chatbotId) {
//       toast.error('No chatbot selected')
//       return
//     }

//     if (!files.length) return

//     const fileArray = Array.from(files)
//     const validFiles = []

//     // Validate all files first
//     for (const file of fileArray) {
//       const validation = validateFile(file)
//       if (validation.valid) {
//         validFiles.push(file)
//       } else {
//         toast.error(`${file.name}: ${validation.error}`)
//       }
//     }

//     if (validFiles.length === 0) return

//     // Initialize upload state
//     setUploading(true)
//     setUploadProgress(0)
//     setUploadingFiles(validFiles.map(f => ({ 
//       name: f.name, 
//       status: 'pending',
//       type: f.type,
//       size: f.size
//     })))

//     const uploadedFiles = []
//     let completed = 0

//     // Upload files sequentially with progress tracking
//     for (const file of validFiles) {
//       // Update status to uploading
//       setUploadingFiles(prev =>
//         prev.map(f =>
//           f.name === file.name
//             ? { ...f, status: 'uploading' }
//             : f
//         )
//       )

//       const result = await uploadFile(file)
//       completed++

//       if (result.success) {
//         // Enhanced success messages based on file type and OCR results
//         if (file.type.startsWith('image/')) {
//           const confidence = result.data.processing?.confidence || 0
//           const method = result.data.processing?.method_used || result.data.processing?.processing_method || 'unknown'
//           const wordCount = result.data.processing?.word_count || 0
          
//           if (confidence > 80) {
//             toast.success(`🎯 Excellent OCR! ${file.name} - ${confidence.toFixed(1)}% confidence, ${wordCount} words extracted (${method})`)
//           } else if (confidence > 60) {
//             toast.success(`✅ Good OCR! ${file.name} - ${confidence.toFixed(1)}% confidence, ${wordCount} words (${method})`)
//           } else if (confidence > 0) {
//             toast.success(`📄 ${file.name} processed - ${wordCount} words extracted (${method}) - try clearer image for better results`)
//           } else {
//             toast.success(`📄 ${file.name} uploaded successfully`)
//           }
//         } else {
//           const wordCount = result.data.processing?.word_count || 0
//           const chunks = result.data.processing?.chunks_created || 0
//           toast.success(`📄 ${file.name} processed! ${wordCount.toLocaleString()} words, ${chunks} chunks created`)
//         }

//         uploadedFiles.push(result.data)

//         // Update status to completed
//         setUploadingFiles(prev =>
//           prev.map(f =>
//             f.name === file.name
//               ? { ...f, status: 'completed', result: result.data }
//               : f
//           )
//         )
//       } else {
//         toast.error(`${file.name}: ${result.error}`)

//         // Update status to failed
//         setUploadingFiles(prev =>
//           prev.map(f =>
//             f.name === file.name
//               ? { ...f, status: 'failed', error: result.error }
//               : f
//           )
//         )
//       }

//       // Update overall progress
//       setUploadProgress((completed / validFiles.length) * 100)
//     }

//     setUploading(false)

//     // Clear uploading files after a delay
//     setTimeout(() => {
//       setUploadingFiles([])
//       setUploadProgress(0)
//     }, 3000)

//     if (uploadedFiles.length > 0) {
//       onFilesAdded(uploadedFiles)
//     }
//   }, [chatbotId, maxSize, onFilesAdded, ocrSettings])

//   const handleDrop = useCallback(async (e) => {
//     e.preventDefault()
//     setIsDragOver(false)
    
//     const files = e.dataTransfer.files
//     await handleFiles(files)
//   }, [handleFiles])

//   const handleFileSelect = useCallback(async (e) => {
//     const files = e.target.files
//     if (files) {
//       await handleFiles(files)
//     }
//     // Reset input
//     e.target.value = ''
//   }, [handleFiles])

//   // Enhanced status icons
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle2 className="w-4 h-4 text-green-500" />
//       case 'failed':
//         return <AlertCircle className="w-4 h-4 text-red-500" />
//       case 'uploading':
//         return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
//       default:
//         return <File className="w-4 h-4 text-gray-400" />
//     }
//   }

//   // Enhanced file type icons
//   const getFileTypeIcon = (fileType) => {
//     if (fileType?.startsWith('image/')) return <File className="w-4 h-4 text-blue-500" />
//     if (fileType?.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
//     if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-4 h-4 text-green-500" />
//     if (fileType?.includes('document') || fileType?.includes('word')) return <FileText className="w-4 h-4 text-blue-600" />
//     return <File className="w-4 h-4 text-gray-500" />
//   }

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 B'
//     const k = 1024
//     const sizes = ['B', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
//   }

//   return (
//     <div className="space-y-6">
//       {/* 🆕 OCR Settings Panel */}
//       <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <Zap className="w-5 h-5 text-blue-600" />
//               <h3 className="font-semibold text-sm text-blue-900">OCR Settings</h3>
//               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
//                 Premium Image Processing
//               </span>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowAdvanced(!showAdvanced)}
//               className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100"
//             >
//               <Settings className="w-3 h-3 mr-1" />
//               {showAdvanced ? 'Hide' : 'Show'} Advanced
//             </Button>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
//             {/* OCR Method */}
//             <div>
//               <Label className="text-xs text-blue-800 font-medium">OCR Method</Label>
//               <Select value={ocrSettings.method} onValueChange={(value) => 
//                 setOcrSettings(prev => ({ ...prev, method: value }))
//               }>
//                 <SelectTrigger className="h-9 text-xs border-blue-200 focus:border-blue-400">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="auto">🎯 Auto (Best)</SelectItem>
//                   <SelectItem value="easyocr">⚡ EasyOCR (Premium)</SelectItem>
//                   <SelectItem value="tesseract">📄 Tesseract (Basic)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Language */}
//             <div>
//               <Label className="text-xs text-blue-800 font-medium">Language</Label>
//               <Select value={ocrSettings.language} onValueChange={(value) => 
//                 setOcrSettings(prev => ({ ...prev, language: value }))
//               }>
//                 <SelectTrigger className="h-9 text-xs border-blue-200 focus:border-blue-400">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="auto">🌐 Auto-Detect</SelectItem>
//                   <SelectItem value="en">🇺🇸 English</SelectItem>
//                   <SelectItem value="es">🇪🇸 Spanish</SelectItem>
//                   <SelectItem value="fr">🇫🇷 French</SelectItem>
//                   <SelectItem value="de">🇩🇪 German</SelectItem>
//                   <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Enhancement Toggles */}
//             <div className="flex flex-col gap-2">
//               <div className="flex items-center space-x-2">
//                 <Switch 
//                   id="enhance"
//                   checked={ocrSettings.enhance} 
//                   onCheckedChange={(checked) => 
//                     setOcrSettings(prev => ({ ...prev, enhance: checked }))
//                   }
//                 />
//                 <Label htmlFor="enhance" className="text-xs text-blue-800">
//                   ✨ Enhance Images
//                 </Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Switch 
//                   id="postprocess"
//                   checked={ocrSettings.post_process} 
//                   onCheckedChange={(checked) => 
//                     setOcrSettings(prev => ({ ...prev, post_process: checked }))
//                   }
//                 />
//                 <Label htmlFor="postprocess" className="text-xs text-blue-800">
//                   🧹 Clean Text
//                 </Label>
//               </div>
//             </div>
//           </div>

//           {/* Advanced Settings */}
//           {showAdvanced && (
//             <div className="mt-4 pt-4 border-t border-blue-200">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                // <div>
                //   <Label className="text-xs text-blue-800 font-medium">Enhancement Level</Label>
                //   <Select value={ocrSettings.enhancement_level} onValueChange={(value) => 
                //     setOcrSettings(prev => ({ ...prev, enhancement_level: value }))
                //   }>
                //     <SelectTrigger className="h-9 text-xs border-blue-200 focus:border-blue-400">
                //       <SelectValue />
                //     </SelectTrigger>
                //     <SelectContent>
                //       <SelectItem value="none">⚡ None (Fastest)</SelectItem>
                //       <SelectItem value="medium">⚖️ Medium (Recommended)</SelectItem>
                //       <SelectItem value="high">🎯 High (Best Quality)</SelectItem>
                //     </SelectContent>
                //   </Select>
                // </div>
                
//                 <div className="flex items-center text-xs text-blue-600 bg-blue-100 p-2 rounded">
//                   <Eye className="w-3 h-3 mr-1" />
//                   {ocrSettings.method === 'easyocr' && '⚡ Premium accuracy with AI enhancement'}
//                   {ocrSettings.method === 'tesseract' && '📄 Standard OCR processing'}
//                   {ocrSettings.method === 'auto' && '🎯 Automatically selects best method'}
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Main Upload Area */}
//       <Card className="overflow-hidden">
//         <CardContent className="p-0">
//           <div
//             className={`
//               border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
//               ${isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
//               ${uploading ? 'opacity-50 pointer-events-none' : ''}
//             `}
//             onDrop={handleDrop}
//             onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
//             onDragLeave={() => setIsDragOver(false)}
//             onClick={() => !uploading && fileInputRef.current?.click()}
//           >
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
//               onChange={handleFileSelect}
//               className="hidden"
//               disabled={uploading}
//             />

//             <div className="flex flex-col items-center space-y-4">
//               <div className="relative">
//                 <Upload className="w-16 h-16 text-gray-400 mx-auto" />
//                 {ocrSettings.method === 'easyocr' && (
//                   <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
//                     <Zap className="w-3 h-3 text-white" />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">
//                   {uploading ? 'Processing Files...' : 'Upload Training Files'}
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-2">
//                   Drag and drop your files here, or click to browse
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   <span className="font-medium">Supports:</span> PDF, Word (.docx), Excel (.xlsx), Images (PNG, JPG, WebP)
//                   <br />
//                   <span className="font-medium">Max size:</span> {Math.round(maxSize/1024/1024)}MB per file
//                 </p>

//                 {ocrSettings.method === 'easyocr' && (
//                   <div className="mt-3 inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full">
//                     <Zap className="w-3 h-3" />
//                     EasyOCR Premium - Superior accuracy for images
//                   </div>
//                 )}
//               </div>

//               {!uploading && (
//                 <Button variant="outline" size="lg" className="mt-4">
//                   <Upload className="w-4 h-4 mr-2" />
//                   Browse Files
//                 </Button>
//               )}

//               {/* Overall Progress Bar */}
//               {uploading && (
//                 <div className="w-full max-w-md">
//                   <Progress value={uploadProgress} className="h-2 mb-2" />
//                   <p className="text-sm text-blue-600 font-medium">
//                     {Math.round(uploadProgress)}% Complete
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Upload Status List */}
//       {uploadingFiles.length > 0 && (
//         <Card>
//           <CardContent className="p-4">
//             <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//               Upload Status ({uploadingFiles.length} files)
//             </h4>
//             <div className="space-y-3 max-h-64 overflow-y-auto">
//               {uploadingFiles.map((file, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border transition-all duration-200">
//                   <div className="flex items-center space-x-3 flex-1 min-w-0">
//                     {getFileTypeIcon(file.type)}
//                     <div className="flex-1 min-w-0">
//                       <div className="font-medium text-sm text-gray-900 truncate">{file.name}</div>
//                       <div className="text-xs text-gray-500">
//                         {formatFileSize(file.size)}
//                         {file.result?.processing?.confidence && (
//                           <span className="ml-2 text-green-600">
//                             • {file.result.processing.confidence.toFixed(1)}% confidence
//                           </span>
//                         )}
//                         {file.result?.processing?.word_count && (
//                           <span className="ml-2 text-blue-600">
//                             • {file.result.processing.word_count} words
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       {getStatusIcon(file.status)}
//                       <span className={`text-xs font-medium capitalize ${
//                         file.status === 'completed' ? 'text-green-600' :
//                         file.status === 'failed' ? 'text-red-600' :
//                         file.status === 'uploading' ? 'text-blue-600' :
//                         'text-gray-500'
//                       }`}>
//                         {file.status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Instructions Card */}
//       <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
//         <CardContent className="p-4">
//           <h4 className="text-sm font-bold text-blue-900 mb-3">📚 File Processing Guide</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-800">
//             <div>
//               <p className="font-semibold mb-1">📄 Documents:</p>
//               <ul className="space-y-0.5">
//                 <li>• <strong>PDFs:</strong> Text extraction + structure analysis</li>
//                 <li>• <strong>Word:</strong> Content + formatting preservation</li>
//                 <li>• <strong>Excel:</strong> Data tables + formulas</li>
//               </ul>
//             </div>
//             <div>
//               <p className="font-semibold mb-1">🖼️ Images (OCR):</p>
//               <ul className="space-y-0.5">
//                 <li>• <strong>EasyOCR:</strong> 90%+ accuracy, multi-language</li>
//                 <li>• <strong>Enhancement:</strong> Auto image optimization</li>
//                 <li>• <strong>Formats:</strong> PNG, JPG, WebP, TIFF, BMP</li>
//               </ul>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Settings,
  FileSpreadsheet,
  File,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

export default function FileDropzone({ onFilesAdded, chatbotId, maxSize = 10 * 1024 * 1024 }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [showOCRSettings, setShowOCRSettings] = useState(false)
  
  // OCR Settings (simplified)
  const [ocrSettings, setOcrSettings] = useState({
    method: 'auto',
    language: 'auto',
    enhance: true,
    post_process: true,
    enhancement_level: 'medium'
  })
  
  const fileInputRef = useRef(null)

  // File validation
  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'
    ]

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `Unsupported file type: ${file.type}` }
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` }
    }

    return { valid: true }
  }

  // Upload function
  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatbotId', chatbotId)
    
    // Add OCR settings for images
    if (file.type.startsWith('image/')) {
      formData.append('method', ocrSettings.method === 'auto' ? 'easyocr' : ocrSettings.method)
      formData.append('language', ocrSettings.language === 'auto' ? 'en' : ocrSettings.language)
      formData.append('enhance', ocrSettings.enhance.toString())
      formData.append('post_process', ocrSettings.post_process.toString())
      formData.append('enhancement_level', ocrSettings.enhancement_level)
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // File handling with progress
  const handleFiles = useCallback(async (files) => {
    if (!chatbotId) {
      toast.error('No chatbot selected')
      return
    }

    if (!files.length) return

    const fileArray = Array.from(files)
    const validFiles = []

    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        toast.error(`${file.name}: ${validation.error}`)
      }
    }

    if (validFiles.length === 0) return

    // Initialize upload
    setUploading(true)
    setUploadProgress(0)
    setUploadingFiles(validFiles.map(f => ({ 
      name: f.name, 
      status: 'pending',
      type: f.type,
      size: f.size
    })))

    const uploadedFiles = []
    let completed = 0

    // Upload files
    for (const file of validFiles) {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.name === file.name ? { ...f, status: 'uploading' } : f
        )
      )

      const result = await uploadFile(file)
      completed++

      if (result.success) {
        // Clean success messages
        if (file.type.startsWith('image/')) {
          const confidence = result.data.processing?.confidence || 0
          const wordCount = result.data.processing?.word_count || 0
          
          if (confidence > 70) {
            toast.success(`${file.name} - OCR successful (${confidence.toFixed(1)}%, ${wordCount} words)`)
          } else {
            toast.success(`${file.name} - Uploaded successfully`)
          }
        } else {
          const wordCount = result.data.processing?.word_count || 0
          toast.success(`${file.name} - Processed (${wordCount.toLocaleString()} words)`)
        }

        uploadedFiles.push(result.data)
        setUploadingFiles(prev =>
          prev.map(f =>
            f.name === file.name ? { ...f, status: 'completed', result: result.data } : f
          )
        )
      } else {
        toast.error(`${file.name}: ${result.error}`)
        setUploadingFiles(prev =>
          prev.map(f =>
            f.name === file.name ? { ...f, status: 'failed', error: result.error } : f
          )
        )
      }

      setUploadProgress((completed / validFiles.length) * 100)
    }

    setUploading(false)

    // Clear after delay
    setTimeout(() => {
      setUploadingFiles([])
      setUploadProgress(0)
    }, 3000)

    if (uploadedFiles.length > 0) {
      onFilesAdded(uploadedFiles)
    }
  }, [chatbotId, maxSize, onFilesAdded, ocrSettings])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    await handleFiles(files)
  }, [handleFiles])

  const handleFileSelect = useCallback(async (e) => {
    const files = e.target.files
    if (files) {
      await handleFiles(files)
    }
    e.target.value = ''
  }, [handleFiles])

  // Status icons (simplified)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  // File type icons (simplified)
  const getFileTypeIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <File className="w-4 h-4 text-blue-500" />
    if (fileType?.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-4 h-4 text-green-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* OCR Settings - Minimalistic */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowOCRSettings(!showOCRSettings)}
          className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Image OCR Settings
          </span>
          {showOCRSettings ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
        
        {showOCRSettings && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-600">Method</Label>
                <Select value={ocrSettings.method} onValueChange={(value) => 
                  setOcrSettings(prev => ({ ...prev, method: value }))
                }>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="easyocr">EasyOCR</SelectItem>
                    <SelectItem value="tesseract">Tesseract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* <div>
                <Label className="text-xs text-gray-600">Language</Label>
                <Select value={ocrSettings.language} onValueChange={(value) => 
                  setOcrSettings(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div>
                  <Label className="text-xs text-gray-600 font-medium">Enhancement Level</Label>
                  <Select value={ocrSettings.enhancement_level} onValueChange={(value) => 
                    setOcrSettings(prev => ({ ...prev, enhancement_level: value }))
                  }>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Fastest)</SelectItem>
                      <SelectItem value="medium">Medium (Recommended)</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
              <div className="flex items-center space-x-3">
                <Switch 
                  id="enhance-min"
                  checked={ocrSettings.enhance} 
                  onCheckedChange={(checked) => 
                    setOcrSettings(prev => ({ ...prev, enhance: checked }))
                  }
                />
                <Label htmlFor="enhance-min" className="text-xs">Enhance</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch 
                  id="clean-min"
                  checked={ocrSettings.post_process} 
                  onCheckedChange={(checked) => 
                    setOcrSettings(prev => ({ ...prev, post_process: checked }))
                  }
                />
                <Label htmlFor="clean-min" className="text-xs">Clean Text</Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Upload Area - Clean */}
      <Card>
        <CardContent className="p-0">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? 'Processing...' : 'Upload your files'}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop files here, or click to browse
              <br />
              Supports: PDF, Word, Excel, Images (max {Math.round(maxSize/1024/1024)}MB)
            </p>

            {!uploading && (
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            )}

            {/* Clean Progress Bar */}
            {uploading && (
              <div className="max-w-xs mx-auto mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Status - Minimalistic */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Upload Status ({uploadingFiles.length} files)
            </h4>
            <div className="space-y-2">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileTypeIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                        {file.result?.processing?.confidence && (
                          <span className="ml-2">• {file.result.processing.confidence.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.status)}
                    <span className={`text-xs capitalize ${
                      file.status === 'completed' ? 'text-green-600' :
                      file.status === 'failed' ? 'text-red-600' :
                      file.status === 'uploading' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {file.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Instructions */}
      <div className="text-xs text-gray-500 text-center">
        <p>Supports PDF, Word (.docx), Excel (.xlsx), and Images with OCR processing</p>
      </div>
    </div>
  )
}