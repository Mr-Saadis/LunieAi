'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Check
} from 'lucide-react'

const plans = [
  {
    name: 'Free',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: '100 messages/month',
    features: ['1 chatbot', '100 messages/month', 'Basic customization', 'Email support']
  },
  {
    name: 'Starter',
    color: 'text-[#94B9F9]',
    bgColor: 'bg-[#EBF6FC]',
    description: '1,000 messages/month',
    features: ['3 chatbots', '1,000 messages/month', 'Advanced customization', 'Priority support']
  },
  {
    name: 'Pro',
    color: 'text-[#F4CAF7]',
    bgColor: 'bg-[#F4CAF7]/10',
    description: '10,000 messages/month',
    features: ['10 chatbots', '10,000 messages/month', 'All integrations', 'Phone support']
  },
  {
    name: 'Enterprise',
    color: 'text-[#FB8A8F]',
    bgColor: 'bg-[#FB8A8F]/10',
    description: 'Unlimited messages',
    features: ['Unlimited chatbots', 'Unlimited messages', 'White-label', 'Dedicated support']
  }
]

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Form states
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

      // Get profile data
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
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update email in auth if changed
      if (profileForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        })

        if (emailError) throw emailError

        toast.success('Profile updated! Please check your email to confirm the new address.')
      } else {
        toast.success('Profile updated successfully!')
      }

      // Refresh profile data
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

    // Validate passwords
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

      // Update the password
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-[#94B9F9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Overview Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-[#94B9F9] text-white text-xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-7 h-7 p-0 shadow-sm"
                  disabled
                >
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{profile?.full_name}</h3>
              <p className="text-sm text-gray-600 mb-4">{user?.email}</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentPlan?.bgColor} ${currentPlan?.color}`}>
                {currentPlan?.name === 'Enterprise' && <Crown className="w-3 h-3 mr-1" />}
                {currentPlan?.name} Plan
              </div>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Messages</span>
                    <span className="font-medium">{profile?.usage_current_month || 0} / {profile?.usage_limit || 100}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#94B9F9] h-2 rounded-full"
                      style={{
                        width: `${Math.min(((profile?.usage_current_month || 0) / (profile?.usage_limit || 100)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full" disabled>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="text-gray-900">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="general" className="text-sm">General</TabsTrigger>
              <TabsTrigger value="security" className="text-sm">Security</TabsTrigger>
              <TabsTrigger value="billing" className="text-sm">Billing</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Changing your email will require verification
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving} className="bg-gradient-to-br from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9] hover:to-[#F4CAF7]/90">
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
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="w-5 h-5 mr-2 text-gray-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                            className="pr-10"
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
                        <div>
                          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                          <div className="relative mt-1">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                              minLength={6}
                              className="pr-10"
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

                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            minLength={6}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving} className="bg-[#94B9F9] hover:bg-[#94B9F9]/90">
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
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    Current Plan
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-6 rounded-lg border-2 ${currentPlan?.bgColor} border-gray-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {currentPlan?.name === 'Enterprise' && <Crown className="w-5 h-5 mr-2 text-[#FB8A8F]" />}
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{currentPlan?.name} Plan</h4>
                          <p className="text-sm text-gray-600">{currentPlan?.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {currentPlan?.name === 'Free' ? '$0' : currentPlan?.name === 'Starter' ? '$29' : currentPlan?.name === 'Pro' ? '$99' : 'Custom'}
                        </div>
                        <div className="text-sm text-gray-600">/month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {currentPlan?.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" disabled>
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Billing
                      </Button>
                      <Button className="flex-1 bg-[#94B9F9] hover:bg-[#94B9F9]/90" disabled>
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
                      <div key={index} className={`p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {plan.name === 'Enterprise' && <Crown className="w-4 h-4 mr-2 text-[#FB8A8F]" />}
                            <h5 className="font-semibold text-gray-900">{plan.name}</h5>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {plan.name === 'Free' ? '$0' : plan.name === 'Starter' ? '$29' : plan.name === 'Pro' ? '$99' : 'Custom'}
                            </div>
                            <div className="text-xs text-gray-600">/month</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        <Button size="sm" variant="outline" className="w-full" disabled>
                          {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      💡 Billing features will be available in a future update
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}