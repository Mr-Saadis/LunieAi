// components/training/AddTextForm.jsx
'use client';
import { useState } from 'react';
import { createTrainingData } from '@/lib/supabase/mutations';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FileText, Save, X } from 'lucide-react';

export default function AddTextForm({ chatbotId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setLoading(true);

    try {
      const trainingData = {
        type: 'text',
        title: formData.title.trim(),
        content: formData.content.trim(),
        metadata: {
          wordCount: formData.content.trim().split(/\s+/).length,
          addedManually: true
        }
      };

      // Get current user
      const user = await getCurrentUser();
      await createTrainingData(chatbotId, user.id, trainingData);

      toast.success('Text content added successfully!');
      onSuccess?.();
      onClose?.();
      
      // Reset form
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Error adding text:', error);
      toast.error(error.message || 'Failed to add text content');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Text Content</h2>
              <p className="text-sm text-gray-500">Manually add text content to train your chatbot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a descriptive title for this content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">
                {wordCount} words
              </span>
            </div>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter your text content here. This could be business information, FAQ content, product descriptions, policies, or any other text you want your chatbot to learn from..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Tip: Add clear, well-structured content. The more detailed and organized your text, the better your chatbot will perform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// components/training/AddTextButton.jsx
'use client';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import AddTextForm from './AddTextForm';

export default function AddTextButton({ chatbotId, onSuccess }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center space-x-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
      >
        <FileText className="h-5 w-5" />
        <span className="font-medium">Add Text</span>
      </button>

      {showForm && (
        <AddTextForm
          chatbotId={chatbotId}
          onClose={() => setShowForm(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}