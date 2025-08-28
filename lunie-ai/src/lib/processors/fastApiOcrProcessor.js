// // lib/processors/fastApiOcrProcessor.js

// const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8002';


// export async function processFastApiOCR(buffer, options = {}) {
//   const startTime = Date.now();
  
//   try {
//     console.log('FastAPI OCR: Starting processing...');
//     console.log('FastAPI OCR: Buffer size:', buffer.length);
//     console.log('FastAPI OCR: Service URL:', OCR_SERVICE_URL);
    
//     const {
//       language = 'eng',
//       enhance = true,
//       enhancement_level = 'medium',
//       chunk_text = true,
//       chunk_size = 800
//     } = options;

//     // Create form data
//     const formData = new FormData();
//     const blob = new Blob([buffer], { type: 'image/png' });
//     formData.append('file', blob, 'image.png');
//     formData.append('language', language);
//     formData.append('enhance', enhance.toString());
//     formData.append('enhancement_level', enhancement_level);
//     formData.append('chunk_text', chunk_text.toString());
//     formData.append('chunk_size', chunk_size.toString());

//     console.log('FastAPI OCR: Sending request to Python service...');
    
//     // Call Python OCR service with timeout
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
//     const response = await fetch(`${OCR_SERVICE_URL}/ocr`, {
//       method: 'POST',
//       body: formData,
//       signal: controller.signal,
//       headers: {
//         // Don't set Content-Type header - let browser set it for FormData
//       }
//     });

//     clearTimeout(timeoutId);

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`OCR service error (${response.status}): ${errorText}`);
//     }

//     const result = await response.json();
//     console.log('FastAPI OCR: Received response:', {
//       success: result.success,
//       textLength: result.text?.length || 0,
//       confidence: result.confidence,
//       wordCount: result.word_count,
//       chunkCount: result.chunk_count,
//       processingTime: result.processing_time
//     });

//     if (result.success) {
//       const processingTime = Date.now() - startTime;
      
//       return {
//         success: true,
//         text: result.text,
//         chunks: result.chunks || [],
//         confidence: result.confidence,
//         metadata: {
//           language: result.language,
//           enhanced: result.enhanced,
//           enhancement_level: result.enhancement_level,
//           wordCount: result.word_count,
//           chunkCount: result.chunk_count,
//           processingTimeMs: processingTime,
//           pythonProcessingTime: result.processing_time,
//           processingMethod: 'fastapi_ocr',
//           fileType: 'image_fastapi_ocr',
//           serviceMetadata: result.metadata || {}
//         }
//       };
//     } else {
//       return {
//         success: false,
//         error: result.error || 'OCR processing failed',
//         confidence: result.confidence || 0,
//         text: result.text || '',
//         metadata: {
//           processingMethod: 'fastapi_ocr_failed',
//           error: result.error
//         }
//       };
//     }

//   } catch (error) {
//     const processingTime = Date.now() - startTime;
//     console.error('FastAPI OCR: Request failed:', error);
    
//     // Check if it's a network/connection error
//     if (error.name === 'AbortError') {
//       return {
//         success: false,
//         error: 'OCR processing timed out (60 seconds). Please try with a smaller image.',
//         confidence: 0,
//         metadata: {
//           processingMethod: 'fastapi_ocr_timeout',
//           processingTimeMs: processingTime
//         }
//       };
//     }
    
//     if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
//       return {
//         success: false,
//         error: 'OCR service is not running. Please start the Python OCR service on port 8002.',
//         confidence: 0,
//         metadata: {
//           processingMethod: 'fastapi_ocr_connection_failed',
//           processingTimeMs: processingTime,
//           serviceUrl: OCR_SERVICE_URL
//         }
//       };
//     }

//     return {
//       success: false,
//       error: `FastAPI OCR error: ${error.message}`,
//       confidence: 0,
//       metadata: {
//         processingMethod: 'fastapi_ocr_error',
//         processingTimeMs: processingTime
//       }
//     };
//   }
// }

// // Utility function to check if OCR service is running
// export async function checkOCRServiceHealth() {
//   try {
//     const response = await fetch(`${OCR_SERVICE_URL}/health`, {
//       method: 'GET',
//       timeout: 5000
//     });
    
//     if (response.ok) {
//       const health = await response.json();
//       return {
//         available: true,
//         status: health.status,
//         version: health.version,
//         uptime: health.uptime,
//         tesseract_version: health.tesseract_version
//       };
//     }
    
//     return { available: false, error: `Health check failed: ${response.status}` };
//   } catch (error) {
//     return { available: false, error: error.message };
//   }
// }

// // Utility function to get supported languages
// export async function getOCRSupportedLanguages() {
//   try {
//     const response = await fetch(`${OCR_SERVICE_URL}/languages`);
//     if (response.ok) {
//       return await response.json();
//     }
//     return { supported_languages: [], default: 'eng' };
//   } catch (error) {
//     console.error('Failed to fetch supported languages:', error);
//     return { supported_languages: [], default: 'eng' };
//   }
// }














