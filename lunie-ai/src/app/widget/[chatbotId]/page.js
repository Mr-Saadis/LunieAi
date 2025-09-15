
// src/app/widget/[chatbotId]/page.js
import { createClient } from '@/lib/supabase/client'
import WidgetPage from '@/components/widget/WidgetPage'
import { notFound } from 'next/navigation'

/**
 * Standalone widget page for iframe embedding
 */
export default async function ChatbotWidget({ params }) {
  const { chatbotId } = params

  const supabase = createClient()

  // Fetch chatbot data
  const { data: chatbot, error } = await supabase
    .from('chatbots')
    .select(`
      id,
      name,
      description,
      widget_config,
      is_active
    `)
    .eq('id', chatbotId)
    .eq('is_active', true)
    .single()

  if (error || !chatbot) {
    notFound()
  }

  return <WidgetPage chatbot={chatbot} />
}


