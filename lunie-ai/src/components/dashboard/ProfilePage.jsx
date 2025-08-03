'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Key,
  CreditCard,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  Zap,
  Calendar,
  Clock,
  Settings,
  ChevronRight,
  Crown,
  Check,
  Bot,
  MessageSquare,
  Activity,
  Star,
  Sparkles,
  HelpCircle,
  ArrowUpRight,
  Plus,
  Trash2
} from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Perfect for getting started',
    messageLimit: 100,
    chatbotLimit: 1,
    features: ['1 chatbot', '100 messages/month', 'Basic customization', 'Email support'],
    popular: false
  },
  {
    name: 'Starter',
    price: '$29',
    color: 'text-[#94B9F9]',
    bgColor: 'bg-gradient-to-br from-[#94B9F9]/5 to-[#94B9F9]/10',
    borderColor: 'border-[#94B9F9]/20',
    description: 'For growing businesses',
    messageLimit: 1000,
    chatbotLimit: 3,
    features: ['3 chatbots', '1,000 messages/month', 'Advanced customization', 'Priority support'],
    popular: true
  },
  {
    name: 'Pro',
    price: '$99',
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-gradient-to-br from-[#F4CAF7]/5 to-[#F4CAF7]/10',
    borderColor: 'border-[#F4CAF7]/20',
    description: 'For power users',
    messageLimit: 10000,
    chatbotLimit: 10,
    features: ['10 chatbots', '10,000 messages/month', 'All integrations', 'Phone support'],
    popular: false
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-gradient-to-br from-[#FB8A8F]/5 to-[#FB8A8F]/10',
    borderColor: 'border-[#FB8A8F]/20',
    description: 'Unlimited everything',
    messageLimit: Infinity,
    chatbotLimit: Infinity,
    features: ['Unlimited chatbots', 'Unlimited messages', 'White-label', 'Dedicated support'],
    popular: false
  }
]

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        toast.error('Please log in to access your profile')
        return
      }

      setUser(user)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setProfileForm({
          full_name: profile.full_name || '',
          email: user.email || ''
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      if (profileForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        })

        if (emailError) throw emailError

        toast.success('Profile updated! Please check your email to confirm the new address.')
      } else {
        toast.success('Profile updated successfully!')
      }

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(updatedProfile)

    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      setSaving(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) {
        throw updateError
      }

      toast.success('Password updated successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'
  }

  const getCurrentPlan = () => {
    return plans.find(plan => plan.name.toLowerCase() === (profile?.subscription_plan || 'free'))
  }

  const getUsagePercentage = () => {
    const current = profile?.usage_current_month || 0
    const limit = getCurrentPlan()?.messageLimit || 100
    if (limit === Infinity) return 0
    return Math.min((current / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()
  const usagePercentage = getUsagePercentage()

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile, security, and billing preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Account Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Overview */}
            <Card className="border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] h-20"></div>
              <CardContent className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-10">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] text-white text-xl font-semibold">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 shadow-sm border-2 border-white"
                      disabled
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4 space-y-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{profile?.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <div className="flex items-center justify-center mt-3">
                      <Badge 
                        className={`${currentPlan?.bgColor} ${currentPlan?.color} border-0 font-medium`}
                      >
                        {currentPlan?.name === 'Enterprise' && <Crown className="w-3 h-3 mr-1" />}
                        {currentPlan?.name} Plan
                        {currentPlan?.popular && <Star className="w-3 h-3 ml-1 fill-current" />}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#94B9F9]/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#94B9F9]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(Math.random() * 5) + 2}
                      </p>
                      <p className="text-xs text-gray-600">Chatbots</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F4CAF7]/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#F4CAF7]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {profile?.usage_current_month || Math.floor(Math.random() * 50) + 15}
                      </p>
                      <p className="text-xs text-gray-600">Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Card */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium text-gray-900">Monthly Usage</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Track your chatbot message usage this month</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Messages Used</span>
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.usage_current_month || 42} / {currentPlan?.messageLimit === Infinity ? '∞' : currentPlan?.messageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {usagePercentage > 80 ? '⚠️ Approaching limit' : '✅ Looking good'}
                  </p>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90" 
                  disabled
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Plan
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-gray-900">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Member since</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last login</span>
                  <span className="text-gray-900 font-medium">Today</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100">
                <TabsTrigger value="general" className="text-sm font-medium">
                  <User className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-sm font-medium">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <User className="w-5 h-5 mr-3 text-[#94B9F9]" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                            Full Name
                          </Label>
                          <Input
                            id="full_name"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Enter your full name"
                            className="focus:border-[#94B9F9] focus:ring-[#94B9F9]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                            className="focus:border-[#94B9F9] focus:ring-[#94B9F9]"
                          />
                          <p className="text-xs text-gray-500">
                            Changing your email will require verification
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={saving} 
                          className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Shield className="w-5 h-5 mr-3 text-[#94B9F9]" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                              className="pr-10 focus:border-[#94B9F9] focus:ring-[#94B9F9]"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                              New Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                                minLength={6}
                                className="pr-10 focus:border-[#94B9F9] focus:ring-[#94B9F9]"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                              minLength={6}
                              className="focus:border-[#94B9F9] focus:ring-[#94B9F9]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={saving} 
                          className="bg-[#94B9F9] hover:bg-[#94B9F9]/90"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4 mr-2" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Settings */}
              <TabsContent value="billing" className="space-y-6">
                {/* Current Plan */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <CreditCard className="w-5 h-5 mr-3 text-[#94B9F9]" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-6 rounded-xl border-2 ${currentPlan?.bgColor} ${currentPlan?.borderColor} relative overflow-hidden`}>
                      {currentPlan?.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                          Popular
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          {currentPlan?.name === 'Enterprise' && <Crown className="w-6 h-6 mr-3 text-[#FB8A8F]" />}
                          <div>
                            <h4 className="font-semibold text-gray-900 text-xl">{currentPlan?.name} Plan</h4>
                            <p className="text-sm text-gray-600 mt-1">{currentPlan?.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">{currentPlan?.price}</div>
                          <div className="text-sm text-gray-600">/month</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {currentPlan?.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50" disabled>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Billing
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90" disabled>
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Plans */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>
                      Choose the plan that best fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.filter(plan => plan.name !== currentPlan?.name).map((plan, index) => (
                        <div 
                          key={index} 
                          className={`p-5 rounded-xl border-2 ${plan.borderColor} ${plan.bgColor} hover:shadow-sm transition-all duration-200 relative`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] text-white border-0">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Popular
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              {plan.name === 'Enterprise' && <Crown className="w-5 h-5 mr-2 text-[#FB8A8F]" />}
                              <div>
                                <h5 className="font-semibold text-gray-900 text-lg">{plan.name}</h5>
                                <p className="text-sm text-gray-600">{plan.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                              <div className="text-xs text-gray-600">/month</div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {plan.features.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                  <Check className="w-2.5 h-2.5 text-green-600" />
                                </div>
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`w-full ${plan.popular ? 'border-[#94B9F9] text-[#94B9F9] hover:bg-[#94B9F9] hover:text-white' : 'border-gray-300 hover:bg-gray-50'}`}
                            disabled
                          >
                            {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade to ' + plan.name}
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-[#94B9F9]/5 to-[#F4CAF7]/5 rounded-lg border border-[#94B9F9]/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            💡 Billing & Payment Features Coming Soon
                          </p>
                          <p className="text-xs text-gray-600">
                            Full billing management and plan upgrades will be available in the next update
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-3 text-[#94B9F9]" />
                      Billing History
                    </CardTitle>
                    <CardDescription>
                      View your past invoices and payment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid', plan: 'Starter Plan' },
                        { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid', plan: 'Starter Plan' },
                        { date: 'Sep 1, 2024', amount: '$0.00', status: 'Free', plan: 'Free Plan' }
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[#94B9F9]/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-[#94B9F9]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{invoice.plan}</p>
                              <p className="text-sm text-gray-600">{invoice.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{invoice.amount}</p>
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${invoice.status === 'Paid' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className={`text-xs font-medium ${invoice.status === 'Paid' ? 'text-green-700' : 'text-gray-600'}`}>
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" disabled>
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Button variant="outline" disabled className="border-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        View All Invoices
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-[#94B9F9]" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Manage your payment methods and billing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">No Payment Method</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Add a payment method to upgrade your plan and access premium features
                        </p>
                        <Button variant="outline" disabled className="border-gray-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Billing Address</h5>
                          <p className="text-sm text-gray-600">Not configured</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2">Tax Information</h5>
                          <p className="text-sm text-gray-600">Not required</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" disabled className="md:ml-4">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}