// lib/processors/xlsxProcessor.js
import * as XLSX from 'xlsx';
import { encode, decode } from "gpt-tokenizer";


export async function processXlsx(buffer) {
  try {
    console.log('XLSX Processor: Starting processing...');
    console.log('XLSX Processor: Buffer size:', buffer.length);

    console.log('XLSX Processor: Reading workbook...');
    
    // Read the workbook from buffer
    const workbook = XLSX.read(buffer, { 
      type: 'buffer',
      cellDates: true,
      cellStyles: true 
    });
    
    console.log('XLSX Processor: Workbook loaded successfully');
    console.log('XLSX Processor: Sheet names:', workbook.SheetNames);

    let combinedText = '';
    const sheetData = [];
    
    // Process each worksheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`XLSX Processor: Processing sheet "${sheetName}"...`);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON for easier processing
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, // Use array of arrays format
        defval: '', // Default value for empty cells
        blankrows: false // Skip blank rows
      });
      
      console.log(`XLSX Processor: Sheet "${sheetName}" has ${jsonData.length} rows`);
      
      if (jsonData.length > 0) {
        // Convert spreadsheet data to readable text
        const sheetText = convertSheetToText(sheetName, jsonData);
        combinedText += sheetText + '\n\n';
        
        sheetData.push({
          name: sheetName,
          rows: jsonData.length,
          columns: jsonData[0]?.length || 0,
          text: sheetText
        });
      }
    }
    
    console.log('XLSX Processor: All sheets processed');
    console.log('XLSX Processor: Combined text length:', combinedText.length);

    // Clean the combined text
    const cleanedText = cleanText(combinedText);
    console.log('XLSX Processor: Text cleaned, final length:', cleanedText.length);

    // Calculate word count
    const wordCount = cleanedText
      .split(/\s+/)
      .filter(word => word.trim().length > 0)
      .length;
    
    console.log('XLSX Processor: Word count calculated:', wordCount);

    // Create chunks
    const chunks = chunkText(cleanedText, process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 800);
    console.log('XLSX Processor: Text chunked into:', chunks.length, 'pieces');

    return {
      success: true,
      text: cleanedText,
      chunks,
      metadata: {
        wordCount,
        totalSheets: workbook.SheetNames.length,
        sheetNames: workbook.SheetNames,
        sheetData: sheetData,
        originalLength: combinedText.length,
        fileType: 'xlsx'
      }
    };
  } catch (error) {
    console.error('XLSX Processor: Error processing XLSX:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function convertSheetToText(sheetName, jsonData) {
  let text = `Sheet: ${sheetName}\n`;
  text += '=' .repeat(sheetName.length + 7) + '\n\n';
  
  if (jsonData.length === 0) {
    return text + 'No data in this sheet.\n';
  }
  
  // Check if first row looks like headers
  const firstRow = jsonData[0];
  const hasHeaders = firstRow.every(cell => 
    typeof cell === 'string' && cell.trim().length > 0
  );
  
  if (hasHeaders && jsonData.length > 1) {
    // Process as table with headers
    const headers = firstRow;
    text += `Headers: ${headers.join(', ')}\n\n`;
    
    // Process data rows
    for (let i = 1; i < Math.min(jsonData.length, 101); i++) { // Limit to 100 data rows
      const row = jsonData[i];
      const rowData = [];
      
      for (let j = 0; j < Math.min(headers.length, row.length); j++) {
        if (row[j] !== null && row[j] !== undefined && row[j] !== '') {
          rowData.push(`${headers[j]}: ${row[j]}`);
        }
      }
      
      if (rowData.length > 0) {
        text += `Row ${i}: ${rowData.join(', ')}\n`;
      }
    }
    
    if (jsonData.length > 101) {
      text += `... and ${jsonData.length - 101} more rows\n`;
    }
  } else {
    // Process as simple data without headers
    for (let i = 0; i < Math.min(jsonData.length, 50); i++) { // Limit to 50 rows
      const row = jsonData[i];
      const rowText = row
        .filter(cell => cell !== null && cell !== undefined && cell !== '')
        .join(', ');
      
      if (rowText.trim()) {
        text += `Row ${i + 1}: ${rowText}\n`;
      }
    }
    
    if (jsonData.length > 50) {
      text += `... and ${jsonData.length - 50} more rows\n`;
    }
  }
  
  return text;
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple newlines to double
    .replace(/[^\w\s\n.,!?;:()\-'"]/g, '') // Remove special chars but keep punctuation
    .trim();
}

// function chunkText(text, maxLength = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 800) {
//   // For spreadsheet data, split by sheets first, then by size
//   const sections = text.split(/Sheet: [^\n]+\n=+\n/);
//   const chunks = [];
  
//   for (const section of sections) {
//     if (section.trim().length === 0) continue;
    
//     if (section.length <= maxLength) {
//       chunks.push(section.trim());
//     } else {
//       // Split large sections by sentences
//       const sentences = section.split(/[.\n]+/).filter(s => s.trim().length > 0);
//       let currentChunk = '';
      
//       for (const sentence of sentences) {
//         const trimmedSentence = sentence.trim();
//         if ((currentChunk + trimmedSentence).length > maxLength && currentChunk.length > 0) {
//           chunks.push(currentChunk.trim());
//           currentChunk = trimmedSentence + '. ';
//         } else {
//           currentChunk += trimmedSentence + '. ';
//         }
//       }
      
//       if (currentChunk.trim().length > 0) {
//         chunks.push(currentChunk.trim());
//       }
//     }
//   }
  
//   return chunks.filter(chunk => chunk.length > 20); // Filter out very short chunks
// }


/**
 * Token-based chunking for spreadsheet-like data
 * - Splits text by sheets first
 * - Then splits large sheets into token-based chunks
 * - Supports overlap between chunks
 */
export function chunkText(
  text,
  maxTokens = process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : 1000,
  overlap = process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP) : 100
) {
  if (!text) return [];

  // Step 1: split by sheets (e.g., "Sheet: Sales\n====")
  const sections = text.split(/Sheet: [^\n]+\n=+\n/);
  const chunks = [];
  let chunkIndex = 1;

  for (const section of sections) {
    if (section.trim().length === 0) continue;

    // Encode into tokens
    const tokens = encode(section);

    // If small section, keep it as a single chunk
    if (tokens.length <= maxTokens) {
      const chunkText = decode(tokens).trim();
      if (chunkText.length > 20) {
        chunks.push(chunkText);

        console.log(`\n--- Chunk ${chunkIndex} ---`);
        console.log(`Tokens: ${tokens.length}`);
        console.log(`Words: ${chunkText.split(/\s+/).length}`);
        console.log(`Characters: ${chunkText.length}`);
        console.log(chunkText.substring(0, 100) + (chunkText.length > 100 ? "..." : ""));
        chunkIndex++;
      }
    } else {
      // Step 2: break large section into overlapping token chunks
      let start = 0;
      while (start < tokens.length) {
        const end = Math.min(start + maxTokens, tokens.length);
        const chunkTokens = tokens.slice(start, end);
        const chunkText = decode(chunkTokens).trim();

        if (chunkText.length > 20) {
          chunks.push(chunkText);

          // Log info for debugging
          console.log(`\n--- Chunk ${chunkIndex} ---`);
          console.log(`Tokens: ${chunkTokens.length}`);
          console.log(`Words: ${chunkText.split(/\s+/).length}`);
          console.log(`Characters: ${chunkText.length}`);
          console.log(chunkText.substring(0, 100) + (chunkText.length > 100 ? "..." : ""));
          chunkIndex++;
        }

        start += maxTokens - overlap; // move with overlap
      }
    }
  }

  return chunks;
}
