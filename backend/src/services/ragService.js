import pdfParse from 'pdf-parse';
import { supabase } from '../database/supabaseClient.js';
import { generateEmbedding, generateWithFallback } from './geminiService.js';
import { config } from '../config/index.js';

/**
 * Split raw text into manageable chunks with overlap
 */
export const splitTextIntoChunks = (text, chunkSize = 800, overlap = 150) => {
  if (!text) return [];
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let startIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex < clean.length) {
      // Find nearest punctuation or space to avoid cutting words
      const lastSpace = clean.lastIndexOf(' ', endIndex);
      if (lastSpace > startIndex + chunkSize * 0.7) {
        endIndex = lastSpace;
      }
    }
    const chunk = clean.substring(startIndex, endIndex).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    startIndex = endIndex - overlap;
    if (startIndex >= clean.length || endIndex >= clean.length) break;
  }

  return chunks;
};

/**
 * Process uploaded document: extract text, chunk, embed, and index
 */
export const processDocument = async ({ documentId, fileBuffer, mimeType, filename }) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    // 1. Update document status to processing
    await supabase
      .from('knowledge_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // 2. Extract text from buffer
    let extractedText = '';
    if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text;
    } else {
      extractedText = fileBuffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No readable text could be extracted from this document.');
    }

    // 3. Split into semantic chunks
    const chunks = splitTextIntoChunks(extractedText);
    console.log(`[RAG] Document ${filename} split into ${chunks.length} chunks`);

    // 4. Generate embeddings and prepare inserts
    const chunkInserts = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      let embedding = null;
      try {
        embedding = await generateEmbedding(chunkText);
      } catch (embErr) {
        console.warn(`[RAG] Embedding failed for chunk ${i}:`, embErr.message);
      }

      chunkInserts.push({
        document_id: documentId,
        chunk_index: i,
        content: chunkText,
        embedding: embedding, // pgvector column accepts float array
        metadata: {
          filename,
          chunk_index: i,
          char_length: chunkText.length,
        },
      });
    }

    // 5. Batch insert chunks into knowledge_chunks
    if (chunkInserts.length > 0) {
      const { error: insertErr } = await supabase
        .from('knowledge_chunks')
        .insert(chunkInserts);

      if (insertErr) {
        console.error('[RAG] Error inserting knowledge chunks:', insertErr);
        throw insertErr;
      }
    }

    // 6. Mark document as completed
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'completed',
        chunk_count: chunks.length,
      })
      .eq('id', documentId);

    return {
      success: true,
      chunkCount: chunks.length,
    };
  } catch (error) {
    console.error('[RAG Process Error]:', error);
    await supabase
      .from('knowledge_documents')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', documentId);

    throw error;
  }
};

/**
 * Retrieve relevant document context for a user query
 */
export const retrieveRelevantContext = async (query, maxChunks = 4) => {
  if (!supabase) return { contextText: '', sources: [] };

  try {
    const queryEmbedding = await generateEmbedding(query);

    // Try vector similarity search first if embedding succeeded
    if (queryEmbedding) {
      const { data, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.4,
        match_count: maxChunks,
      });

      if (!error && data && data.length > 0) {
        const sources = [...new Set(data.map((d) => d.metadata?.filename || 'Document'))];
        const contextText = data.map((d, idx) => `[Source: ${d.metadata?.filename || 'Doc'} (Excerpt ${idx + 1})]\n${d.content}`).join('\n\n');
        return { contextText, sources };
      }
    }

    // Fallback: Keyword search across chunks
    const terms = query
      .split(' ')
      .filter((t) => t.length > 3)
      .slice(0, 3);

    if (terms.length > 0) {
      const queryPattern = `%${terms[0]}%`;
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('content, metadata')
        .ilike('content', queryPattern)
        .limit(maxChunks);

      if (!error && data && data.length > 0) {
        const sources = [...new Set(data.map((d) => d.metadata?.filename || 'Document'))];
        const contextText = data.map((d, idx) => `[Source: ${d.metadata?.filename || 'Doc'} (Excerpt ${idx + 1})]\n${d.content}`).join('\n\n');
        return { contextText, sources };
      }
    }

    return { contextText: '', sources: [] };
  } catch (err) {
    console.warn('[RAG Retrieve Error]:', err.message);
    return { contextText: '', sources: [] };
  }
};

/**
 * Extract raw text from uploaded document buffer
 */
export const extractDocumentText = async (fileBuffer, mimeType, filename = '') => {
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }
  return fileBuffer.toString('utf-8');
};

/**
 * Translate an entire document into the target language with chunked preservation
 */
export const translateDocument = async ({ fileBuffer, mimeType, filename, targetLanguage = 'en' }) => {
  const extractedText = await extractDocumentText(fileBuffer, mimeType, filename);
  if (!extractedText || !extractedText.trim()) {
    throw new Error('No readable text could be extracted from this document.');
  }

  const cleanText = extractedText.trim();
  const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const translatedParagraphs = [];
  let currentBatch = '';

  for (const para of paragraphs) {
    if ((currentBatch + '\n\n' + para).length < 1500) {
      currentBatch = currentBatch ? currentBatch + '\n\n' + para : para;
    } else {
      if (currentBatch) {
        const res = await generateWithFallback(
          `Translate the following document section accurately into ${targetLanguage}. Maintain paragraph structure and preserve names, numbers, dates, and technical terms:\n\n${currentBatch}`,
          { isJson: false }
        );
        translatedParagraphs.push(res.text.trim());
      }
      currentBatch = para;
    }
  }

  if (currentBatch) {
    const res = await generateWithFallback(
      `Translate the following document section accurately into ${targetLanguage}. Maintain paragraph structure and preserve names, numbers, dates, and technical terms:\n\n${currentBatch}`,
      { isJson: false }
    );
    translatedParagraphs.push(res.text.trim());
  }

  const translatedContent = translatedParagraphs.join('\n\n');

  return {
    filename,
    originalText: extractedText.substring(0, 5000),
    translatedContent,
    targetLanguage,
    characterCount: cleanText.length,
    paragraphCount: paragraphs.length,
  };
};
