// src/components/upload/FileDropzone.jsx - UPDATED FOR CHATBOT CONTEXT
'use client'

import { useState, useCallback } from 'react'
import { Upload, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function FileDropzone({ onFilesAdded, chatbotId, maxSize = 10 * 1024 * 1024 }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFiles, setUploadingFiles] = useState([])

  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/webp'
    ]

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `Unsupported file type: ${file.type}` }
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` }
    }

    return { valid: true }
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chatbotId', chatbotId)

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

  const handleFiles = useCallback(async (files) => {
    if (!chatbotId) {
      toast.error('No chatbot selected')
      return
    }

    const fileArray = Array.from(files)
    const validFiles = []
    
    // Validate all files first
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        toast.error(`${file.name}: ${validation.error}`)
      }
    }

    if (validFiles.length === 0) {
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadingFiles(validFiles.map(f => ({ name: f.name, status: 'pending' })))

    const uploadedFiles = []
    let completed = 0

    for (const file of validFiles) {
      // Update status to uploading
      setUploadingFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'uploading' }
            : f
        )
      )

      const result = await uploadFile(file)
      completed++

      if (result.success) {
        toast.success(`${file.name} uploaded successfully`)
        uploadedFiles.push(result.data)
        
        // Update status to completed
        setUploadingFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'completed' }
              : f
          )
        )
      } else {
        toast.error(`${file.name}: ${result.error}`)
        
        // Update status to failed
        setUploadingFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'failed', error: result.error }
              : f
          )
        )
      }

      // Update progress
      setUploadProgress((completed / validFiles.length) * 100)
    }

    setUploading(false)
    
    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles([])
      setUploadProgress(0)
    }, 2000)

    if (uploadedFiles.length > 0) {
      onFilesAdded(uploadedFiles)
    }
  }, [chatbotId, maxSize, onFilesAdded])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    await handleFiles(files)
  }, [handleFiles])

  const handleFileInput = useCallback(async (e) => {
    const files = e.target.files
    if (files) {
      await handleFiles(files)
    }
    // Reset input
    e.target.value = ''
  }, [handleFiles])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-[#94B9F9] bg-[#EBF6FC]' 
            : uploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-[#94B9F9] hover:bg-[#EBF6FC]/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        <Upload className={`mx-auto h-12 w-12 mb-4 ${
          uploading ? 'text-gray-400' : 'text-gray-500'
        }`} />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {uploading ? 'Uploading files...' : 'Upload training files'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop your files here, or click to browse
          <br />
          <span className="text-xs text-gray-500">
            Supports: PDF, Word, Excel, Images (max {Math.round(maxSize / 1024 / 1024)}MB each)
          </span>
        </p>

        {!uploading && (
          <Button variant="outline" size="sm" className="mt-2">
            Browse Files
          </Button>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="max-w-xs mx-auto">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(uploadProgress)}% complete
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        id="file-input"
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileInput}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload Status */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Status:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
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
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📁 Supported file types:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>PDFs:</strong> Documents, reports, manuals</li>
          <li>• <strong>Word:</strong> .docx files with text content</li>
          <li>• <strong>Excel:</strong> .xlsx spreadsheets and data</li>
          <li>• <strong>Images:</strong> .png, .jpg, .jpeg, .webp with text (OCR)</li>
        </ul>
      </div>
    </div>
  )
}