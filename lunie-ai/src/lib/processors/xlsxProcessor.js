// lib/processors/xlsxProcessor.js
import * as XLSX from 'xlsx';
import { encode, decode } from "gpt-tokenizer";

/**
 * Enhanced XLSX processor that preserves tabular structure for better RAG performance
 * Maintains relationships between rows/columns and creates semantic chunks
 * FIXED: Proper header mapping to preserve actual column names
 */

export async function processXlsx(buffer) {
  try {
    console.log('📊 XLSX Processor: Starting enhanced processing...');
    console.log('📊 Buffer size:', buffer.length);

    const workbook = XLSX.read(buffer, { 
      type: 'buffer',
      cellDates: true,
      cellStyles: true,
      cellFormulas: true // Keep formulas for context
    });
    
    console.log('📊 Workbook loaded successfully');
    console.log('📊 Sheet names:', workbook.SheetNames);

    const processedSheets = [];
    let allChunks = [];
    
    // Process each worksheet with structure preservation
    for (const sheetName of workbook.SheetNames) {
      console.log(`📊 Processing sheet "${sheetName}"...`);
      
      const worksheet = workbook.Sheets[sheetName];
      const sheetResult = await processWorksheet(sheetName, worksheet);
      
      if (sheetResult.success) {
        processedSheets.push(sheetResult);
        allChunks.push(...sheetResult.chunks);
      }
    }
    
    // Create summary metadata
    const metadata = createWorkbookMetadata(workbook, processedSheets);
    
    console.log('📊 Processing complete:', {
      sheets: processedSheets.length,
      totalChunks: allChunks.length,
      totalRows: metadata.totalRows,
      totalColumns: metadata.maxColumns
    });

    return {
      success: true,
      chunks: allChunks,
      metadata,
      processedSheets
    };
    
  } catch (error) {
    console.error('❌ XLSX Processor Error:', error);
    return {
      success: false,
      error: error.message,
      chunks: []
    };
  }
}

/**
 * Process individual worksheet with enhanced structure preservation
 */
async function processWorksheet(sheetName, worksheet) {
  try {
    // Get sheet range and dimensions
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    const numRows = range.e.r - range.s.r + 1;
    const numCols = range.e.c - range.s.c + 1;
    
    console.log(`📊 Sheet "${sheetName}": ${numRows} rows × ${numCols} columns`);
    
    // Convert to structured data with proper header preservation
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false // Convert dates/numbers to strings for consistency
    });
    
    if (jsonData.length === 0) {
      return {
        success: true,
        sheetName,
        chunks: [],
        metadata: { rows: 0, columns: 0, hasHeaders: false }
      };
    }
    
    // Analyze sheet structure with proper header detection
    const structure = analyzeSheetStructure(jsonData);
    
    console.log(`📊 Sheet "${sheetName}" structure:`, {
      hasHeaders: structure.hasHeaders,
      headers: structure.headers.slice(0, 5), // Log first 5 headers
      numericColumns: structure.numericColumns
    });
    
    // Create different types of chunks based on content
    const chunks = [];
    
    // 1. Combined sheet overview + header definitions chunk (metadata context)
    chunks.push(createCombinedOverviewChunk(sheetName, structure, jsonData));
    
    // 2. Data chunks (grouped rows with context)
    const dataChunks = createDataChunks(sheetName, jsonData, structure);
    chunks.push(...dataChunks);
    
    // 3. Summary statistics chunk (if numeric data)
    if (structure.hasNumericData) {
      const summaryChunk = createSummaryChunk(sheetName, jsonData, structure);
      if (summaryChunk) chunks.push(summaryChunk);
    }
    
    return {
      success: true,
      sheetName,
      chunks: chunks.filter(chunk => chunk && chunk.content.length > 50),
      metadata: {
        rows: numRows,
        columns: numCols,
        hasHeaders: structure.hasHeaders,
        dataTypes: structure.columnTypes,
        numericColumns: structure.numericColumns,
        actualHeaders: structure.headers // Store actual headers
      }
    };
    
  } catch (error) {
    console.error(`❌ Error processing sheet "${sheetName}":`, error);
    return { success: false, sheetName, chunks: [], error: error.message };
  }
}

