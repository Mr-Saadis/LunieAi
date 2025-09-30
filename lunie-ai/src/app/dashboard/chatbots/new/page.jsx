// // lunie-ai/src/app/dashboard/chatbots/new/page.jsx
// 'use client'

// import { useState } from 'react'
// import { createClient } from '@/lib/supabase/client'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { toast } from 'sonner'
// import { 
//   Bot, 
//   Sparkles, 
//   ArrowRight, 
//   Settings, 
//   MessageSquare, 
//   Palette,
//   Loader2,
//   User,
//   Heart,
//   Star,
//   Coffee,
//   Zap,
//   Smile,
//   Shield,
//   Headphones,
//   BookOpen,
//   Lightbulb,
//   Rocket,
//   Target,
//   Briefcase,
//   Globe,
//   Home,
//   Camera,
//   Music,
//   Phone,
//   Mail,
//   ShoppingCart,
//   Laptop,
//   Check,
//   ChevronDown,
//   ChevronUp
// } from 'lucide-react'

// // const AI_MODELS = [
// //   {
// //     id: 'gpt-3.5-turbo',
// //     name: 'GPT-3.5 Turbo',
// //     description: 'Fast and efficient for most tasks',
// //     badge: 'Recommended',
// //     badgeColor: 'bg-[#94B9F9] text-white'
// //   },
// //   {
// //     id: 'gpt-4',
// //     name: 'GPT-4',
// //     description: 'More advanced reasoning and accuracy',
// //     badge: 'Premium',
// //     badgeColor: 'bg-[#F4CAF7] text-white'
// //   },
// //   {
// //     id: 'gpt-4-turbo',
// //     name: 'GPT-4 Turbo',
// //     description: 'Latest model with improved performance',
// //     badge: 'Latest',
// //     badgeColor: 'bg-[#FB8A8F] text-white'
// //   },
// //   {
// //     id: 'gemini-pro',
// //     name: 'Gemini Pro',
// //     description: 'Google\'s advanced AI model',
// //     badge: 'New',
// //     badgeColor: 'bg-emerald-500 text-white'
// //   }
// // ]

// import { AI_MODELS } from '@/lib/utils/constants'

// // Replace existing AI_MODELS array with this:
// const AI_MODELS_DISPLAY = Object.entries(AI_MODELS).map(([key, config]) => ({
//   id: key,
//   name: config.name,
//   description: config.description,
//   badge: config.tier === 'free' ? 'FREE' : 
//          config.recommended ? 'Recommended' : 
//          config.tier === 'paid' ? 'Premium' : 'New',
//   badgeColor: config.tier === 'free' ? 'bg-green-500 text-white' :
//               config.recommended ? 'bg-[#94B9F9] text-white' :
//               'bg-[#F4CAF7] text-white'
// }))

// const THEME_COLORS = [
//   { name: 'Blue', value: '#94B9F9', class: 'bg-[#94B9F9]' },
//   { name: 'Purple', value: '#F4CAF7', class: 'bg-[#F4CAF7]' },
//   { name: 'Coral', value: '#FB8A8F', class: 'bg-[#FB8A8F]' },
//   { name: 'Green', value: '#10B981', class: 'bg-emerald-500' },
//   { name: 'Orange', value: '#F59E0B', class: 'bg-amber-500' },
//   { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
//   { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
//   { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
//   { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
//   { name: 'Cyan', value: '#06B6D4', class: 'bg-cyan-500' },
//   { name: 'Lime', value: '#84CC16', class: 'bg-lime-500' },
//   { name: 'Rose', value: '#F43F5E', class: 'bg-rose-500' }
// ]

