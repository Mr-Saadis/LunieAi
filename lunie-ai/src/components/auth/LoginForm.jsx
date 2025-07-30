'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react'

// OAuth Provider Icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#f25022" d="M1 1h10v10H1z" />
    <path fill="#00a4ef" d="M13 1h10v10H13z" />
    <path fill="#7fba00" d="M1 13h10v10H1z" />
    <path fill="#ffb900" d="M13 13h10v10H13z" />
  </svg>
)

// Parrot Logo Component
const ParrotLogo = ({ className = "w-28 h-28" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <Image
      src="/Lunie.png"
      alt="My Photo"
      width={600}
      height={600}
    />
  </div>
)

const benefits = [
  'Train on your business data',
  'Deploy across multiple platforms', 
  'Real-time analytics dashboard',
  'No coding required'
]

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState({ google: false, microsoft: false })
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back! Redirecting to your dashboard...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    setOauthLoading(prev => ({ ...prev, [provider]: true }))

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'microsoft' ? 'azure' : provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          ...(provider === 'microsoft' && {
            scopes: 'openid profile email'
          })
        }
      })

      if (error) {
        toast.error(`Failed to sign in with ${provider}: ${error.message}`)
      }
    } catch (error) {
      toast.error(`An error occurred with ${provider} sign in`)
      console.error(`${provider} OAuth error:`, error)
    } finally {
      setOauthLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Brand & Description */}
      <div className="hidden lg:flex lg:w-2/5  relative">
        {/* Minimal background elements */}
        <div className="absolute top-20 left-16 w-2 h-2 bg-[#94B9F9]/20 rounded-full"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-[#F4CAF7]/30 rounded-full"></div>
        <div className="absolute bottom-40 left-24 w-1.5 h-1.5 bg-[#FB8A8F]/20 rounded-full"></div>
        
        <div className="flex flex-col justify-center px-16 xl:px-20 w-full ml-8">
          {/* Logo & Brand */}
          <div className="mb-12">
            <div className="mb-6">
              <ParrotLogo className="w-28 h-28 mb-4" />
            </div>
            
            <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-tight">
              Lunie<span className="font-medium text-[#2777fc]">AI</span>
            </h1>
            
            <p className="text-lg text-gray-600 font-light leading-relaxed mb-8 max-w-sm">
              Intelligent chatbots that understand your business and delight your customers
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#EBF6FC] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#94B9F9]" />
                </div>
                <span className="text-gray-700 font-light text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="text-gray-500 text-xs font-light max-w-xs">
            Join thousands of businesses using LunieAI to transform their customer experience
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <ParrotLogo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-gray-900">
              Lunie<span className="font-medium text-[#2777fc]">AI</span>
            </h1>
          </div>

          {/* Login Form */}
          <div className="relative bg-white rounded-2xl p-8 shadow-sm">
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2777fc] via-[#F4CAF7] to-[#FB8A8F] rounded-2xl p-[1px]">
              <div className="bg-white rounded-2xl w-full h-full"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-light text-gray-900">Welcome back</h2>
              <p className="text-gray-600 font-light">Sign in to continue building amazing chatbots</p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-light"
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading.google || oauthLoading.microsoft}
              >
                {oauthLoading.google ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="ml-2">Continue with Google</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-light"
                onClick={() => handleOAuthLogin('microsoft')}
                disabled={oauthLoading.microsoft || oauthLoading.google}
              >
                {oauthLoading.microsoft ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <MicrosoftIcon />
                )}
                <span className="ml-2">Continue with Microsoft</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-400 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700 font-light">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#94B9F9] focus:ring-[#94B9F9]/10 font-light placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700 font-light">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-[#94B9F9] focus:ring-[#94B9F9]/10 font-light placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-[#94B9F9] hover:text-[#F4CAF7] font-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
               className="w-full h-12 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || oauthLoading.google || oauthLoading.microsoft}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                  <Sparkles className="w-5 h-5 mr-2" />
                    Sign in to Dashboard
                    {/* <ArrowRight className="w-4 h-4 ml-2" /> */}
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center space-y-4 mt-6">
              <p className="text-sm text-gray-600 font-midium">
                New to LunieAI?{' '}
                <Link
                  href="/auth/signup"
                  className="text-[#94B9F9] hover:text-[#F4CAF7] transition-colors"
                >
                  Create your account
                </Link>
              </p>
              
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-[#94B9F9] hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#94B9F9] hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}