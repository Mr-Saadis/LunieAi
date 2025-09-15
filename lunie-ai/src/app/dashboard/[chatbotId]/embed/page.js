
// src/app/dashboard/[id]/embed/page.js
import { createClient } from '@/lib/supabase/client'
import EmbedCodeGenerator from '@/components/embed/EmbedCodeGenerator'
import { notFound, redirect } from 'next/navigation'
// import { getUser } from '@/lib/auth'

/**
 * Embed code generation page
 */
export default async function EmbedPage({ params }) {
  const { id } = params
  const user = await getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const supabase = createClient()

  // Fetch chatbot
  const { data: chatbot, error } = await supabase
    .from('chatbots')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !chatbot) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Embed Your Chatbot
          </h1>
          <p className="text-gray-600">
            Add {chatbot.name} to your website with these simple embed options.
          </p>
        </div>

        <EmbedCodeGenerator chatbot={chatbot} />
      </div>
    </div>
  )
}