/**
 * Analyze sheet structure with improved header detection
 * FIXED: Better logic to preserve actual column names
 */
function analyzeSheetStructure(jsonData) {
  if (jsonData.length === 0) {
    return { hasHeaders: false, headers: [], columnTypes: {}, numericColumns: [] };
  }
  
  const firstRow = jsonData[0];
  const sampleRows = jsonData.slice(1, Math.min(11, jsonData.length)); // Sample first 10 data rows
  
  // Enhanced header detection logic
  // Check if first row contains meaningful headers vs data
  const hasHeaders = detectHeaders(firstRow, sampleRows);
  
  // FIXED: Always use actual first row values when headers are detected
  const headers = hasHeaders ? 
    firstRow.map((cell, i) => {
      // Handle empty headers or convert them to readable format
      const header = cell && cell.toString().trim();
      return header || `Column ${i + 1}`;
    }) : 
    firstRow.map((_, i) => `Column ${i + 1}`);
  
  console.log('📊 Detected headers:', headers);
  
  // Analyze column types
  const columnTypes = {};
  const numericColumns = [];
  let hasNumericData = false;
  
  headers.forEach((header, colIndex) => {
    // Get sample data for this column (skip header row if it exists)
    const columnData = (hasHeaders ? sampleRows : jsonData.slice(0, 10))
      .map(row => row[colIndex])
      .filter(cell => cell !== null && cell !== undefined && cell !== '');
    
    if (columnData.length === 0) {
      columnTypes[header] = 'empty';
      return;
    }
    
    const numericCount = columnData.filter(cell => !isNaN(parseFloat(cell))).length;
    const dateCount = columnData.filter(cell => isDateLike(cell)).length;
    
    if (numericCount / columnData.length > 0.7) {
      columnTypes[header] = 'numeric';
      numericColumns.push(header);
      hasNumericData = true;
    } else if (dateCount / columnData.length > 0.7) {
      columnTypes[header] = 'date';
    } else {
      columnTypes[header] = 'text';
    }
  });
  
  return {
    hasHeaders,
    headers,
    columnTypes,
    numericColumns,
    hasNumericData
  };
}

/**
 * Improved header detection function
 * FIXED: Better logic to distinguish headers from data
 */
function detectHeaders(firstRow, sampleRows) {
  if (sampleRows.length === 0) return false;
  
  // Count how many cells in first row look like headers
  const headerLikeCount = firstRow.filter(cell => {
    if (!cell || typeof cell !== 'string') return false;
    
    const cellStr = cell.toString().trim();
    if (cellStr.length === 0) return false;
    
    // Check if it looks like a header:
    // - Contains letters (not just numbers)
    // - Common header patterns (PLO, Column, Student, etc.)
    // - Not a pure number
    return /[a-zA-Z]/.test(cellStr) && 
           !/^\d+\.?\d*$/.test(cellStr) &&
           cellStr.length > 0;
  }).length;
  
  // If most cells in first row look like headers, assume it's a header row
  const headerRatio = headerLikeCount / firstRow.length;
  
  console.log(`📊 Header detection: ${headerLikeCount}/${firstRow.length} cells look like headers (ratio: ${headerRatio.toFixed(2)})`);
  
  return headerRatio > 0.5; // At least 50% of cells look like headers
}

/**
 * Create combined overview and header definitions chunk
 * REFACTORED: Merges sheet overview and column definitions into single chunk
 */
