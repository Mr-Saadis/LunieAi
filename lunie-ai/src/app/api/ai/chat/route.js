import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/factory';
import { RateLimitError } from '@/lib/ai/errors';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // 1. Authentication
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Request Validation
    const { message, chatbotId } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!chatbotId) {
      return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 });
    }

    // 3. Fetch Chatbot Configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    if (!chatbot.is_active) {
      return NextResponse.json({ error: 'Chatbot is inactive' }, { status: 403 });
    }

    // 4. Generate AI Response
    const aiProvider = await AIProviderFactory.createProvider(chatbot.ai_model);
    
    const messages = [
      { 
        role: 'system', 
        content: chatbot.instructions || 'You are a helpful AI assistant.'
      },
      { 
        role: 'user', 
        content: message 
      }
    ];

    const response = await aiProvider.generateResponse(messages, {
      temperature: chatbot.temperature || 0.7,
      maxTokens: chatbot.max_tokens || 1000
    });

    // 5. Save Conversation (Simple version for now)
    const conversation = {
      chatbot_id: chatbotId,
      session_id: crypto.randomUUID(),
      messages: [
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response.content, timestamp: new Date().toISOString() }
      ],
      message_count: 2,
      first_message_at: new Date().toISOString(),
      last_message_at: new Date().toISOString()
    };

    await supabase.from('conversations').insert(conversation);

    // 6. Return Response
    return NextResponse.json({
      response: response.content,
      usage: response.usage,
      model: response.model,
      duration: Date.now() - startTime
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof RateLimitError || error.name === 'RateLimitError') {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to generate response. Please try again.' 
    }, { status: 500 });
  }
}