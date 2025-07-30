'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Upload, 
  File, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  FileText,
  Image,
  FileSpreadsheet,
  Globe,
  Brain,
  Sparkles
} from 'lucide-react'

const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return FileText
  if (fileType.includes('image')) return Image
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet
  if (fileType.includes('document') || fileType.includes('word')) return FileText
  return File
}

const getFileColor = (fileType) => {
  if (fileType.includes('pdf')) return 'from-[#FB8A8F] to-[#F4CAF7]'
  if (fileType.includes('image')) return 'from-[#F4CAF7] to-[#94B9F9]'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'from-[#94B9F9] to-[#EBF6FC]'
  if (fileType.includes('document') || fileType.includes('word')) return 'from-[#EBF6FC] to-[#F4CAF7]'
  return 'from-[#94B9F9] to-[#F4CAF7]'
}

export default function FileUploadComponent({ onFileUpload, maxSize = 10 * 1024 * 1024 }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    setUploading(true)
    setUploadProgress(0)

    const files = Array.from(e.dataTransfer.files)
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'image/png', 
      'image/jpeg',
      'image/jpg',
      'text/plain'
    ]
    
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: File type not supported`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      setUploading(false)
      return
    }

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress(((i + 1) / validFiles.length) * 100)
        
        const result = await onFileUpload(file)
        
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          status: result?.success ? 'completed' : 'failed',
          error: result?.error
        }])

        // Simulate processing delay for demo
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      toast.success(`Successfully uploaded ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}!`)
    } catch (error) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onFileUpload, maxSize])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#EBF6FC]/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center mr-3">
              <Upload className="w-4 h-4 text-white" />
            </div>
            Tell Us About Your Business
          </CardTitle>
          <CardDescription>
            Via files, website links, or text—we'll handle the rest!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-[#94B9F9] bg-gradient-to-br from-[#EBF6FC] to-[#F4CAF7]/20 scale-[1.02]' 
                : 'border-[#EBF6FC] hover:border-[#94B9F9] hover:bg-gradient-to-br hover:from-[#EBF6FC]/50 hover:to-white'
            } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
              onChange={(e) => handleDrop({ preventDefault: () => {}, dataTransfer: { files: e.target.files } })}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading...</h3>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">{Math.round(uploadProgress)}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragOver ? 'Drop your files here' : 'Upload your files'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Drag and drop your files here, or click to browse
                    <br />
                    <span className="font-medium">Supports:</span> PDF, Word, Excel, Images (max {Math.round(maxSize / 1024 / 1024)}MB)
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-[#94B9F9] text-[#94B9F9] hover:bg-[#94B9F9] hover:text-white transition-all duration-300"
                >
                  Choose Files
                </Button>
              </div>
            )}
          </div>

          {/* Upload Options */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-[#EBF6FC] hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#94B9F9] to-[#EBF6FC] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Upload Files</h4>
                <p className="text-xs text-gray-500">PDFs, Word docs, spreadsheets</p>
              </CardContent>
            </Card>

            <Card className="border border-[#F4CAF7] hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#F4CAF7] to-[#FB8A8F] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Website Link</h4>
                <p className="text-xs text-gray-500">Crawl your website content</p>
              </CardContent>
            </Card>

            <Card className="border border-[#FB8A8F] hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FB8A8F] to-[#F4CAF7] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Upload Q&A</h4>
                <p className="text-xs text-gray-500">Question & answer pairs</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              Uploaded Files ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                const colorGradient = getFileColor(file.type)
                
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${colorGradient} rounded-lg flex items-center justify-center`}>
                        <FileIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Character Count */}
      <Card className="border-0 bg-gradient-to-r from-[#EBF6FC] to-[#F4CAF7] text-center">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Total detected characters:</span> 0 / 400k limit
          </p>
        </CardContent>
      </Card>
    </div>
  )
}