function createCombinedOverviewChunk(sheetName, structure, jsonData) {
  let content = `SPREADSHEET OVERVIEW: ${sheetName}\n`;
  content += '='.repeat(30 + sheetName.length) + '\n\n';
  
  // Sheet structure information
  content += 'Sheet Structure:\n';
  content += `- Name: ${sheetName}\n`;
  content += `- Total Rows: ${jsonData.length}\n`;
  content += `- Total Columns: ${structure.headers.length}\n`;
  content += `- Has Headers: ${structure.hasHeaders ? 'Yes' : 'No'}\n\n`;
  
  // Column information with data types
  content += 'Column Information:\n';
  structure.headers.forEach((header, i) => {
    content += `• ${header}: ${structure.columnTypes[header] || 'unknown'} data\n`;
  });
  
  // Add column definitions section if headers detected
  if (structure.hasHeaders) {
    content += '\n' + 'COLUMN DEFINITIONS:\n';
    content += '-'.repeat(20) + '\n\n';
    content += 'This spreadsheet contains the following data columns:\n\n';
    
    structure.headers.forEach((header, i) => {
      content += `${i + 1}. ${header}\n`;
    });
    
    content += '\nThese columns work together to form a complete data record. ';
    content += 'When answering questions about this data, consider relationships between these fields.\n';
  }
  
  // Numeric columns highlight
  if (structure.numericColumns.length > 0) {
    content += `\nNumeric Columns (for calculations): ${structure.numericColumns.join(', ')}\n`;
  }
  
  // Data preview
  content += '\nData Preview:\n';
  jsonData.slice(0, 3).forEach((row, i) => {
    content += `Row ${i + 1}: ${row.join(' | ')}\n`;
  });
  
  return {
    content: content.trim(),
    type: 'sheet_overview',
    metadata: {
      sheetName,
      chunkType: 'overview_with_headers',
      rows: jsonData.length,
      columns: structure.headers.length,
      hasHeaders: structure.hasHeaders
    }
  };
}

/**
 * Create semantic data chunks with preserved relationships
 * FIXED: Uses actual header names instead of generic column names
 */
function createDataChunks(sheetName, jsonData, structure) {
  const chunks = [];
  const dataRows = structure.hasHeaders ? jsonData.slice(1) : jsonData;
  const headers = structure.headers; // These are now the ACTUAL headers from Excel
  
  if (dataRows.length === 0) return chunks;
  
  // Group rows into semantic chunks (10-15 rows per chunk for context)
  const chunkSize = 12;
  
  for (let i = 0; i < dataRows.length; i += chunkSize) {
    const rowGroup = dataRows.slice(i, Math.min(i + chunkSize, dataRows.length));
    
    let content = `DATA RECORDS: ${sheetName} (Rows ${i + 1}-${i + rowGroup.length})\n`;
    content += '='.repeat(content.length - 1) + '\n\n';
    
    // Add structured data with clear relationships using ACTUAL header names
    rowGroup.forEach((row, rowIndex) => {
      const actualRowNum = structure.hasHeaders ? i + rowIndex + 2 : i + rowIndex + 1;
      content += `Record ${actualRowNum}:\n`;
      
      // FIXED: Now uses actual header names (PLO1, PLO2, Student Reg#, etc.)
      headers.forEach((header, colIndex) => {
        const value = row[colIndex];
        if (value !== null && value !== undefined && value !== '') {
          content += `  • ${header}: ${value}\n`;
        }
      });
      
      content += '\n';
    });
    
    // Add semantic context for better understanding
    if (structure.hasNumericData) {
      const numericSummary = generateRowGroupSummary(rowGroup, headers, structure.numericColumns);
      if (numericSummary) {
        content += `Summary for this group:\n${numericSummary}\n`;
      }
    }
    
    chunks.push({
      content: content.trim(),
      type: 'data_records',
      metadata: {
        sheetName,
        chunkType: 'data',
        startRow: i + 1,
        endRow: i + rowGroup.length,
        recordCount: rowGroup.length
      }
    });
  }
  
  return chunks;
}

/**
 * Create summary chunk for numeric data
 */
