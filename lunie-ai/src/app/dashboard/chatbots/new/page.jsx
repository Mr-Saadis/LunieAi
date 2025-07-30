'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Settings, 
  MessageSquare, 
  Palette,
  Loader2
} from 'lucide-react'

const AI_MODELS = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    badge: 'Recommended',
    badgeColor: 'bg-[#94B9F9] text-white'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'More advanced reasoning and accuracy',
    badge: 'Premium',
    badgeColor: 'bg-[#F4CAF7] text-white'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Latest model with improved performance',
    badge: 'Latest',
    badgeColor: 'bg-[#FB8A8F] text-white'
  }
]

const THEME_COLORS = [
  { name: 'Blue', value: '#94B9F9', class: 'bg-[#94B9F9]' },
  { name: 'Purple', value: '#F4CAF7', class: 'bg-[#F4CAF7]' },
  { name: 'Coral', value: '#FB8A8F', class: 'bg-[#FB8A8F]' },
  { name: 'Green', value: '#10B981', class: 'bg-emerald-500' },
  { name: 'Orange', value: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' }
]

export default function CreateChatbotPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: 'You are a helpful AI assistant. Answer questions clearly and concisely based on the provided context.',
    ai_model: 'gpt-3.5-turbo',
    theme_color: '#94B9F9'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please log in to create a chatbot')
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Please enter a chatbot name')
        return
      }

      // Create chatbot
      const { data: chatbot, error } = await supabase
        .from('chatbots')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          instructions: formData.instructions.trim(),
          ai_model: formData.ai_model,
          theme_color: formData.theme_color,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating chatbot:', error)
        toast.error('Failed to create chatbot. Please try again.')
        return
      }

      toast.success('🎉 Chatbot created successfully!')
      
      // Redirect to training data page or chatbot details
      router.push('/dashboard/training')
      
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Chatbot</h1>
        <p className="text-gray-600 text-lg">Set up your AI assistant in just a few steps</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[#94B9F9]" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Give your chatbot a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Chatbot Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Customer Support Bot"
                className="h-12"
                required
              />
              <p className="text-xs text-gray-500">
                This will be displayed to users interacting with your chatbot
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of what your chatbot does..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Optional: Describe your chatbot's purpose and capabilities
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Selection */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#F4CAF7]" />
              AI Model
            </CardTitle>
            <CardDescription>
              Choose the AI model that powers your chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AI_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.ai_model === model.id
                      ? 'border-[#94B9F9] bg-[#EBF6FC]/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('ai_model', model.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{model.name}</h4>
                        <Badge className={`${model.badgeColor} border-0 text-xs`}>
                          {model.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.ai_model === model.id
                        ? 'border-[#94B9F9] bg-[#94B9F9]'
                        : 'border-gray-300'
                    }`}>
                      {formData.ai_model === model.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-[#FB8A8F]" />
              Instructions
            </CardTitle>
            <CardDescription>
              Define how your chatbot should behave and respond
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                System Instructions
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={4}
                className="resize-none"
                placeholder="You are a helpful assistant that..."
              />
              <p className="text-xs text-gray-500">
                These instructions guide how your chatbot responds to users
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Color */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-[#94B9F9]" />
              Theme Color
            </CardTitle>
            <CardDescription>
              Choose a color that matches your brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-12 h-12 rounded-xl ${color.class} border-2 transition-all ${
                    formData.theme_color === color.value
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('theme_color', color.value)}
                  title={color.name}
                >
                  {formData.theme_color === color.value && (
                    <div className="w-3 h-3 bg-white rounded-full mx-auto"></div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Chatbot...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Chatbot
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}