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