function createSummaryChunk(sheetName, jsonData, structure) {
  if (!structure.hasNumericData || structure.numericColumns.length === 0) {
    return null;
  }
  
  const dataRows = structure.hasHeaders ? jsonData.slice(1) : jsonData;
  const headers = structure.headers;
  
  let content = `SUMMARY STATISTICS: ${sheetName}\n`;
  content += '='.repeat(content.length - 1) + '\n\n';
  
  structure.numericColumns.forEach(columnName => {
    const colIndex = headers.indexOf(columnName);
    if (colIndex === -1) return;
    
    const values = dataRows
      .map(row => parseFloat(row[colIndex]))
      .filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      content += `${columnName}:\n`;
      content += `  • Total: ${sum.toLocaleString()}\n`;
      content += `  • Average: ${avg.toFixed(2)}\n`;
      content += `  • Minimum: ${min.toLocaleString()}\n`;
      content += `  • Maximum: ${max.toLocaleString()}\n`;
      content += `  • Count: ${values.length} records\n\n`;
    }
  });
  
  return {
    content: content.trim(),
    type: 'summary_statistics',
    metadata: {
      sheetName,
      chunkType: 'summary',
      numericColumns: structure.numericColumns.length
    }
  };
}

/**
 * Generate summary for a group of rows
 */
function generateRowGroupSummary(rows, headers, numericColumns) {
  if (numericColumns.length === 0) return null;
  
  let summary = '';
  
  numericColumns.forEach(columnName => {
    const colIndex = headers.indexOf(columnName);
    if (colIndex === -1) return;
    
    const values = rows
      .map(row => parseFloat(row[colIndex]))
      .filter(val => !isNaN(val));
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      summary += `  • ${columnName}: ${values.length} values, total ${sum.toLocaleString()}, avg ${avg.toFixed(2)}\n`;
    }
  });
  
  return summary || null;
}

/**
 * Create workbook metadata
 */
function createWorkbookMetadata(workbook, processedSheets) {
  const totalRows = processedSheets.reduce((sum, sheet) => sum + (sheet.metadata?.rows || 0), 0);
  const maxColumns = Math.max(...processedSheets.map(sheet => sheet.metadata?.columns || 0));
  
  return {
    fileType: 'xlsx',
    totalSheets: workbook.SheetNames.length,
    sheetNames: workbook.SheetNames,
    totalRows,
    maxColumns,
    processedSheets: processedSheets.length,
    hasNumericData: processedSheets.some(sheet => sheet.metadata?.numericColumns?.length > 0),
    processingTimestamp: new Date().toISOString()
  };
}

/**
 * Utility function to detect date-like strings
 */
function isDateLike(value) {
  if (typeof value !== 'string') return false;
  
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY
    /^\w+ \d{1,2}, \d{4}$/           // Month DD, YYYY
  ];
  
  return datePatterns.some(pattern => pattern.test(value.trim()));
}

/**
 * Enhanced chunking with token-based splitting and context preservation
 */
export function chunkText(
  text,
  maxTokens = parseInt(process.env.CHUNK_SIZE) || 1000,
  overlap = parseInt(process.env.CHUNK_OVERLAP) || 100
) {
  if (!text) return [];

  try {
    const tokens = encode(text);
    
    if (tokens.length <= maxTokens) {
      return [text.trim()];
    }

    const chunks = [];
    let start = 0;
    let chunkIndex = 1;

    while (start < tokens.length) {
      const end = Math.min(start + maxTokens, tokens.length);
      const chunkTokens = tokens.slice(start, end);
      const chunkText = decode(chunkTokens).trim();

      if (chunkText.length > 50) { // Filter very short chunks
        chunks.push(chunkText);
        
        console.log(`📊 Chunk ${chunkIndex}: ${chunkTokens.length} tokens, ${chunkText.length} chars`);
        chunkIndex++;
      }

      start += maxTokens - overlap;
    }

    return chunks;
    
  } catch (error) {
    console.error('❌ Chunking error:', error);
    // Fallback to simple splitting
    return [text];
  }
}