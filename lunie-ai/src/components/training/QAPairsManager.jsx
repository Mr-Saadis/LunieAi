// components/training/QAPairsManager.jsx
'use client';
import { useState, useEffect } from 'react';
import { createQAPair, updateQAPair, deleteQAPair } from '@/lib/supabase/mutations';
import { getChatbotById } from '@/lib/supabase/queries';
import { getCurrentUser } from '@/lib/supabase/queries';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, MessageSquare, Search } from 'lucide-react';

export default function QAPairsManager({ chatbotId }) {
  const [qaPairs, setQaPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Q&A pairs
  useEffect(() => {
    loadQAPairs();
  }, [chatbotId]);

  const loadQAPairs = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const chatbot = await getChatbotById(chatbotId, user.id);
      setQaPairs(chatbot.qa_pairs || []);
    } catch (error) {
      console.error('Error loading Q&A pairs:', error);
      toast.error('Failed to load Q&A pairs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQAPair = async (qaData) => {
    try {
      const user = await getCurrentUser();
      const newPair = await createQAPair(chatbotId, user.id, qaData);
      setQaPairs(prev => [newPair, ...prev]);
      toast.success('Q&A pair added successfully!');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding Q&A pair:', error);
      toast.error(error.message || 'Failed to add Q&A pair');
    }
  };

  const handleUpdateQAPair = async (qaPairId, updates) => {
    try {
      const user = await getCurrentUser();
      const updatedPair = await updateQAPair(qaPairId, user.id, updates);
      setQaPairs(prev => prev.map(pair => 
        pair.id === qaPairId ? updatedPair : pair
      ));
      toast.success('Q&A pair updated successfully!');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating Q&A pair:', error);
      toast.error(error.message || 'Failed to update Q&A pair');
    }
  };

  const handleDeleteQAPair = async (qaPairId) => {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) return;

    try {
      const user = await getCurrentUser();
      await deleteQAPair(qaPairId, user.id);
      setQaPairs(prev => prev.filter(pair => pair.id !== qaPairId));
      toast.success('Q&A pair deleted successfully!');
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
      toast.error(error.message || 'Failed to delete Q&A pair');
    }
  };

  const filteredPairs = qaPairs.filter(pair =>
    pair.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pair.category && pair.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Question & Answer Pairs</h3>
          <p className="text-sm text-gray-500">Add specific Q&A pairs for your chatbot</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Q&A</span>
        </button>
      </div>

      {/* Search */}
      {qaPairs.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search Q&A pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  );
}

// Q&A Pair Form Component
function QAPairForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    category: initialData?.category || '',
    is_active: initialData?.is_active !== false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ question: '', answer: '', category: '', is_active: true });
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., General, Support, Pricing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter the question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Enter the answer..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Q&A'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// Q&A Pair Card Component
function QAPairCard({ pair, isEditing, onEdit, onCancelEdit, onUpdate, onDelete }) {
  const [editData, setEditData] = useState({
    question: pair.question,
    answer: pair.answer,
    category: pair.category || '',
    is_active: pair.is_active
  });
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await onUpdate(editData);
    } finally {
      setUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <input
              type="text"
              value={editData.question}
              onChange={(e) => setEditData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={editData.answer}
              onChange={(e) => setEditData(prev => ({ ...prev, answer: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{updating ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {pair.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {pair.category}
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              pair.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {pair.is_active ? 'Active' : 'Inactive'}
            </span>
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
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Q&A pair"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Q&A pair"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}