// src/app/layout.js 
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import LunieAiWidget from '@/components/chat/LunieAiWidget'

import { Poppins } from 'next/font/google'
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata = {
  title: 'LunieAI - Intelligent Chatbots for Your Business',
  description: 'Create custom AI chatbots trained on your data. Embed anywhere, integrate with any platform.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-50 text-gray-900 antialiased`}>
         <LunieAiWidget 
          chatbotId="9604f284-2cd9-4d4b-9857-a7b16991af1c"
          config={{
            primaryColor: '#3B82F6',
            welcomeMessage: 'Hello! How can I assist you today?',
          }}
        />
        {children}
        <Toaster richColors position="top-right" />
         
           </body>
    </html>
  )
}