// const CHAT_ICONS = [
//   { name: 'Bot', icon: Bot, category: 'AI' },
//   { name: 'User', icon: User, category: 'People' },
//   { name: 'Sparkles', icon: Sparkles, category: 'AI' },
//   { name: 'Heart', icon: Heart, category: 'Emotion' },
//   { name: 'Star', icon: Star, category: 'Misc' },
//   { name: 'Coffee', icon: Coffee, category: 'Lifestyle' },
//   { name: 'Zap', icon: Zap, category: 'AI' },
//   { name: 'Smile', icon: Smile, category: 'Emotion' },
//   { name: 'Shield', icon: Shield, category: 'Security' },
//   { name: 'Headphones', icon: Headphones, category: 'Support' },
//   { name: 'Book', icon: BookOpen, category: 'Education' },
//   { name: 'Lightbulb', icon: Lightbulb, category: 'Ideas' },
//   { name: 'Rocket', icon: Rocket, category: 'Business' },
//   { name: 'Target', icon: Target, category: 'Business' },
//   { name: 'Briefcase', icon: Briefcase, category: 'Business' },
//   { name: 'Globe', icon: Globe, category: 'Technology' },
//   { name: 'Home', icon: Home, category: 'Lifestyle' },
//   { name: 'Camera', icon: Camera, category: 'Creative' },
//   { name: 'Music', icon: Music, category: 'Creative' },
//   { name: 'Phone', icon: Phone, category: 'Communication' },
//   { name: 'Mail', icon: Mail, category: 'Communication' },
//   { name: 'Shopping Cart', icon: ShoppingCart, category: 'E-commerce' },
//   { name: 'Laptop', icon: Laptop, category: 'Technology' },
//   { name: 'Message', icon: MessageSquare, category: 'Communication' }
// ]

// const ICON_CATEGORIES = ['All', 'AI', 'People', 'Business', 'Support', 'Technology', 'Communication', 'E-commerce', 'Creative', 'Lifestyle', 'Education', 'Security', 'Emotion', 'Ideas', 'Misc']

// export default function CreateChatbotPage() {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     instructions: 'You are a helpful AI assistant. Answer questions clearly and concisely based on the provided context.',
//     ai_model: 'gemini-2.5-flash-8b',
//     theme_color: '#94B9F9',
//     chat_icon: 'Bot',
//     custom_color: ''
//   })
//   const [loading, setLoading] = useState(false)
//   const [showCustomColor, setShowCustomColor] = useState(false)
//   const [selectedIconCategory, setSelectedIconCategory] = useState('All')
//   const [showAllModels, setShowAllModels] = useState(false)
//   const [currentStep, setCurrentStep] = useState(1)
//   const router = useRouter()
//   const supabase = createClient()

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const handleCustomColorChange = (color) => {
//     setFormData(prev => ({
//       ...prev,
//       theme_color: color,
//       custom_color: color
//     }))
//   }

//   const isValidHexColor = (color) => {
//     return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
//   }

//   const filteredIcons = selectedIconCategory === 'All' 
//     ? CHAT_ICONS 
//     : CHAT_ICONS.filter(icon => icon.category === selectedIconCategory)
    
// const displayedModels = showAllModels ? AI_MODELS_DISPLAY : AI_MODELS_DISPLAY.slice(0, 2)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const { data: { user }, error: authError } = await supabase.auth.getUser()
      
//       if (authError) {
//         console.error('Auth error:', authError)
//         toast.error('Authentication error. Please log in again.')
//         setLoading(false)
//         return
//       }
      
//       if (!user) {
//         toast.error('Please log in to create a chatbot')
//         setLoading(false)
//         return
//       }

//       // Validate required fields
//       if (!formData.name.trim()) {
//         toast.error('Please enter a chatbot name')
//         setLoading(false)
//         return
//       }

//       // Create chatbot data object
//       const pineconeNamespace = `user_${user.id}_${Date.now()}`
      
//       const chatbotData = {
//         user_id: user.id,
//         name: formData.name.trim(),
//         description: formData.description.trim() || null,
//         instructions: formData.instructions.trim(),
//         ai_model: formData.ai_model,
//         theme_color: formData.theme_color,
//         chat_icon: formData.chat_icon,
//         pinecone_namespace: pineconeNamespace,
//         temperature: 0.7,
//         max_tokens: 1000,
//         welcome_message: 'Hello! How can I help you today?',
//         fallback_message: 'I apologize, but I don\'t have enough information to answer that question.',
//         is_active: true,
//         is_public: false,
//         collect_leads: false
//       }

//       console.log('Creating chatbot with data:', chatbotData)

//       const { data: chatbot, error } = await supabase
//         .from('chatbots')
//         .insert(chatbotData)
//         .select()
//         .single()

//       if (error) {
//         console.error('Supabase error details:', error)
        
//         // More specific error messages
//         if (error.code === '23505') {
//           toast.error('A chatbot with this name already exists. Please choose a different name.')
//         } else if (error.code === '42501') {
//           toast.error('Permission denied. Please check your account permissions.')
//         } else if (error.message?.includes('violates not-null constraint')) {
//           toast.error('Missing required fields. Please fill in all required information.')
//         } else {
//           toast.error(`Database error: ${error.message || 'Unknown error occurred'}`)
//         }
//         setLoading(false)
//         return
//       }

//       if (!chatbot) {
//         toast.error('Failed to create chatbot - no data returned')
//         setLoading(false)
//         return
//       }

//       console.log('Chatbot created successfully:', chatbot)
//       toast.success('🎉 Chatbot created successfully!')    
      
//       // Redirect to the specific chatbot's training page
//       router.push(`/dashboard/${chatbot.id}/training`)
      
//     } catch (error) {
//       console.error('Unexpected error creating chatbot:', error)
//       toast.error(`An unexpected error occurred: ${error.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1)
//   }

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1)
//   }

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return formData.name.trim().length > 0
//       case 2:
//         return true
//       case 3:
//         return formData.instructions.trim().length > 0
//       case 4:
//         return true
//       default:
//         return false
//     }
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-4 lg:px-0">
//       {/* Mobile-Optimized Header */}
//       <div className="text-center">
//         <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
//           <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
//         </div>
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Chatbot</h1>
//         <p className="text-gray-600 text-sm sm:text-lg">Set up your AI assistant in just a few steps</p>
//       </div>

