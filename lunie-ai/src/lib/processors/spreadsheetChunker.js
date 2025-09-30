// lib/processors/spreadsheetChunker.js
import { encode, decode } from "gpt-tokenizer";

/**
 * Advanced spreadsheet chunking strategy that preserves semantic meaning
 * and table relationships for optimal RAG performance
 */

export class SpreadsheetChunker {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || parseInt(process.env.CHUNK_SIZE) || 1000;
    this.overlap = options.overlap || parseInt(process.env.CHUNK_OVERLAP) || 100;
    this.preserveHeaders = options.preserveHeaders ?? true;
    this.includeContext = options.includeContext ?? true;
  }

  /**
   * Main chunking method for spreadsheet data
   */
  chunkSpreadsheetData(processedSheets, metadata) {
    const allChunks = [];
    
    // 1. Create workbook overview chunk
    if (this.includeContext) {
      const overviewChunk = this.createWorkbookOverview(metadata, processedSheets);
      if (overviewChunk) allChunks.push(overviewChunk);
    }
    
    // 2. Process each sheet
    for (const sheet of processedSheets) {
      const sheetChunks = this.chunkSheet(sheet);
      allChunks.push(...sheetChunks);
    }
    
    // 3. Add cross-sheet relationship chunks if multiple sheets
    if (processedSheets.length > 1) {
      const relationshipChunks = this.createCrossSheetRelationships(processedSheets);
      allChunks.push(...relationshipChunks);
    }
    
    console.log(`📊 Created ${allChunks.length} semantic chunks from spreadsheet`);
    return allChunks;
  }

  /**
   * Create workbook overview for global context
   */
  createWorkbookOverview(metadata, sheets) {
    const content = `
SPREADSHEET DOCUMENT OVERVIEW
============================

File Type: Excel Workbook (.xlsx)
Total Sheets: ${metadata.totalSheets}
Total Data Rows: ${metadata.totalRows}
Processing Date: ${new Date().toLocaleDateString()}

SHEET SUMMARY:
${sheets.map(sheet => `
• ${sheet.sheetName}:
  - ${sheet.metadata.rows} rows × ${sheet.metadata.columns} columns
  - Data Type: ${sheet.metadata.hasHeaders ? 'Structured table with headers' : 'Raw data'}
  - Contains: ${this.describeSheetContent(sheet)}
`).join('')}

DATA ORGANIZATION:
This spreadsheet contains ${metadata.hasNumericData ? 'quantitative and qualitative' : 'qualitative'} data organized in tabular format. Each sheet represents a different dataset or perspective on the information.

USAGE INSTRUCTIONS:
When answering questions about this data:
1. Consider relationships between columns within each row
2. Look for patterns across multiple rows
3. Use specific sheet names when referencing data
4. Maintain numerical precision for calculations
    `.trim();

    return {
      content,
      type: 'workbook_overview',
      metadata: {
        chunkType: 'overview',
        scope: 'workbook',
        priority: 'high'
      }
    };
  }

  /**
   * Chunk individual sheet with intelligent splitting
   */
  chunkSheet(sheet) {
    const chunks = [];
    
    // Start with sheet's own chunks (overview, headers, data, summary)
    chunks.push(...sheet.chunks);
    
    // Apply token-based splitting if any chunk is too large
    const processedChunks = [];
    
    for (const chunk of chunks) {
      const tokenCount = this.getTokenCount(chunk.content);
      
      if (tokenCount <= this.maxTokens) {
        processedChunks.push(chunk);
      } else {
        // Split large chunks while preserving structure
        const splitChunks = this.splitLargeChunk(chunk);
        processedChunks.push(...splitChunks);
      }
    }
    
    return processedChunks;
  }

  /**
   * Split large chunks while preserving semantic meaning
   */
  splitLargeChunk(chunk) {
    const { content, type, metadata } = chunk;
    
    // Different strategies based on chunk type
    switch (type) {
      case 'data_records':
        return this.splitDataRecords(content, metadata);
      case 'sheet_overview':
        return this.splitOverview(content, metadata);
      default:
        return this.splitGeneric(content, metadata);
    }
  }

  /**
   * Split data records while keeping record integrity
   */
  splitDataRecords(content, metadata) {
    const lines = content.split('\n');
    const headerLine = lines.find(line => line.includes('DATA RECORDS:'));
    const separatorIndex = lines.findIndex(line => line.startsWith('='));
    
    const header = lines.slice(0, separatorIndex + 2).join('\n');
    const records = lines.slice(separatorIndex + 2);
    
    const chunks = [];
    let currentChunk = header;
    let recordCount = 0;
    
    for (const line of records) {
      const testChunk = currentChunk + '\n' + line;
      
      if (this.getTokenCount(testChunk) > this.maxTokens && recordCount > 0) {
        // Start new chunk
        chunks.push({
          content: currentChunk.trim(),
          type: 'data_records',
          metadata: { ...metadata, subChunk: chunks.length + 1 }
        });
        
        currentChunk = header + '\n' + line;
        recordCount = line.startsWith('Record ') ? 1 : 0;
      } else {
        currentChunk = testChunk;
        if (line.startsWith('Record ')) recordCount++;
      }
    }
    
    if (currentChunk.trim().length > header.length) {
      chunks.push({
        content: currentChunk.trim(),
        type: 'data_records',
        metadata: { ...metadata, subChunk: chunks.length + 1 }
      });
    }
    
    return chunks;
  }

  /**
   * Split overview content intelligently
   */
  splitOverview(content, metadata) {
    const sections = content.split(/\n(?=[A-Z][A-Z ]+:)/);
    const chunks = [];
    let currentChunk = '';
    
    for (const section of sections) {
      const testChunk = currentChunk + '\n' + section;
      
      if (this.getTokenCount(testChunk) > this.maxTokens && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          type: 'sheet_overview',
          metadata: { ...metadata, subChunk: chunks.length + 1 }
        });
        currentChunk = section;
      } else {
        currentChunk = testChunk;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        type: 'sheet_overview',
        metadata: { ...metadata, subChunk: chunks.length + 1 }
      });
    }
    
    return chunks;
  }

  /**
   * Generic splitting with overlap preservation
   */
  splitGeneric(content, metadata) {
    const tokens = encode(content);
    const chunks = [];
    let start = 0;
    
    while (start < tokens.length) {
      const end = Math.min(start + this.maxTokens, tokens.length);
      const chunkTokens = tokens.slice(start, end);
      const chunkContent = decode(chunkTokens).trim();
      
      if (chunkContent.length > 50) {
        chunks.push({
          content: chunkContent,
          type: metadata.type || 'generic',
          metadata: { ...metadata, subChunk: chunks.length + 1 }
        });
      }
      
      start += this.maxTokens - this.overlap;
    }
    
    return chunks;
  }

  /**
   * Create cross-sheet relationship chunks
   */
  createCrossSheetRelationships(sheets) {
    const chunks = [];
    
    // Find common columns across sheets
    const commonColumns = this.findCommonColumns(sheets);
    
    if (commonColumns.length > 0) {
      const content = `
CROSS-SHEET RELATIONSHIPS
========================

This workbook contains related data across multiple sheets. Common data fields suggest relationships:

SHARED COLUMNS:
${commonColumns.map(col => `• ${col.column}: appears in sheets [${col.sheets.join(', ')}]`).join('\n')}

ANALYSIS OPPORTUNITIES:
- Compare data across sheets using shared columns
- Look for trends or patterns spanning multiple sheets
- Consider data from different sheets as different perspectives on the same entity

QUERY STRATEGIES:
When asked about relationships or comparisons:
1. Check if the same entities appear in multiple sheets
2. Use shared columns as linking fields
3. Aggregate or compare metrics across sheets
      `.trim();
      
      chunks.push({
        content,
        type: 'cross_sheet_relationships',
        metadata: {
          chunkType: 'relationships',
          scope: 'workbook',
          sheetsInvolved: sheets.map(s => s.sheetName)
        }
      });
    }
    
    return chunks;
  }

  /**
   * Find columns that appear in multiple sheets
   */
  findCommonColumns(sheets) {
    const columnMap = new Map();
    
    sheets.forEach(sheet => {
      if (sheet.metadata.hasHeaders && sheet.chunks.length > 0) {
        // Extract headers from header definition chunk
        const headerChunk = sheet.chunks.find(c => c.type === 'header_definition');
        if (headerChunk) {
          const headers = this.extractHeaders(headerChunk.content);
          headers.forEach(header => {
            if (!columnMap.has(header)) {
              columnMap.set(header, []);
            }
            columnMap.get(header).push(sheet.sheetName);
          });
        }
      }
    });
    
    // Return columns that appear in multiple sheets
    return Array.from(columnMap.entries())
      .filter(([column, sheetList]) => sheetList.length > 1)
      .map(([column, sheets]) => ({ column, sheets }));
  }

  /**
   * Extract headers from header definition content
   */
  extractHeaders(content) {
    const lines = content.split('\n');
    const headers = [];
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s+(.+)$/);
      if (match) {
        headers.push(match[1].trim());
      }
    }
    
    return headers;
  }

  /**
   * Describe sheet content for overview
   */
  describeSheetContent(sheet) {
    const descriptions = [];
    
    if (sheet.metadata.hasHeaders) {
      descriptions.push('structured data with column headers');
    }
    
    if (sheet.metadata.numericColumns && sheet.metadata.numericColumns.length > 0) {
      descriptions.push(`${sheet.metadata.numericColumns.length} numeric columns for calculations`);
    }
    
    const dataChunks = sheet.chunks.filter(c => c.type === 'data_records');
    if (dataChunks.length > 0) {
      descriptions.push(`${dataChunks.length} data sections`);
    }
    
    return descriptions.length > 0 ? descriptions.join(', ') : 'tabular data';
  }

  /**
   * Get token count for content
   */
  getTokenCount(content) {
    try {
      return encode(content).length;
    } catch (error) {
      // Fallback to character-based estimation
      return Math.ceil(content.length / 4);
    }
  }
}

/**
 * Factory function to create spreadsheet chunker
 */
export function createSpreadsheetChunker(options = {}) {
  return new SpreadsheetChunker(options);
}