// src/app/api/ai/test-simple/route.js
/**
 * Simplified test route for AI without auth (development only)
 */

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple GET test
export async function GET() {
  try {
    // Check if API key exists
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
    
    return NextResponse.json({
      status: 'ready',
      hasApiKey,
      apiKeyPreview: hasApiKey ? 
        `${process.env.GOOGLE_AI_API_KEY.substring(0, 4)}...${process.env.GOOGLE_AI_API_KEY.slice(-4)}` : 
        'Not configured',
      message: 'Test endpoint is working'
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

// Simple POST test without auth
export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt = "Hello, say hi back!" } = body;

    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({
        error: 'GOOGLE_AI_API_KEY not configured in environment variables'
      }, { status: 500 });
    }

    console.log('Testing with API key:', process.env.GOOGLE_AI_API_KEY.substring(0, 10) + '...');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('Sending prompt:', prompt);

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Got response:', text.substring(0, 100) + '...');

    return NextResponse.json({
      success: true,
      prompt,
      response: text,
      model: "gemini-1.5-flash",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test error:', error);
    
    // Detailed error response
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: {
        hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
        apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length || 0
      }
    }, { status: 500 });
  }
}