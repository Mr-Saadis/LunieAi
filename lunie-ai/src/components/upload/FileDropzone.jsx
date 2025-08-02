'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Loader2 
} from 'lucide-react'
import { toast } from 'sonner'

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp']
}

const MAX_FILE_SIZE = process.env.NEXT_MAX_FILE_SIZE
const MAX_FILES = process.env.NEXT_MAX_FILES

const getFileIcon = (fileType) => {
  if (fileType === 'application/pdf') return FileText
  if (fileType.includes('wordprocessing')) return FileText
  if (fileType.includes('spreadsheet')) return File
  if (fileType.startsWith('image/')) return ImageIcon
  return File
}

const getFileTypeLabel = (fileType) => {
  if (fileType === 'application/pdf') return 'PDF'
  if (fileType.includes('wordprocessing')) return 'Word'
  if (fileType.includes('spreadsheet')) return 'Excel'
  if (fileType.startsWith('image/')) return 'Image'
  return 'File'
}

export default function FileDropzone({ 
  onFilesAdded, 
  chatbotId,
  disabled = false,
  className = ""
}) {
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploading, setUploading] = useState(false)

  const processFiles = async (acceptedFiles) => {
    if (!chatbotId) {
      toast.error('Please select a chatbot first')
      return
    }

    setUploading(true)
    const newQueue = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      error: null
    }))

    setUploadQueue(prev => [...prev, ...newQueue])

    // Process each file
    for (const queueItem of newQueue) {
      try {
        await uploadFile(queueItem)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    setUploading(false)
  }

  const uploadFile = async (queueItem) => {
    try {
      // Update status to uploading
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'uploading', progress: 10 }
          : item
      ))

      const formData = new FormData()
      formData.append('file', queueItem.file)
      formData.append('chatbotId', chatbotId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      // Update status to processing
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'processing', progress: 50 }
          : item
      ))

      // Simulate processing time (replace with actual processing status check)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update status to completed
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ))

      toast.success(`${queueItem.file.name} uploaded successfully`)
      
      if (onFilesAdded) {
        onFilesAdded([result])
      }

    } catch (error) {
      setUploadQueue(prev => prev.map(item => 
        item.id === queueItem.id 
          ? { ...item, status: 'error', error: error.message }
          : item
      ))
      toast.error(`Failed to upload ${queueItem.file.name}`)
    }
  }

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'))
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`)
        } else {
          toast.error(`${file.name}: ${error.message}`)
        }
      })
    })

    // Process accepted files
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles)
    }
  }, [chatbotId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    disabled: disabled || uploading
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dropzone */}
      <Card 
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragActive 
            ? 'border-[#94B9F9] bg-[#EBF6FC]/50' 
            : disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-[#94B9F9]/50 hover:bg-[#EBF6FC]/20'
        }`}
        {...getRootProps()}
      >
        <CardContent className="p-12 text-center">
          <input {...getInputProps()} />
          
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            isDragActive ? 'bg-[#94B9F9] text-white' : 'bg-[#EBF6FC] text-[#94B9F9]'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload training files'}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Drag and drop your files here, or click to browse<br />
            Supports PDF, Word, Excel, and images (max 10MB each)
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.entries(ACCEPTED_FILE_TYPES).map(([mimeType, extensions]) => (
              <Badge key={mimeType} variant="outline" className="text-xs">
                {getFileTypeLabel(mimeType)}
              </Badge>
            ))}
          </div>

          {!disabled && (
            <Button 
              variant="outline" 
              className="border-[#94B9F9] text-[#94B9F9] hover:bg-[#94B9F9] hover:text-white"
              disabled={uploading}
            >
              Choose Files
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Upload Progress</h4>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearCompleted}
                disabled={!uploadQueue.some(item => item.status === 'completed')}
              >
                Clear Completed
              </Button>
            </div>

            <div className="space-y-4">
              {uploadQueue.map((item) => {
                const FileIcon = getFileIcon(item.file.type)
                
                return (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-100 text-green-600' :
                      item.status === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-[#EBF6FC] text-[#94B9F9]'
                    }`}>
                      {item.status === 'uploading' || item.status === 'processing' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : item.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : item.status === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <FileIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.file.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            item.status === 'completed' ? 'default' :
                            item.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {item.status}
                          </Badge>
                          {item.status !== 'uploading' && item.status !== 'processing' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeFromQueue(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{Math.round(item.file.size / 1024)}KB</span>
                        <span>{getFileTypeLabel(item.file.type)}</span>
                      </div>

                      {(item.status === 'uploading' || item.status === 'processing') && (
                        <Progress value={item.progress} className="h-2" />
                      )}

                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}