// lib/processors/fastApiOcrProcessor.js
import { encode, decode } from "gpt-tokenizer";
export async function processFastApiOCR(buffer, options = {}) {
  const {
    language = 'auto',
    enhance = true,
    enhancement_level = 'medium',
    chunk_text = true,
    chunk_size = 1000
  } = options;

  try {
    console.log('🔍 Starting FastAPI OCR processing...');
    console.log('Options:', { language, enhance, enhancement_level });

    // Create form data for FastAPI service
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('file', blob, 'image.png');
    formData.append('language', language === 'auto' ? 'auto' : language);
    formData.append('enhance', enhance.toString());
    formData.append('post_process', 'true');
    formData.append('method', 'auto'); // Let FastAPI choose the best method

    // Make request to FastAPI OCR service
    const response = await fetch('http://localhost:8002/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`FastAPI OCR service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('FastAPI OCR result:', result);

    if (!result.success) {
      throw new Error(result.error || 'FastAPI OCR processing failed');
    }

    // Extract text and metadata
    const text = result.text || '';
    const confidence = result.confidence || 0;
    const methodUsed = result.method_used || 'unknown';

    // Create chunks if requested
    let chunks = [];
    if (chunk_text && text.trim()) {
      chunks = chunkText(text, chunk_size);
    }

    // Prepare metadata
    const metadata = {
      enhanced: enhance,
      fileType: 'image_fastapi_ocr',
      language: result.language || language,
      wordCount: result.word_count || 0,
      chunkCount: chunks.length,
      avgConfidence: confidence,
      serviceMetadata: {
        original_filename: result.metadata?.original_filename || 'image.png',
        file_size: result.metadata?.file_size || buffer.length,
        image_dimensions: result.metadata?.image_dimensions || [0, 0],
        processed_dimensions: result.metadata?.processed_dimensions || [0, 0],
        raw_text_length: result.metadata?.raw_text_length || text.length,
        processed_text_length: result.metadata?.processed_text_length || text.length,
        ocr_method: methodUsed,
        enhancement_applied: enhance,
        processing_time_ms: result.processing_time * 1000 || 0
      },
      processingMethod: methodUsed,
      processingTimeMs: result.processing_time * 1000 || 0,
      pythonProcessingTime: result.processing_time || 0,
      qualityReport: result.quality_report || null
    };

    console.log('✅ FastAPI OCR processing successful!');
    console.log(`- Method: ${methodUsed}`);
    console.log(`- Confidence: ${confidence.toFixed(1)}%`);
    console.log(`- Text length: ${text.length} chars`);
    console.log(`- Word count: ${metadata.wordCount}`);
    console.log(`- Chunks: ${chunks.length}`);

    return {
      success: true,
      text: text,
      chunks: chunks,
      confidence: confidence,
      metadata: metadata
    };

  } catch (error) {
    console.error('❌ FastAPI OCR processing failed:', error);
    
    // Return detailed error for debugging
    return {
      success: false,
      error: error.message,
      metadata: {
        processingMethod: 'fastapi_ocr_failed',
        ocrAttempted: true,
        serviceUrl: 'http://localhost:8002/ocr',
        errorDetails: error.message,
        processingTimeMs: 0
      }
    };
  }
}

// // Helper function to create text chunks
function createTextChunks(text, maxLength = 800) {
  if (!text || !text.trim()) return [];

  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    const sentenceWithPeriod = trimmedSentence + '.';
    
    if ((currentChunk + ' ' + sentenceWithPeriod).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentenceWithPeriod;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentenceWithPeriod : sentenceWithPeriod;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no sentence-based chunking worked, do word-based chunking
  if (chunks.length === 0 && text.trim()) {
    const words = text.trim().split(/\s+/);
    let currentWordChunk = '';
    
    for (const word of words) {
      if ((currentWordChunk + ' ' + word).length > maxLength && currentWordChunk.length > 0) {
        chunks.push(currentWordChunk.trim());
        currentWordChunk = word;
      } else {
        currentWordChunk = currentWordChunk ? currentWordChunk + ' ' + word : word;
      }
    }
    
    if (currentWordChunk.trim()) {
      chunks.push(currentWordChunk.trim());
    }
  }
  
  return chunks;
}


// utils/text-processing.js



/**
 * Token-based chunking using gpt-tokenizer
 * - Max tokens per chunk (default 1000)
 * - Overlap between chunks (default 100)
 * - Logs: tokens, words, characters
 */
export function chunkText(
  text,
  maxTokens = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 1000,
  overlap = 100
) {
  if (!text) return [];

  // Encode full text into tokens
  const tokens = encode(text);
  const chunks = [];
  let start = 0;
  let chunkIndex = 1;

  while (start < tokens.length) {
    const end = Math.min(start + maxTokens, tokens.length);
    const chunkTokens = tokens.slice(start, end);
    const chunkText = decode(chunkTokens).trim();

    if (chunkText.length > 20) {
      const charCount = chunkText.length;
      const wordCount = chunkText.split(/\s+/).length;
      const tokenCount = chunkTokens.length;

      // Push into final chunks
      chunks.push(chunkText);

      // Log info
      console.log(`\n--- Chunk ${chunkIndex} ---`);
      console.log(`Tokens: ${tokenCount}`);
      console.log(`Words: ${wordCount}`);
      console.log(`Characters: ${charCount}`);
      console.log(chunkText.substring(0, 100) + (chunkText.length > 100 ? "..." : "")); // preview first 100 chars

      chunkIndex++;
    }

    // Move forward with overlap
    start += maxTokens - overlap;
  }

  return chunks;
}
