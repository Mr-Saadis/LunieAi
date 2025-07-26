// src/app/layout.js - Alternative with proper font loading
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

// Try importing with different options
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata = {
  title: 'LunieAI - Intelligent Chatbots for Your Business',
  description: 'Create custom AI chatbots trained on your data. Embed anywhere, integrate with any platform.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}