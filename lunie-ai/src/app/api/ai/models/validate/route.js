// src/app/api/ai/models/route.js
/**
 * Fixed AI Models API Route with optional auth
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Simple models configuration (no external dependencies for now)
const AI_MODELS = {
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast, versatile performance for diverse tasks',
    provider: 'gemini',
    capabilities: {
      chat: true,
      embeddings: false,
      vision: true,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 8192,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 15,
        rpd: 1500,
        tpm: 1000000
      }
    },
    cost: {
      input: 0,
      output: 0
    },
    badge: 'FREE',
    recommended: true
  },
  'gemini-1.5-flash-8b': {
    id: 'gemini-1.5-flash-8b',
    displayName: 'Gemini 1.5 Flash 8B',
    description: 'Lightweight, fast model for simple tasks',
    provider: 'gemini',
    capabilities: {
      chat: true,
      embeddings: false,
      vision: false,
      functionCalling: true,
      streaming: true
    },
    limits: {
      maxTokens: 8192,
      maxInputTokens: 30720,
      rateLimit: {
        rpm: 15,
        rpd: 1500,
        tpm: 1000000
      }
    },
    cost: {
      input: 0,
      output: 0
    },
    badge: 'FREE',
    recommended: false
  }
};

/**
 * GET /api/ai/models
 * Get available AI models (works with or without auth)
 */
export async function GET(request) {
  try {
    // Try to get user but don't require it
    let user = null;
    let profile = null;
    
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: authData } = await supabase.auth.getUser();
      user = authData?.user;
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single();
        profile = profileData;
      }
    } catch (authError) {
      console.log('Auth check failed, continuing without auth:', authError.message);
    }

    // Return models (free models only for now)
    const models = Object.values(AI_MODELS).filter(m => m.cost.input === 0);

    return NextResponse.json({
      models,
      defaultModel: 'gemini-1.5-flash',
      userPlan: profile?.subscription_plan || 'free',
      authenticated: !!user
    });

  } catch (error) {
    console.error('Models API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/models/validate
 * Validate model configuration (works without auth for testing)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { modelId, parameters = {}, testConnection = false } = body;

    // Validate model exists
    const modelConfig = AI_MODELS[modelId];
    if (!modelConfig) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validatedParams = {
      temperature: Math.max(0, Math.min(2, parameters.temperature || 0.7)),
      maxTokens: Math.min(parameters.maxTokens || 1000, modelConfig.limits.maxTokens),
      topP: Math.max(0, Math.min(1, parameters.topP || 0.95)),
      topK: Math.max(1, Math.min(100, parameters.topK || 40))
    };

    // Test API connection if requested
    let connectionTest = null;
    if (testConnection) {
      const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
      
      if (!hasApiKey) {
        connectionTest = {
          success: false,
          error: 'No API key configured for gemini'
        };
      } else {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
          const model = genAI.getGenerativeModel({ model: modelId });
          
          // Simple test
          await model.generateContent('test');
          
          connectionTest = {
            success: true,
            testedAt: new Date().toISOString()
          };
        } catch (testError) {
          connectionTest = {
            success: false,
            error: testError.message
          };
        }
      }
    }

    return NextResponse.json({
      valid: true,
      modelId,
      modelConfig: {
        name: modelConfig.displayName,
        provider: modelConfig.provider,
        capabilities: modelConfig.capabilities
      },
      parameters: validatedParams,
      connectionTest
    });

  } catch (error) {
    console.error('Model validation error:', error);
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}