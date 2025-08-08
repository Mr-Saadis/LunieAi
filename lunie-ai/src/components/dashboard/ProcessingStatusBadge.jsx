// components/dashboard/ProcessingStatusBadge.jsx
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Eye } from 'lucide-react';

export default function ProcessingStatusBadge({ status, confidence, metadata, fileType }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        // Special handling for image OCR confidence
        if (fileType?.startsWith('image/') && confidence !== undefined) {
          if (confidence < 50) {
            return {
              icon: AlertTriangle,
              text: `Low Confidence (${confidence.toFixed(1)}%)`,
              bgColor: 'bg-yellow-100',
              textColor: 'text-yellow-800',
              iconColor: 'text-yellow-600'
            };
          } else if (confidence < 80) {
            return {
              icon: CheckCircle,
              text: `Medium Confidence (${confidence.toFixed(1)}%)`,
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-800',
              iconColor: 'text-blue-600'
            };
          } else {
            return {
              icon: CheckCircle,
              text: `High Confidence (${confidence.toFixed(1)}%)`,
              bgColor: 'bg-green-100',
              textColor: 'text-green-800',
              iconColor: 'text-green-600'
            };
          }
        }
        
        return {
          icon: CheckCircle,
          text: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      
      case 'processing':
        return {
          icon: Loader2,
          text: 'Processing...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          animate: true
        };
      
      case 'failed':
        return {
          icon: XCircle,
          text: 'Failed',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      
      case 'pending':
      default:
        return {
          icon: Clock,
          text: 'Pending',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon 
        className={`w-3 h-3 mr-1 ${config.iconColor} ${config.animate ? 'animate-spin' : ''}`} 
      />
      {config.text}
    </span>
  );
}