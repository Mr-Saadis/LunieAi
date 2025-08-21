import { NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/factory';
import { getModelConfig } from '@/lib/ai/config/models';
import { AI_MODELS } from '@/lib/ai/config/models';

export async function POST(request) {
  try {
    const { message, model } = await request.json();
    
    // Validation
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const selectedModel = model || process.env.AI_MODEL_DEFAULT || 'gemini-1.5-flash-8b';
    const modelConfig = getModelConfig(selectedModel);
    
    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
    }

    // Create AI provider
    console.log('Creating AI provider for model:', selectedModel);
    const aiProvider = await AIProviderFactory.createProvider(selectedModel);
    
    // Test messages
    const messages = [
      { role: 'user', content: message }
    ];

    console.log('Sending message to AI provider...');
    const startTime = Date.now();
    
    // Generate response
    const response = await aiProvider.generateResponse(messages, {
      temperature: 0.7,
      maxTokens: 500
    });

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      response: response.content,
      metadata: {
        model: selectedModel,
        provider: response.provider,
        usage: response.usage,
        duration: totalTime,
        modelConfig
      }
    });

  } catch (error) {
    console.error('AI Test API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.name || 'AIError'
    }, { status: 500 });
  }
}

// GET method for quick health check
export async function GET() {
  try {
    const availableModels = Object.keys(AI_MODELS).map(key => ({
      model: key,
      ...AI_MODELS[key]
    }));

    return NextResponse.json({
      status: 'AI service healthy',
      defaultModel: process.env.AI_MODEL_DEFAULT,
      availableModels,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'AI service error',
      error: error.message
    }, { status: 500 });
  }
}