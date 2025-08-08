// components/dashboard/FileProcessingCard.jsx - Shows detailed processing results
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Download,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export default function FileProcessingCard({ file, onDelete, onView }) {
  const getFileIcon = () => {
    if (file.file_type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (file.file_type?.includes('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const getStatusBadge = () => {
    const confidence = file.metadata?.confidence || 0;
    
    switch (file.processing_status) {
      case 'completed':
        if (file.file_type?.startsWith('image/')) {
          // Special handling for OCR confidence
          if (confidence >= 90) {
            return (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Excellent ({confidence.toFixed(1)}%)
              </Badge>
            );
          } else if (confidence >= 70) {
            return (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Good ({confidence.toFixed(1)}%)
              </Badge>
            );
          } else if (confidence >= 50) {
            return (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Fair ({confidence.toFixed(1)}%)
              </Badge>
            );
          } else {
            return (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Low Quality ({confidence.toFixed(1)}%)
              </Badge>
            );
          }
        }
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getProcessingStats = () => {
    if (file.processing_status !== 'completed' || !file.metadata) return null;

    const stats = [];
    
    if (file.metadata.wordCount) {
      stats.push(`${file.metadata.wordCount} words`);
    }
    
    if (file.chunk_count) {
      stats.push(`${file.chunk_count} chunks`);
    }
    
    if (file.metadata.processingTimeMs) {
      stats.push(`${(file.metadata.processingTimeMs / 1000).toFixed(1)}s`);
    }

    return stats.length > 0 ? stats.join(' • ') : null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium truncate">
                {file.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {formatFileSize(file.file_size)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* OCR Confidence Bar for Images */}
        {file.file_type?.startsWith('image/') && file.processing_status === 'completed' && file.metadata?.confidence && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                OCR Confidence
              </span>
              <span className="font-medium">
                {file.metadata.confidence.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={file.metadata.confidence} 
              className="h-2"
            />
          </div>
        )}

        {/* Processing Stats */}
        {getProcessingStats() && (
          <div className="text-sm text-gray-600 mb-4">
            {getProcessingStats()}
          </div>
        )}

        {/* Quality Report for Images */}
        {file.metadata?.qualityReport && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Quality Assessment</span>
              <Badge variant="outline" className="text-xs capitalize">
                {file.metadata.qualityReport.overall_score}
              </Badge>
            </div>
            {file.metadata.qualityReport.recommendations?.length > 0 && (
              <div className="text-xs text-gray-600">
                💡 {file.metadata.qualityReport.recommendations[0]}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(file)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Content
          </Button>
          
          {file.processing_status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Create downloadable text file
                const element = document.createElement('a');
                const fileContent = new Blob([file.content || 'No content available'], {type: 'text/plain'});
                element.href = URL.createObjectURL(fileContent);
                element.download = `${file.title.replace(/\.[^/.]+$/, '')}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(file)}
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}