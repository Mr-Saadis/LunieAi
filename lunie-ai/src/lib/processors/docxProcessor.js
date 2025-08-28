// lib/processors/docxProcessor.js - FIXED VERSION
import mammoth from 'mammoth';
import { encode, decode } from "gpt-tokenizer";

// Process DOCX file buffer and extract text

export async function processDocx(buffer) {
  try {
    console.log('DOCX Processor: Starting processing...');
    console.log('DOCX Processor: Buffer size:', buffer.length);

    console.log('DOCX Processor: Starting mammoth extraction...');
    
    // ✅ FIX: Pass buffer directly to mammoth
    const result = await mammoth.extractRawText({ buffer: buffer });
    
    console.log('DOCX Processor: Text extracted successfully');
    console.log('DOCX Processor: Raw text length:', result.value.length);
    
    // Check for conversion messages/warnings
    if (result.messages && result.messages.length > 0) {
      console.log('DOCX Processor: Conversion messages:', result.messages);
    }

    // Clean and structure the text
    const cleanedText = cleanText(result.value);
    console.log('DOCX Processor: Text cleaned, final length:', cleanedText.length);

    // Calculate word count
    const wordCount = cleanedText
      .split(/\s+/)
      .filter(word => word.trim().length > 0)
      .length;
    
    console.log('DOCX Processor: Word count calculated:', wordCount);

    // Create chunks
    const chunks = chunkText(cleanedText, process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 800);
    console.log('DOCX Processor: Text chunked into:', chunks.length, 'pieces');

    return {
      success: true,
      text: cleanedText,
      chunks,
      metadata: {
        wordCount,
        originalLength: result.value.length,
        conversionMessages: result.messages || [],
        fileType: 'docx'
      }
    };
  } catch (error) {
    console.error('DOCX Processor: Error processing DOCX:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\n\s*\n/g, '\n\n')    // Multiple newlines to double
    .replace(/[^\w\s\n.,!?;:()\-'"]/g, '') // Remove special chars but keep punctuation
    .trim();
}

// function chunkText(text, maxLength = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 800) {
//   const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
//   const chunks = [];
//   let currentChunk = '';

//   for (const sentence of sentences) {
//     const trimmedSentence = sentence.trim();
//     if ((currentChunk + trimmedSentence).length > maxLength && currentChunk.length > 0) {
//       chunks.push(currentChunk.trim());
//       currentChunk = trimmedSentence + '. ';
//     } else {
//       currentChunk += trimmedSentence + '. ';
//     }
//   }

//   if (currentChunk.trim().length > 0) {
//     chunks.push(currentChunk.trim());
//   }

//   return chunks.filter(chunk => chunk.length > 20); // Filter out very short chunks
// }


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
