'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft, Sparkles, CheckCircle2, Shield, Check } from 'lucide-react'

// Parrot Logo Component
const ParrotLogo = ({ className = "w-28 h-28" }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <Image
      src="/Lunie.png"
      alt="LunieAI Parrot"
      width={600}
      height={600}
    />
  </div>
)

const securityFeatures = [
  'Secure password reset link',
  'Link expires in 1 hour',
  'Account protection guaranteed',
  'Email verification required'
]

export default function PasswordResetForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        setSent(true)
        toast.success("✉️ Password reset email sent! Check your inbox.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Brand & Description */}
        <div className="hidden lg:flex lg:w-2/5 relative">
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
                Password reset email sent successfully to your inbox
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-3 mb-8">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-[#EBF6FC] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#94B9F9]" />
                  </div>
                  <span className="text-gray-700 font-light text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Simple CTA */}
            <div className="text-gray-500 text-xs font-light max-w-xs">
              Your account security is our priority. The reset link will expire automatically for your protection.
            </div>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex-1 lg:w-3/5 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <ParrotLogo className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-light text-gray-900">
                Lunie<span className="font-medium text-[#2777fc]">AI</span>
              </h1>
            </div>

            {/* Success Form */}
            <div className="relative bg-white rounded-2xl p-8 shadow-sm">
              {/* Gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2777fc] via-[#F4CAF7] to-[#FB8A8F] rounded-2xl p-[1px]">
                <div className="bg-white rounded-2xl w-full h-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-light text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  We've sent a password reset link to<br />
                  <span className="font-semibold text-[#2777fc]">{email}</span>
                </p>
                
                <div className="p-4 bg-[#EBF6FC] rounded-xl border border-[#94B9F9]/20 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    📧 Click the link in the email to reset your password.<br />
                    If you don't see it, check your spam folder.
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-8">
                  <Shield className="w-4 h-4" />
                  <span>This link will expire in 1 hour for security</span>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/auth/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSent(false)}
                    className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-light"
                  >
                    Try a different email
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Still having trouble? We're here to help.
                  </p>
                  <Link 
                    href="/help" 
                    className="text-[#94B9F9] hover:text-[#F4CAF7] text-sm font-medium hover:underline transition-colors"
                  >
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Brand & Description */}
      <div className="hidden lg:flex lg:w-2/5 relative">
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
              Secure password reset for your LunieAI account
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-3 mb-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#EBF6FC] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#94B9F9]" />
                </div>
                <span className="text-gray-700 font-light text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="text-gray-500 text-xs font-light max-w-xs">
            Your account security is our priority. We'll send you a secure reset link that expires automatically.
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <ParrotLogo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-gray-900">
              Lunie<span className="font-medium text-[#2777fc]">AI</span>
            </h1>
          </div>

          {/* Reset Form */}
          <div className="relative bg-white rounded-2xl p-8 shadow-sm">
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2777fc] via-[#F4CAF7] to-[#FB8A8F] rounded-2xl p-[1px]">
              <div className="bg-white rounded-2xl w-full h-full"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-light text-gray-900">Reset your password</h2>
                <p className="text-gray-600 font-light">Enter your email and we'll send you a secure reset link</p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-gray-700 font-light">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-[#94B9F9] focus:ring-[#94B9F9]/10 font-light placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>
                
                {/* Security Note */}
                <div className="p-4 bg-[#EBF6FC] rounded-xl border border-[#94B9F9]/20">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-[#94B9F9] mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Secure password reset</p>
                      <p className="text-xs leading-relaxed">
                        We'll send you a secure link that expires in 1 hour. 
                        No one else will be able to access your account.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-[#94B9F9] to-[#F4CAF7] hover:from-[#94B9F9]/90 hover:to-[#F4CAF7]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
                
                <Button asChild variant="outline" className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-light">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center space-y-4 mt-6">
                <p className="text-sm text-gray-600 font-light">
                  Remember your password?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-[#94B9F9] hover:text-[#F4CAF7] transition-colors"
                  >
                    Sign in instead
                  </Link>
                </p>
                
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Need help?{' '}
                  <Link 
                    href="/help" 
                    className="text-[#94B9F9] hover:text-[#F4CAF7] underline transition-colors"
                  >
                    Contact our support team
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}