//       {/* Progress Indicator - Mobile Optimized */}
//       <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-4">
//         {[1, 2, 3, 4].map((step) => (
//           <div key={step} className="flex items-center">
//             <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
//               step <= currentStep 
//                 ? 'bg-[#94B9F9] text-white' 
//                 : 'bg-gray-200 text-gray-500'
//             }`}>
//               {step}
//             </div>
//             {step < 4 && (
//               <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
//                 step < currentStep ? 'bg-[#94B9F9]' : 'bg-gray-200'
//               }`} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Form wrapper only for final step */}
//       {currentStep === 4 ? (
//         <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
//           {/* Step 4: Customization */}
//           <div className="space-y-4 sm:space-y-6">
//             {/* Theme Color */}
//             <Card className="border-gray-200">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Palette className="w-5 h-5 mr-2 text-[#94B9F9]" />
//                   Theme Color
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   Choose a color that matches your brand
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
//                   {THEME_COLORS.map((color) => (
//                     <button
//                       key={color.value}
//                       type="button"
//                       className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${color.class} border-2 transition-all ${
//                         formData.theme_color === color.value
//                           ? 'border-gray-400 scale-110'
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => handleInputChange('theme_color', color.value)}
//                       title={color.name}
//                     >
//                       {formData.theme_color === color.value && (
//                         <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mx-auto"></div>
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Custom Color Section */}
//                 <div className="pt-3 border-t border-gray-200">
//                   <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
//                     <Label className="text-sm font-medium text-gray-700">Custom Color</Label>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setShowCustomColor(!showCustomColor)}
//                       className="text-xs self-start sm:self-auto"
//                     >
//                       {showCustomColor ? 'Hide' : 'Show'} Custom Color
//                     </Button>
//                   </div>
                  
