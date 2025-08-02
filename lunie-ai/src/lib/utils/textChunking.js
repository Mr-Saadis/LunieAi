
// ===========================================
// lib/utils/textChunking.js
// ===========================================

export function createChunksWithMetadata(text, metadata = {}, chunkSize = process.env.MAX_CHUNK_SIZE) {
  const chunks = chunkText(text, chunkSize);
  
  return chunks.map((chunk, index) => ({
    content: chunk,
    chunk_index: index,
    metadata: {
      ...metadata,
      word_count: chunk.split(' ').length,
      char_count: chunk.length,
      chunk_position: `${index + 1}/${chunks.length}`
    }
  }));
}

export function chunkText(text, maxLength = 800) {
  // Use sentence-based chunking for better readability
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if ((currentChunk + ' ' + trimmedSentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
