// lib/processors/docxProcessor.js - FIXED VERSION
import mammoth from 'mammoth';

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
    const chunks = chunkText(cleanedText, 800);
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

function chunkText(text, maxLength = 800) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if ((currentChunk + trimmedSentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence + '. ';
    } else {
      currentChunk += trimmedSentence + '. ';
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 20); // Filter out very short chunks
}