//                   {showCustomColor && (
//                     <div className="mt-3 space-y-3">
//                       <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
//                         <div className="flex-1">
//                           <Input
//                             type="text"
//                             value={formData.custom_color}
//                             onChange={(e) => setFormData(prev => ({ ...prev, custom_color: e.target.value }))}
//                             placeholder="#94B9F9"
//                             className="h-10 font-mono text-sm"
//                           />
//                         </div>
//                         <div className="flex space-x-2">
//                           <input
//                             type="color"
//                             value={formData.custom_color || formData.theme_color}
//                             onChange={(e) => handleCustomColorChange(e.target.value)}
//                             className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
//                           />
//                           <Button
//                             type="button"
//                             size="sm"
//                             variant="outline"
//                             onClick={() => {
//                               if (isValidHexColor(formData.custom_color)) {
//                                 handleCustomColorChange(formData.custom_color)
//                                 toast.success('Custom color applied!')
//                               } else {
//                                 toast.error('Please enter a valid hex color')
//                               }
//                             }}
//                             disabled={!isValidHexColor(formData.custom_color)}
//                             className="h-10"
//                           >
//                             <Check className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         Enter a hex color code (e.g., #94B9F9) or use the color picker
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Chat Icon */}
//             <Card className="border-gray-200">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Bot className="w-5 h-5 mr-2 text-[#F4CAF7]" />
//                   Chat Icon
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   Choose an icon for your chatbot
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Category Filter */}
//                 <div className="flex flex-wrap gap-1 sm:gap-2">
//                   {ICON_CATEGORIES.map((category) => (
//                     <button
//                       key={category}
//                       type="button"
//                       onClick={() => setSelectedIconCategory(category)}
//                       className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-colors ${
//                         selectedIconCategory === category
//                           ? 'bg-[#94B9F9] text-white'
//                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                       }`}
//                     >
//                       {category}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Icons Grid */}
//                 <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
//                   {filteredIcons.map((iconData) => {
//                     const IconComponent = iconData.icon
//                     return (
//                       <button
//                         key={iconData.name}
//                         type="button"
//                         className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 transition-all flex items-center justify-center ${
//                           formData.chat_icon === iconData.name
//                             ? 'border-[#94B9F9] bg-[#EBF6FC]'
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                         }`}
//                         onClick={() => handleInputChange('chat_icon', iconData.name)}
//                         title={iconData.name}
//                       >
//                         <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${
//                           formData.chat_icon === iconData.name ? 'text-[#94B9F9]' : 'text-gray-600'
//                         }`} />
//                       </button>
//                     )
//                   })}
//                 </div>

//                 {/* Selected Icon Preview */}
//                 <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <div 
//                       className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
//                       style={{ backgroundColor: formData.theme_color }}
//                     >
//                       {(() => {
//                         const selectedIcon = CHAT_ICONS.find(icon => icon.name === formData.chat_icon)
//                         const IconComponent = selectedIcon?.icon || Bot
//                         return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//                       })()}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">Preview</p>
//                       <p className="text-xs text-gray-500">
//                         {formData.chat_icon} icon with {THEME_COLORS.find(c => c.value === formData.theme_color)?.name || 'custom'} color
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Final Step Navigation */}
//           <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4 sm:pt-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={prevStep}
//               className="w-full sm:w-auto order-2 sm:order-1"
//             >
//               <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
//               Previous
//             </Button>

//             <Button
//               type="submit"
//               disabled={loading || !formData.name.trim()}
//               className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto order-1 sm:order-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
//                   Creating Chatbot...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Create Chatbot
//                   <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       ) : (
//         /* Steps 1-3 without form wrapper */
//         <div className="space-y-4 sm:space-y-6 lg:space-y-8">
//           {/* Step 1: Basic Information */}
//           {currentStep === 1 && (
//             <Card className="border-gray-200">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Settings className="w-5 h-5 mr-2 text-[#94B9F9]" />
//                   Basic Information
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   Give your chatbot a name and tagline
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4 sm:space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="text-sm font-medium text-gray-700">
//                     Chatbot Name *
//                   </Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     placeholder="e.g., Customer Support Bot"
//                     className="h-10 sm:h-12"
//                     required
//                   />
//                   <p className="text-xs text-gray-500">
//                     This will be displayed to users interacting with your chatbot
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description" className="text-sm font-medium text-gray-700">
//                     Tagline
//                   </Label>
//                   <Textarea
//                     id="description"
//                     value={formData.description}
//                     onChange={(e) => handleInputChange('description', e.target.value)}
//                     placeholder="Brief description of what your chatbot does..."
//                     rows={3}
//                     className="resize-none text-sm"
//                   />
//                   <p className="text-xs text-gray-500">
//                     Optional: Describe your chatbot's purpose and capabilities
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Step 2: AI Model Selection */}
//           {currentStep === 2 && (
//             <Card className="border-gray-200">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <Sparkles className="w-5 h-5 mr-2 text-[#F4CAF7]" />
//                   AI Model
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   Choose the AI model that powers your chatbot
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3 sm:space-y-4">
//                   {displayedModels.map((model) => (
//                     <div
//                       key={model.id}
//                       className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                         formData.ai_model === model.id
//                           ? 'border-[#94B9F9] bg-[#EBF6FC]/50'
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => handleInputChange('ai_model', model.id)}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 mb-2">
//                             <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{model.name}</h4>
//                             <Badge className={`${model.badgeColor} border-0 text-xs self-start sm:self-auto`}>
//                               {model.badge}
//                             </Badge>
//                           </div>
//                           <p className="text-xs sm:text-sm text-gray-600">{model.description}</p>
//                         </div>
//                         <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ml-3 flex-shrink-0 ${
//                           formData.ai_model === model.id
//                             ? 'border-[#94B9F9] bg-[#94B9F9]'
//                             : 'border-gray-300'
//                         }`}>
//                           {formData.ai_model === model.id && (
//                             <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
                  
