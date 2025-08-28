// // lib/processors/pdfProcessor.js
// export async function processPDF(buffer) {
//   try {
//     console.log('PDF Processor: Starting processing...');
//     console.log('PDF Processor: Buffer size:', buffer?.length);
    
//     // Check if pdf-parse is available
//     let pdf;
//     try {
//       pdf = (await import('pdf-parse')).default;
//       console.log('PDF Processor: pdf-parse imported successfully');
//     } catch (importError) {
//       console.error('PDF Processor: Failed to import pdf-parse:', importError);
//       return {
//         success: false,
//         error: `pdf-parse library not found: ${importError.message}. Run: npm install pdf-parse`
//       };
//     }

//     if (!buffer || buffer.length === 0) {
//       return {
//         success: false,
//         error: 'Empty or invalid buffer provided'
//       };
//     }

//     console.log('PDF Processor: Starting pdf-parse...');
//     const data = await pdf(buffer);
//     console.log('PDF Processor: PDF parsed successfully, pages:', data.numpages);
    
//     // Extract text and metadata
//     const extractedText = data.text || '';
//     const metadata = {
//       pages: data.numpages || 0,
//       info: data.info || {},
//       version: data.version || 'unknown'
//     };

//     console.log('PDF Processor: Extracted text length:', extractedText.length);

//     // Clean and structure the text
//     const cleanedText = cleanText(extractedText);
//     console.log('PDF Processor: Text cleaned, final length:', cleanedText.length);
    
//     // Split into chunks for AI training
//     const chunks = chunkTextForAI(cleanedText, 800);
//     console.log('PDF Processor: Text chunked into:', chunks.length, 'pieces');
    
//     const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
    
//     return {
//       success: true,
//       text: cleanedText,
//       chunks,
//       metadata,
//       wordCount
//     };
//   } catch (error) {
//     console.error('PDF Processor: Processing error:', error);
//     return {
//       success: false,
//       error: `PDF processing failed: ${error.message}`
//     };
//   }
// }

// // Clean extracted text
// function cleanText(text) {
//   if (!text) return '';
  
//   try {
//     return text
//       .replace(/\s+/g, ' ')           // Multiple spaces to single
//       .replace(/\n\s*\n/g, '\n\n')    // Multiple newlines to double
//       .replace(/[^\S\n]+/g, ' ')      // Clean up whitespace but keep newlines
//       .replace(/\f/g, '\n')           // Form feeds to newlines
//       .trim();
//   } catch (error) {
//     console.error('PDF Processor: Text cleaning error:', error);
//     return text || '';
//   }
// }

// // Split text into manageable chunks for AI training
// function chunkTextForAI(text, maxLength = 800) {
//   if (!text) return [];
  
//   try {
//     // Simple sentence-based chunking
//     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
//     const chunks = [];
//     let currentChunk = '';

//     for (const sentence of sentences) {
//       const trimmedSentence = sentence.trim();
      
//       if ((currentChunk + trimmedSentence).length > maxLength && currentChunk.length > 0) {
//         chunks.push(currentChunk.trim());
//         currentChunk = trimmedSentence + '. ';
//       } else {
//         currentChunk += trimmedSentence + '. ';
//       }
//     }

//     if (currentChunk.trim().length > 0) {
//       chunks.push(currentChunk.trim());
//     }

//     return chunks.filter(chunk => chunk.length > 0);
//   } catch (error) {
//     console.error('PDF Processor: Chunking error:', error);
//     // Return the whole text as one chunk if chunking fails
//     return text ? [text] : [];
//   }
// }

// // Create chunks with metadata for database storage
// export function createChunksWithMetadata(text, fileMetadata = {}, chunkSize = 800) {
//   try {
//     const chunks = chunkTextForAI(text, chunkSize);
    
//     return chunks.map((chunk, index) => ({
//       content: chunk,
//       chunk_index: index,
//       metadata: {
//         ...fileMetadata,
//         word_count: chunk.split(/\s+/).filter(word => word.length > 0).length,
//         char_count: chunk.length,
//         chunk_position: `${index + 1}/${chunks.length}`,
//         estimated_tokens: Math.ceil(chunk.length / 4)
//       }
//     }));
//   } catch (error) {
//     console.error('PDF Processor: Metadata creation error:', error);
//     return [];
//   }
// }

// lib/processors/pdfProcessor.js
import pdf from 'pdf-parse';
import { encode, decode } from "gpt-tokenizer";

export async function processPDF(buffer) {
  try {
    console.log('PDF Processor: Starting processing...');
    console.log('PDF Processor: Buffer size:', buffer.length);
    
    const data = await pdf(buffer);
    console.log('PDF Processor: PDF parsed successfully, pages:', data.numpages);
    
    // Extract and clean text
    const extractedText = data.text;
    console.log('PDF Processor: Extracted text length:', extractedText.length);
    
    const cleanedText = cleanText(extractedText);
    console.log('PDF Processor: Text cleaned, final length:', cleanedText.length);
    
    // ✅ Fix word count calculation - do this BEFORE chunking
    const wordCount = cleanedText
      .split(/\s+/)
      .filter(word => word.trim().length > 0)
      .length;
    
    console.log('PDF Processor: Word count calculated:', wordCount);
    
    // Create chunks
    const chunks = chunkText(cleanedText, process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 800);
    console.log('PDF Processor: Text chunked into:', chunks.length, 'pieces');
    
    return {
      success: true,
      text: cleanedText,
      chunks,
      metadata: {
        pages: data.numpages,
        wordCount, // ✅ This should now show correct count
        fileInfo: data.info || {}
      }
    };
  } catch (error) {
    console.error('PDF Processor: Error processing PDF:', error);
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
//   if (!text) return [];
  
//   // Simple sentence-based chunking
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
