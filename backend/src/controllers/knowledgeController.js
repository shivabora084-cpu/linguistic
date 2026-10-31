import { supabase } from '../database/supabaseClient.js';
import { processDocument, retrieveRelevantContext, translateDocument, extractDocumentText } from '../services/ragService.js';
import { generateChatResponse } from '../services/geminiService.js';
import { config } from '../config/index.js';

// In-memory document store for local development / zero-DB mode
const localDocuments = [];
const localChunks = [];

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF or TXT file.' });
    }

    const { originalname, buffer, size, mimetype } = req.file;
    const userId = req.user?.id || 'demo-user';
    const bucket = config.supabase.storageBucket;
    const filePath = `documents/${Date.now()}_${originalname.replace(/\s+/g, '_')}`;

    if (!supabase) {
      // Local in-memory document ingestion
      const extractedText = await extractDocumentText(buffer, mimetype, originalname);
      const docRecord = {
        id: `local-doc-${Date.now()}`,
        user_id: userId,
        title: originalname.replace(/\.[^/.]+$/, ''),
        filename: originalname,
        file_path: filePath,
        file_size: size,
        mime_type: mimetype,
        status: 'ready',
        created_at: new Date().toISOString(),
      };
      localDocuments.unshift(docRecord);

      // Store in local chunk index for keyword retrieval
      localChunks.push({
        documentId: docRecord.id,
        filename: originalname,
        content: extractedText,
      });

      return res.status(201).json({
        success: true,
        message: 'Document uploaded and indexed successfully in local memory.',
        document: docRecord,
      });
    }

    // 1. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (storageError) {
      console.warn('[Storage Warning]:', storageError.message);
      // Even if storage bucket policies need configuration, we still process the document in database
    }

    // 2. Insert record into knowledge_documents
    const { data: docRecord, error: docError } = await supabase
      .from('knowledge_documents')
      .insert({
        user_id: userId,
        title: originalname.replace(/\.[^/.]+$/, ''),
        filename: originalname,
        file_path: filePath,
        file_size: size,
        mime_type: mimetype,
        status: 'uploaded',
      })
      .select()
      .single();

    if (docError) throw docError;

    // 3. Process document in background (extract, chunk, embed)
    processDocument({
      documentId: docRecord.id,
      fileBuffer: buffer,
      mimeType: mimetype,
      filename: originalname,
    }).catch((err) => {
      console.error('[Background Document Processing Error]:', err);
    });

    return res.status(202).json({
      success: true,
      message: 'Document uploaded and is now being processed for semantic search.',
      document: docRecord,
    });
  } catch (err) {
    next(err);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bucket = config.supabase.storageBucket;
      const docsWithUrls = (data || []).map((doc) => {
        let publicUrl = null;
        if (doc.file_path) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(doc.file_path);
          publicUrl = urlData?.publicUrl || null;
        }
        return { ...doc, publicUrl };
      });

      return res.json({ success: true, documents: docsWithUrls });
    }

    return res.json({ success: true, documents: localDocuments });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data: doc } = await supabase
        .from('knowledge_documents')
        .select('file_path')
        .eq('id', id)
        .single();

      if (doc && doc.file_path) {
        await supabase.storage.from(config.supabase.storageBucket).remove([doc.file_path]);
      }

      const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Document deleted successfully' });
    }

    const idx = localDocuments.findIndex((d) => d.id === id);
    if (idx !== -1) {
      localDocuments.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Local document removed.' });
  } catch (err) {
    next(err);
  }
};

export const queryKnowledge = async (req, res, next) => {
  try {
    const { query, language = 'en' } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }

    let contextText = '';
    let sources = [];

    if (supabase) {
      const rag = await retrieveRelevantContext(query);
      contextText = rag.contextText;
      sources = rag.sources;
    } else if (localChunks.length > 0) {
      // Local keyword matching
      const terms = query.toLowerCase().split(' ').filter((t) => t.length > 2);
      const matched = localChunks.filter((chunk) =>
        terms.some((term) => chunk.content.toLowerCase().includes(term))
      );

      if (matched.length > 0) {
        sources = [...new Set(matched.map((m) => m.filename))];
        contextText = matched.map((m) => `[Source: ${m.filename}]\n${m.content.substring(0, 1500)}`).join('\n\n');
      }
    }

    const answer = await generateChatResponse({
      userMessage: query,
      preferredLanguage: language,
      documentContext: contextText,
    });

    return res.json({
      success: true,
      query,
      answer: answer.text,
      sources,
      hasContext: Boolean(contextText),
    });
  } catch (err) {
    next(err);
  }
};

export const handleTranslateDoc = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF or TXT file to translate.' });
    }

    const { originalname, buffer, mimetype } = req.file;
    const targetLanguage = req.body.targetLanguage || 'en';

    const result = await translateDocument({
      fileBuffer: buffer,
      mimeType: mimetype,
      filename: originalname,
      targetLanguage,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