//                   {AI_MODELS_DISPLAY.length > 2 && (
//     <Button
//       type="button"
//       variant="ghost"
//       onClick={() => setShowAllModels(!showAllModels)}
//       className="w-full text-sm"
//     >
//       {showAllModels ? (
//         <>
//           <ChevronUp className="w-4 h-4 mr-2" />
//           Show Less Models
//         </>
//       ) : (
//         <>
//           <ChevronDown className="w-4 h-4 mr-2" />
//           Show More Models ({AI_MODELS_DISPLAY.length - 2} more)
//         </>
//       )}
//     </Button>
//   )}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Step 3: Instructions */}
//           {currentStep === 3 && (
//             <Card className="border-gray-200">
//               <CardHeader className="pb-3 sm:pb-6">
//                 <CardTitle className="flex items-center text-lg sm:text-xl">
//                   <MessageSquare className="w-5 h-5 mr-2 text-[#FB8A8F]" />
//                   Instructions
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   Define how your chatbot should behave and respond
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
//                     System Instructions
//                   </Label>
//                   <Textarea
//                     id="instructions"
//                     value={formData.instructions}
//                     onChange={(e) => handleInputChange('instructions', e.target.value)}
//                     rows={4}
//                     className="resize-none text-sm"
//                     placeholder="You are a helpful assistant that..."
//                   />
//                   <p className="text-xs text-gray-500">
//                     These instructions guide how your chatbot responds to users
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Navigation Buttons for Steps 1-3 */}
//           <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4 sm:pt-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={prevStep}
//               disabled={currentStep === 1}
//               className="w-full sm:w-auto order-2 sm:order-1"
//             >
//               <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
//               Previous
//             </Button>

//             <Button
//               type="button"
//               onClick={nextStep}
//               disabled={!canProceed()}
//               className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white w-full sm:w-auto order-1 sm:order-2"
//             >
//               Next
//               <ArrowRight className="w-4 h-4 ml-2" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



// lunie-ai/src/app/dashboard/chatbots/new/page.jsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Settings, 
  MessageSquare, 
  Palette,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'

import { AI_MODELS } from '@/lib/utils/constants'

// AI Models configuration for display
const AI_MODELS_DISPLAY = Object.entries(AI_MODELS).map(([key, config]) => ({
  id: key,
  name: config.name,
  description: config.description || `${config.provider} AI model`,
  badge: config.tier === 'free' ? 'FREE' : 
         config.recommended ? 'Recommended' : 
         config.tier === 'paid' ? 'Premium' : 'New',
  badgeColor: config.tier === 'free' ? 'bg-green-500 text-white' :
              config.recommended ? 'bg-[#94B9F9] text-white' :
              'bg-[#F4CAF7] text-white'
}))

