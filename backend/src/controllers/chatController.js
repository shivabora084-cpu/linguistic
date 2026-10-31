import { supabase } from '../database/supabaseClient.js';
import {
  analyzeUserMessage,
  generateChatResponse,
} from '../services/geminiService.js';
import { retrieveRelevantContext } from '../services/ragService.js';
import { localConversations, localMessages } from './conversationController.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export const handleChatMessage = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { text, language = 'en', inputType = 'text', speedMode = 'balanced' } = req.body;
    let conversationId = req.body.conversationId;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    let conversationHistory = [];

    // 1. Resolve or create conversation
    if (supabase) {
      try {
        if (!conversationId || !isUUID(conversationId)) {
          const insertPayload = {
            title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
            language,
          };
          if (validUserId) insertPayload.user_id = validUserId;

          const { data: newConv, error: convErr } = await supabase
            .from('conversations')
            .insert(insertPayload)
            .select()
            .single();

          if (!convErr && newConv) {
            conversationId = newConv.id;
          }
        } else {
          const historyLimit = speedMode === 'fast' ? 3 : 10;
          const { data: hist } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(historyLimit);

          if (hist) conversationHistory = hist;
        }
      } catch (dbErr) {
        console.warn('[Chat DB Resolve Warning]:', dbErr.message);
      }
    }

    if (!conversationId || !isUUID(conversationId)) {
      if (!conversationId || !localConversations.has(conversationId)) {
        conversationId = conversationId || 'conv-' + Date.now();
        localConversations.set(conversationId, {
          id: conversationId,
          user_id: rawUserId,
          title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
          language,
          is_saved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [{ count: 0 }],
        });
        localMessages.set(conversationId, []);
      }
      conversationHistory = localMessages.get(conversationId) || [];
    }

    // 2. Perform linguistic and intent analysis (Mixed-language, sentiment, urgency, ambiguity)
    const analysis = await analyzeUserMessage(text, conversationHistory);

    // 3. Check for grounded document context if relevant
    let ragResult = { contextText: '', sources: [] };
    if (analysis.intent !== 'human_escalation' && !analysis.isClarificationNeeded) {
      ragResult = await retrieveRelevantContext(text);
    }

    // 4. Determine response: Clarification vs Contextual Answer
    let aiResponseText = '';
    let followUpSuggestions = [];
    let isClarification = false;
    let clarificationOptions = [];

    if (analysis.isClarificationNeeded && analysis.clarificationPrompt) {
      isClarification = true;
      aiResponseText = analysis.clarificationPrompt;
      clarificationOptions = analysis.clarificationOptions || [];
      followUpSuggestions = clarificationOptions;
    } else {
      const generated = await generateChatResponse({
        conversationHistory,
        userMessage: text,
        preferredLanguage: language,
        documentContext: ragResult.contextText,
      });

      aiResponseText = generated.text;
      followUpSuggestions = generated.followUpSuggestions;
    }

    // 5. Save messages to Supabase if DB is connected
    let userMsgId = null;
    let assistantMsgId = null;

    if (supabase && conversationId && isUUID(conversationId)) {
      try {
        // Save User message
        const { data: savedUserMsg } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender: 'user',
            text,
            detected_language: analysis.detectedLanguage,
            mixed_languages: analysis.mixedLanguages,
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            urgency: analysis.urgency,
          })
          .select()
          .single();

        if (savedUserMsg) userMsgId = savedUserMsg.id;

        // Save Assistant message
        const { data: savedAssistantMsg } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender: 'assistant',
            text: aiResponseText,
            detected_language: language,
            is_clarification: isClarification,
            clarification_options: clarificationOptions,
            source_documents: ragResult.sources,
          })
          .select()
          .single();

        if (savedAssistantMsg) assistantMsgId = savedAssistantMsg.id;

        // Log analytics event
        const latencyMs = Date.now() - startTime;
        const analyticsPayload = {
          event_type: 'chat_message',
          language: analysis.detectedLanguage,
          input_type: inputType,
          latency_ms: latencyMs,
          metadata: {
            intent: analysis.intent,
            mixed_languages: analysis.mixedLanguages,
            has_rag: ragResult.sources.length > 0,
          },
        };
        if (validUserId) analyticsPayload.user_id = validUserId;
        await supabase.from('analytics_events').insert(analyticsPayload).catch(() => {});
      } catch (saveErr) {
        console.warn('[Chat DB Save Warning]:', saveErr.message);
      }
    } else {
      // Local in-memory persistence
      userMsgId = 'msg-' + Date.now();
      assistantMsgId = 'msg-' + (Date.now() + 1);

      const msgs = localMessages.get(conversationId) || [];
      msgs.push({
        id: userMsgId,
        conversation_id: conversationId,
        sender: 'user',
        text,
        created_at: new Date().toISOString(),
      });
      msgs.push({
        id: assistantMsgId,
        conversation_id: conversationId,
        sender: 'assistant',
        text: aiResponseText,
        detected_language: language,
        is_clarification: isClarification,
        clarification_options: clarificationOptions,
        source_documents: ragResult.sources,
        created_at: new Date().toISOString(),
      });
      localMessages.set(conversationId, msgs);

      const conv = localConversations.get(conversationId);
      if (conv) {
        conv.updated_at = new Date().toISOString();
        conv.messages = [{ count: msgs.length }];
      }
    }

    // 6. Return comprehensive structured response
    return res.json({
      success: true,
      conversationId,
      messageId: assistantMsgId,
      userMessageId: userMsgId,
      response: {
        text: aiResponseText,
        detectedLanguage: analysis.detectedLanguage,
        mixedLanguages: analysis.mixedLanguages,
        intent: analysis.intent,
        sentiment: analysis.sentiment,
        urgency: analysis.urgency,
        isClarification,
        clarificationOptions,
        followUpSuggestions,
        sourceDocuments: ragResult.sources,
      },
      latencyMs: Date.now() - startTime,
      speedMode,
    });
  } catch (err) {
    next(err);
  }
};
