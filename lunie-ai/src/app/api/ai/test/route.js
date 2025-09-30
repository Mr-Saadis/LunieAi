// src/app/api/ai/test/route.js
/**
 * AI Model Testing API
 * Test and compare different models
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { EnhancedGeminiProvider } from '@/lib/ai/providers/gemini-enhanced';
import { getPromptEngineer } from '@/lib/ai/prompt-engineer';
import { getUsageTracker } from '@/lib/ai/usage-tracker';

/**
 * POST /api/ai/test
 * Test AI models with sample prompts
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      prompt,
      models = ['gemini-2.5-flash'],
      temperature = 0.7,
      maxTokens = 1000,
      compareMode = false,
      testType = 'single' // 'single', 'batch', 'benchmark'
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const promptEngineer = getPromptEngineer();
    const usageTracker = getUsageTracker();
    const results = [];

    // Test each model
    for (const modelId of models) {
      try {
        const provider = new EnhancedGeminiProvider(modelId);
        const startTime = Date.now();

        // Build optimized prompt
        const optimizedPrompt = promptEngineer.optimizeForModel(prompt, modelId);

        // Generate response
        const response = await provider.generateResponse(
          [
            { role: 'user', content: optimizedPrompt }
          ],
          {
            temperature,
            maxTokens,
            userId: user.id
          }
        );

        const endTime = Date.now();

        results.push({
          model: modelId,
          success: true,
          response: response.content,
          usage: response.usage,
          duration: endTime - startTime,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        results.push({
          model: modelId,
          success: false,
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Calculate comparison metrics if in compare mode
    let comparison = null;
    if (compareMode && results.length > 1) {
      comparison = calculateComparison(results);
    }

    // Save test results to database
    await saveTestResults(supabase, user.id, {
      prompt,
      results,
      comparison,
      testType,
      parameters: { temperature, maxTokens }
    });

    return NextResponse.json({
      results,
      comparison,
      testId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model test error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/test/benchmark
 * Run benchmark tests
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Benchmark test suite
    const benchmarks = [
      {
        name: 'Simple Question',
        prompt: 'What is the capital of France?',
        expectedKeywords: ['Paris']
      },
      {
        name: 'Math Problem',
        prompt: 'What is 25 * 4 + 10?',
        expectedKeywords: ['110']
      },
      {
        name: 'Creative Writing',
        prompt: 'Write a haiku about technology',
        expectedKeywords: [] // No specific keywords for creative
      },
      {
        name: 'Code Generation',
        prompt: 'Write a JavaScript function to reverse a string',
        expectedKeywords: ['function', 'return', 'split', 'reverse', 'join']
      },
      {
        name: 'Summarization',
        prompt: 'Summarize in one sentence: The Internet has revolutionized communication, commerce, and access to information worldwide.',
        expectedKeywords: ['Internet', 'revolutionized']
      }
    ];

    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-8b'];
    const results = {};

    for (const model of models) {
      results[model] = {
        tests: [],
        avgResponseTime: 0,
        successRate: 0,
        avgTokens: 0
      };

      const provider = new EnhancedGeminiProvider(model);

      for (const benchmark of benchmarks) {
        const startTime = Date.now();
        
        try {
          const response = await provider.generateResponse(
            [{ role: 'user', content: benchmark.prompt }],
            { temperature: 0.3, maxTokens: 500, userId: user.id }
          );

          const duration = Date.now() - startTime;
          const accuracy = calculateAccuracy(response.content, benchmark.expectedKeywords);

          results[model].tests.push({
            name: benchmark.name,
            success: true,
            duration,
            accuracy,
            tokens: response.usage.totalTokens
          });

        } catch (error) {
          results[model].tests.push({
            name: benchmark.name,
            success: false,
            error: error.message
          });
        }
      }

      // Calculate aggregates
      const successfulTests = results[model].tests.filter(t => t.success);
      results[model].successRate = (successfulTests.length / benchmarks.length) * 100;
      
      if (successfulTests.length > 0) {
        results[model].avgResponseTime = 
          successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length;
        results[model].avgTokens = 
          successfulTests.reduce((sum, t) => sum + (t.tokens || 0), 0) / successfulTests.length;
      }
    }

    return NextResponse.json({
      benchmarks: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Benchmark error:', error);
    return NextResponse.json(
      { error: 'Benchmark failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateComparison(results) {
  const successful = results.filter(r => r.success);
  
  if (successful.length === 0) {
    return { error: 'No successful responses to compare' };
  }

  return {
    fastest: successful.reduce((prev, curr) => 
      prev.duration < curr.duration ? prev : curr
    ).model,
    
    avgResponseTime: successful.reduce((sum, r) => sum + r.duration, 0) / successful.length,
    
    tokenEfficiency: successful.map(r => ({
      model: r.model,
      tokensPerMs: r.usage.totalTokens / r.duration
    })).sort((a, b) => b.tokensPerMs - a.tokensPerMs),
    
    successRate: (successful.length / results.length) * 100
  };
}

function calculateAccuracy(response, expectedKeywords) {
  if (expectedKeywords.length === 0) return 100; // No specific expectations
  
  const foundKeywords = expectedKeywords.filter(keyword => 
    response.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return (foundKeywords.length / expectedKeywords.length) * 100;
}

async function saveTestResults(supabase, userId, testData) {
  try {
    const { error } = await supabase
      .from('ai_test_results')
      .insert({
        user_id: userId,
        test_type: testData.testType,
        prompt: testData.prompt,
        results: testData.results,
        comparison: testData.comparison,
        parameters: testData.parameters,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save test results:', error);
    }
  } catch (error) {
    console.error('Save test error:', error);
  }
}