// Theme colors for chatbot customization
const THEME_COLORS = [
  { name: 'Blue', value: '#94B9F9', class: 'bg-[#94B9F9]' },
  { name: 'Purple', value: '#F4CAF7', class: 'bg-[#F4CAF7]' },
  { name: 'Coral', value: '#FB8A8F', class: 'bg-[#FB8A8F]' },
  { name: 'Green', value: '#10B981', class: 'bg-emerald-500' },
  { name: 'Orange', value: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
  { name: 'Cyan', value: '#06B6D4', class: 'bg-cyan-500' },
  { name: 'Lime', value: '#84CC16', class: 'bg-lime-500' },
  { name: 'Rose', value: '#F43F5E', class: 'bg-rose-500' }
]

export default function CreateChatbotPage() {
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: 'You are a helpful AI assistant. Answer questions clearly and concisely based on the provided context.',
    ai_model: 'gemini-2.5-flash-8b',
    theme_color: '#94B9F9',
    custom_color: '',
    chat_icon_url: null,
    temp_icon_path: null // Track temporary upload path
  })
  
  // UI state management
  const [loading, setLoading] = useState(false)
  const [showCustomColor, setShowCustomColor] = useState(false)
  const [showAllModels, setShowAllModels] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [iconPreview, setIconPreview] = useState(null)
  
  // Refs
  const fileInputRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  // Track temporary uploads for cleanup
  const tempUploadsRef = useRef(new Set())

  /**
   * CLEANUP SYSTEM: Auto-cleanup temporary uploads on component unmount
   */
  useEffect(() => {
    const cleanupTempFiles = async () => {
      if (tempUploadsRef.current.size > 0) {
        try {
          const pathsArray = Array.from(tempUploadsRef.current)
          await supabase.storage
            .from('chatbot-icons')
            .remove(pathsArray)
          console.log('Cleaned up temp files:', pathsArray)
        } catch (error) {
          console.warn('Cleanup error:', error)
        }
      }
    }

    // Cleanup on page unload
    const handleBeforeUnload = () => cleanupTempFiles()
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      cleanupTempFiles()
    }
  }, [])

  /**
   * Handle form field changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Handle custom color changes
   */
  const handleCustomColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      theme_color: color,
      custom_color: color
    }))
  }

  /**
   * Validate hex color format
   */
  const isValidHexColor = (color) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  /**
   * RECOMMENDED APPROACH: Upload to temporary location first
   */
  const handleIconUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploadingIcon(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Create immediate preview
      const previewUrl = URL.createObjectURL(file)
      setIconPreview(previewUrl)

      // Generate temporary file path: temp/{user_id}/{session_id}/{timestamp}.{ext}
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const sessionId = crypto.randomUUID()
      const timestamp = Date.now()
      const tempPath = `temp/${user.id}/${sessionId}/${timestamp}.${fileExt}`

      // Upload to temporary location
      const fileBuffer = await file.arrayBuffer()
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chatbot-icons')
        .upload(tempPath, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL for preview
      const { data: { publicUrl } } = supabase.storage
        .from('chatbot-icons')
        .getPublicUrl(tempPath)

      // Update form state
      setFormData(prev => ({
        ...prev,
        chat_icon_url: publicUrl,
        temp_icon_path: tempPath
      }))

      // Track for cleanup
      tempUploadsRef.current.add(tempPath)

      toast.success('Icon uploaded successfully!')

    } catch (error) {
      console.error('Error uploading icon:', error)
      toast.error(`Failed to upload icon: ${error.message}`)
      
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview)
      }
      setIconPreview(null)
    } finally {
      setUploadingIcon(false)
    }
  }

  /**
   * Remove uploaded custom icon
   */
  const removeCustomIcon = async () => {
    try {
      // Clean up temporary file
      if (formData.temp_icon_path) {
        await supabase.storage
          .from('chatbot-icons')
          .remove([formData.temp_icon_path])
        
        tempUploadsRef.current.delete(formData.temp_icon_path)
      }
    } catch (error) {
      console.warn('Error deleting temporary icon:', error)
    }

    // Clean up state
    setFormData(prev => ({
      ...prev,
      chat_icon_url: null,
      temp_icon_path: null
    }))
    
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview)
    }
    setIconPreview(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * PRODUCTION-READY: Handle form submission with atomic operations
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Authentication error. Please log in again.')
        router.push('/auth/login')
        return
      }

      // Form validation
      if (!formData.name.trim()) {
        toast.error('Please enter a chatbot name')
        return
      }

      if (!formData.instructions.trim()) {
        toast.error('Please provide instructions for your chatbot')
        return
      }

      // Generate unique identifiers
      const chatbotId = crypto.randomUUID()
      const pineconeNamespace = `user_${user.id}_${Date.now()}`
      
      let finalIconUrl = null

      // STEP 1: Move temporary icon to permanent location (if exists)
      if (formData.temp_icon_path) {
        try {
          const fileExt = formData.temp_icon_path.split('.').pop()
          const permanentPath = `${user.id}/${chatbotId}.${fileExt}`

          // Download from temp location
          const { data: tempFile, error: downloadError } = await supabase.storage
            .from('chatbot-icons')
            .download(formData.temp_icon_path)

          if (downloadError) throw downloadError

          // Upload to permanent location
          const { error: uploadError } = await supabase.storage
            .from('chatbot-icons')
            .upload(permanentPath, tempFile, {
              contentType: tempFile.type,
              cacheControl: '31536000', // 1 year cache
              upsert: false
            })

          if (uploadError) throw uploadError

          // Get permanent public URL
          const { data: { publicUrl } } = supabase.storage
            .from('chatbot-icons')
            .getPublicUrl(permanentPath)

          finalIconUrl = publicUrl

          // Clean up temporary file
          await supabase.storage
            .from('chatbot-icons')
            .remove([formData.temp_icon_path])

          tempUploadsRef.current.delete(formData.temp_icon_path)

          console.log('Icon moved to permanent location:', permanentPath)

        } catch (iconError) {
          console.error('Error processing icon:', iconError)
          toast.error('Failed to save custom icon. Using default icon.')
          finalIconUrl = null
        }
      }

      // STEP 2: Create chatbot with permanent icon URL
      const chatbotData = {
        id: chatbotId,
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        instructions: formData.instructions.trim(),
        ai_model: formData.ai_model,
        theme_color: formData.theme_color,
        chat_icon_url: finalIconUrl, // Permanent URL or null for default
        pinecone_namespace: pineconeNamespace,
        temperature: 0.7,
        max_tokens: 1000,
        welcome_message: 'Hello! How can I help you today?',
        fallback_message: 'I apologize, but I don\'t have enough information to answer that question.',
        is_active: true,
        is_public: false,
        collect_leads: false
      }

      const { data: chatbot, error: dbError } = await supabase
        .from('chatbots')
        .insert(chatbotData)
        .select()
        .single()

      if (dbError) {
        // ROLLBACK: If database insert fails, clean up the permanent icon
        if (finalIconUrl) {
          const permanentPath = `${user.id}/${chatbotId}.${formData.temp_icon_path?.split('.').pop()}`
          await supabase.storage
            .from('chatbot-icons')
            .remove([permanentPath])
        }
        
        throw dbError
      }

      console.log('Chatbot created successfully:', chatbot)
      toast.success('🎉 Chatbot created successfully!')
      
      // Clear temp tracking since we're navigating away
      tempUploadsRef.current.clear()
      
      // Navigate to training page
      router.push(`/dashboard/${chatbot.id}/training`)
      
    } catch (error) {
      console.error('Error creating chatbot:', error)
      
      // Handle specific database errors
      if (error.code === '23505') {
        toast.error('A chatbot with this name already exists. Please choose a different name.')
      } else if (error.code === '42501') {
        toast.error('Permission denied. Please check your account permissions.')
      } else {
        toast.error(`Failed to create chatbot: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Navigation helpers
  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0
      case 2:
        return true
      case 3:
        return formData.instructions.trim().length > 0
      default:
        return false
    }
  }

  const displayedModels = showAllModels ? AI_MODELS_DISPLAY : AI_MODELS_DISPLAY.slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-4 lg:px-0">
      {/* Header Section */}
      <div className="text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Chatbot</h1>
        <p className="text-gray-600 text-sm sm:text-lg">Set up your AI assistant in just a few steps</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
              step <= currentStep 
                ? 'bg-[#94B9F9] text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                step < currentStep ? 'bg-[#94B9F9]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form wrapper only for final step */}
      {currentStep === 3 ? (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Step 3: Instructions + Customization */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* Instructions Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MessageSquare className="w-5 h-5 mr-2 text-[#FB8A8F]" />
                  Instructions
                </CardTitle>
                <CardDescription className="text-sm">
                  Define how your chatbot should behave and respond
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium text-gray-700">
                    System Instructions *
                  </Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                    placeholder="You are a helpful assistant that..."
                    required
                  />
                  <p className="text-xs text-gray-500">
                    These instructions guide how your chatbot responds to users
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Theme Color Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Palette className="w-5 h-5 mr-2 text-[#94B9F9]" />
                  Theme Color
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose a color that matches your brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 sm:gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${color.class} border-2 transition-all ${
                        formData.theme_color === color.value
                          ? 'border-gray-400 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('theme_color', color.value)}
                      title={color.name}
                    >
                      {formData.theme_color === color.value && (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mx-auto"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Section */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <Label className="text-sm font-medium text-gray-700">Custom Color</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomColor(!showCustomColor)}
                      className="text-xs self-start sm:self-auto"
                    >
                      {showCustomColor ? 'Hide' : 'Show'} Custom Color
                    </Button>
                  </div>
                  
                  {showCustomColor && (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={formData.custom_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, custom_color: e.target.value }))}
                            placeholder="#94B9F9"
                            className="h-10 font-mono text-sm"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={formData.custom_color || formData.theme_color}
                            onChange={(e) => handleCustomColorChange(e.target.value)}
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isValidHexColor(formData.custom_color)) {
                                handleCustomColorChange(formData.custom_color)
                                toast.success('Custom color applied!')
                              } else {
                                toast.error('Please enter a valid hex color')
                              }
                            }}
                            disabled={!isValidHexColor(formData.custom_color)}
                            className="h-10"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter a hex color code (e.g., #94B9F9) or use the color picker
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Icon Upload Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <ImageIcon className="w-5 h-5 mr-2 text-[#F4CAF7]" />
                  Custom Icon
                </CardTitle>
                <CardDescription className="text-sm">
                  Upload a custom icon for your chatbot (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                  
                  {!iconPreview && !formData.chat_icon_url ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingIcon}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {uploadingIcon ? (
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400" />
                        )}
                        <p className="text-sm text-gray-600">
                          {uploadingIcon ? 'Uploading...' : 'Click to upload custom icon'}
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, GIF or WebP (max 2MB)
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={iconPreview || formData.chat_icon_url}
                          alt="Custom icon"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Custom Icon</p>
                        <p className="text-xs text-gray-500">
                          Temporary upload - will be saved when chatbot is created
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCustomIcon}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: formData.theme_color }}
                    >
                      {formData.chat_icon_url || iconPreview ? (
                        <img
                          src={iconPreview || formData.chat_icon_url}
                          alt="Icon preview"
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                        />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Preview</p>
                      <p className="text-xs text-gray-500">
                        {formData.chat_icon_url || iconPreview 
                          ? 'Custom icon' 
                          : 'Default bot icon'
                        } with {THEME_COLORS.find(c => c.value === formData.theme_color)?.name || 'custom'} color
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Previous
            </Button>

            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.instructions.trim()}
              className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Creating Chatbot...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Chatbot
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* Steps 1-2 */
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Settings className="w-5 h-5 mr-2 text-[#94B9F9]" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-sm">
                  Give your chatbot a name and tagline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Chatbot Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    className="h-10 sm:h-12"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This will be displayed to users interacting with your chatbot
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Tagline
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of what your chatbot does..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Optional: Describe your chatbot's purpose and capabilities
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: AI Model Selection */}
          {currentStep === 2 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Sparkles className="w-5 h-5 mr-2 text-[#F4CAF7]" />
                  AI Model
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose the AI model that powers your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {displayedModels.map((model) => (
                    <div
                      key={model.id}
                      className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.ai_model === model.id
                          ? 'border-[#94B9F9] bg-[#EBF6FC]/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInputChange('ai_model', model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{model.name}</h4>
                            <Badge className={`${model.badgeColor} border-0 text-xs self-start sm:self-auto`}>
                              {model.badge}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">{model.description}</p>
                        </div>
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ml-3 flex-shrink-0 ${
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
                  
                  {AI_MODELS_DISPLAY.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAllModels(!showAllModels)}
                      className="w-full text-sm"
                    >
                      {showAllModels ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less Models
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show More Models ({AI_MODELS_DISPLAY.length - 2} more)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons for Steps 1-2 */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 pt-4 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Previous
            </Button>

            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white w-full sm:w-auto order-1 sm:order-2"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}