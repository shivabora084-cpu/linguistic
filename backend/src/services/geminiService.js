import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { translationCache } from './translationCache.js';

let genAI = null;
let embeddingModelInstance = null;

const MODEL_CANDIDATES = Array.from(
  new Set([
    config.gemini.model,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ].filter(Boolean))
);

if (config.gemini.apiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    embeddingModelInstance = genAI.getGenerativeModel({
      model: 'gemini-embedding-001',
    });
  } catch (err) {
    console.error('[Gemini Service] Initialization error:', err.message);
  }
}

/**
 * Generate content with automatic candidate model fallback
 */
export const generateWithFallback = async (
  prompt,
  { isJson = false, systemInstruction = '', maxTokens = 2048 } = {}
) => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  let lastError = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const genConfig = {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: maxTokens,
      };
      if (isJson) {
        genConfig.responseMimeType = 'application/json';
      }

      const options = { model: modelName, generationConfig: genConfig };
      if (systemInstruction) {
        options.systemInstruction = systemInstruction;
      }

      const model = genAI.getGenerativeModel(options);
      const result = await model.generateContent(prompt);
      return { text: result.response.text(), modelUsed: modelName };
    } catch (err) {
      console.warn(
        `[Gemini Fallback] Model ${modelName} failed (${err.message.substring(0, 100)}). Trying next candidate...`
      );
      lastError = err;
    }
  }
  throw lastError;
};

/**
 * Safely extract and parse JSON from a Gemini response string.
 * Handles markdown fences, unescaped newlines in strings, and provides regex recovery.
 */
function safeParseJSON(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty response for JSON parse');
  }

  // 1. Strip markdown code fences
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // 2. Sanitize unescaped newlines inside strings that break JSON.parse
  cleaned = cleaned.replace(/(?<=:\s*"[^"]*)\r?\n(?=[^"]*")/g, '\\n');

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // 3. Extract the first complete JSON object or array using brace-counting
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let startIdx = -1;
    let openChar, closeChar;

    if (firstBrace === -1 && firstBracket === -1) {
      return extractWithRegex(cleaned);
    } else if (firstBrace === -1) {
      startIdx = firstBracket;
      openChar = '[';
      closeChar = ']';
    } else if (firstBracket === -1) {
      startIdx = firstBrace;
      openChar = '{';
      closeChar = '}';
    } else {
      startIdx = Math.min(firstBrace, firstBracket);
      openChar = cleaned[startIdx] === '{' ? '{' : '[';
      closeChar = openChar === '{' ? '}' : ']';
    }

    let depth = 0;
    let endIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx !== -1) {
      const jsonSubstring = cleaned.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonSubstring);
      } catch (subErr) {
        // Continue to regex extractor
      }
    }

    return extractWithRegex(cleaned);
  }
}

function extractWithRegex(cleaned) {
  const extract = (key) => {
    const match = cleaned.match(
      new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)(?="\\s*[,}\\n])`)
    );
    return match
      ? match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .trim()
      : null;
  };

  const translatedText = extract('translatedText') || extract('text');
  if (translatedText) {
    return {
      translatedText,
      literalTranslation: extract('literalTranslation') || '',
      intendedMeaning: extract('intendedMeaning') || '',
      culturalContext: extract('culturalContext') || '',
      formalityLevel: extract('formalityLevel') || 'auto',
      alternativePhrases: [],
      text: translatedText,
      followUpSuggestions: [],
      sourceDocuments: [],
    };
  }

  throw new Error('Could not parse or extract fields from AI response');
}

/**
 * Health check for Gemini API
 */
export const testGeminiConnection = async () => {
  if (!config.gemini.apiKey || !genAI) {
    return {
      connected: false,
      message: 'GEMINI_API_KEY is not configured in backend environment variables.',
    };
  }

  try {
    const res = await generateWithFallback('ping', { maxTokens: 10 });
    return {
      connected: true,
      message: `Successfully connected to Google Gemini API (Active model: ${res.modelUsed}).`,
      sampleResponse: res.text.trim(),
    };
  } catch (error) {
    return {
      connected: false,
      message: `Gemini API connection error: ${error.message}`,
      error,
    };
  }
};

/**
 * Detect language, code-mixing, sentiment, urgency and clarification needs
 */
export const analyzeUserMessage = async (text, recentHistory = []) => {
  const lower = text.toLowerCase();
  const isAmbiguous = lower === 'cancel it' || lower === 'open account' || lower === 'help' || lower === 'cancel';
  const isTamilMixed = /evlo|venum|illai|nalla|panren|panna|irukka/i.test(lower);
  const isHindiMixed = /jaana|hai|kya|bhai|paisa|karna|lana/i.test(lower);

  if (!genAI) {
    return {
      detectedLanguage: isTamilMixed ? 'ta' : isHindiMixed ? 'hi' : 'en',
      mixedLanguages: isTamilMixed ? ['ta', 'en'] : isHindiMixed ? ['hi', 'en'] : ['en'],
      intent: lower.includes('human') || lower.includes('agent')
        ? 'human_escalation'
        : lower.includes('fee') || isTamilMixed
        ? 'fee_inquiry'
        : 'general_inquiry',
      sentiment: lower.includes('frustrat') || lower.includes('angry') ? 'frustrated' : 'neutral',
      urgency: lower.includes('urgent') || lower.includes('immediate') ? 'high' : 'low',
      isClarificationNeeded: isAmbiguous,
      clarificationPrompt: isAmbiguous ? 'Which service or request would you like to cancel?' : null,
      clarificationOptions: isAmbiguous ? ['Academic Service', 'Account Settings', 'Billing / Fees'] : [],
    };
  }

  const prompt = `You are the intent and linguistic analyzer for LinguaMate AI.
Analyze the following user input in the context of recent conversation history.

Recent Context:
${recentHistory.map((m) => `${m.sender}: ${m.text}`).slice(-3).join('\n')}

User Input: "${text}"

Respond with a JSON object matching this schema:
{
  "detectedLanguage": "primary language code (e.g. en, ta, hi, te, ml, kn, bn)",
  "mixedLanguages": ["array of language codes if mixed e.g. ta and en for Tanglish"],
  "intent": "general_inquiry | college_admission | fee_payment | document_request | clarification_reply | cancel_service | technical_support | human_escalation",
  "sentiment": "satisfied | neutral | confused | frustrated",
  "urgency": "low | medium | high | critical",
  "isClarificationNeeded": true or false,
  "clarificationPrompt": "Question to clarify if user input is ambiguous or null if clear",
  "clarificationOptions": ["Option A", "Option B"] or []
}`;

  try {
    const res = await generateWithFallback(prompt, { isJson: true });
    return safeParseJSON(res.text);
  } catch (err) {
    console.warn('[Gemini Analyze] Fallback to heuristic parser:', err.message);
    return {
      detectedLanguage: isTamilMixed ? 'ta' : isHindiMixed ? 'hi' : 'en',
      mixedLanguages: isTamilMixed ? ['ta', 'en'] : isHindiMixed ? ['hi', 'en'] : ['en'],
      intent: lower.includes('human') || lower.includes('agent') ? 'human_escalation' : 'general_inquiry',
      sentiment: lower.includes('frustrat') || lower.includes('angry') ? 'frustrated' : 'neutral',
      urgency: lower.includes('urgent') || lower.includes('immediate') ? 'high' : 'low',
      isClarificationNeeded: isAmbiguous,
      clarificationPrompt: isAmbiguous ? 'Could you please specify which service or item you are referring to?' : null,
      clarificationOptions: isAmbiguous ? ['Academic Service', 'Account Settings', 'Billing / Fees'] : [],
    };
  }
};

/**
 * Generate contextual conversational AI response
 */
export const generateChatResponse = async ({
  conversationHistory = [],
  userMessage,
  preferredLanguage = 'en',
  documentContext = '',
  userPreferences = {},
}) => {
  if (!genAI) {
    return {
      text: "I am ready to help! To enable full conversational AI with Gemini, please set GEMINI_API_KEY in backend/.env.",
      detectedLanguage: preferredLanguage,
      followUpSuggestions: ["What can LinguaMate AI do?", "How do I upload documents?", "Try a voice conversation"],
      sourceDocuments: [],
    };
  }

  const systemInstruction = `You are LinguaMate AI: "Beyond Translation. Understand Every Conversation."
You are an intelligent multilingual communication assistant.
Core Capabilities:
1. Understand mixed languages naturally (e.g., Tanglish: "Sir, admission fees evlo?", Hinglish: "Kal college jaana hai, what is the timing?").
2. Retain conversation context (e.g. resolve references like "it", "that", "the fee", "the timing" from earlier turns).
3. Ground your answers strictly in the verified Document Knowledge Base when provided. If the information is in the documents, cite the source. Never hallucinate missing facts.
4. Respond in the user's preferred language (${preferredLanguage}) with natural, conversational fluency.
5. If the request is ambiguous, ask a polite clarification question instead of making false assumptions.
6. Provide 2-3 helpful, short follow-up suggestions.

${documentContext ? `VERIFIED KNOWLEDGE BASE CONTEXT:\n${documentContext}\n` : ''}
`;

  const formattedHistory = conversationHistory
    .slice(-8)
    .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');

  const fullPrompt = `${systemInstruction}

Conversation History:
${formattedHistory}

Current User Message: ${userMessage}

Respond in the following JSON format:
{
  "text": "Your helpful response here in the appropriate language",
  "followUpSuggestions": ["Short question 1", "Short question 2", "Short question 3"],
  "sourceReferences": ["Document name and section cited if applicable"]
}`;

  try {
    const res = await generateWithFallback(fullPrompt, { isJson: true });
    const parsed = safeParseJSON(res.text);
    return {
      text: parsed.text || res.text.trim(),
      followUpSuggestions: parsed.followUpSuggestions || [],
      sourceDocuments: parsed.sourceReferences || [],
    };
  } catch (err) {
    console.warn('[Gemini Chat JSON parse failed, retrying plain]:', err.message);
    try {
      // Fallback: ask for plain text without JSON constraint
      const historyLines = conversationHistory
        .slice(-8)
        .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
      const plainRes = await generateWithFallback(
        `${systemInstruction}\nConversation History:\n${historyLines}\n\nUser: ${userMessage}\nAssistant (respond helpfully in ${preferredLanguage}):`,
        { isJson: false }
      );
      const plainText = plainRes.text.trim();
      return {
        text: plainText,
        followUpSuggestions: ['Can you explain more?', 'What are the next steps?', 'Can you give an example?'],
        sourceDocuments: [],
      };
    } catch (fallbackErr) {
      return {
        text: `I'm having trouble reaching the AI engine right now. Please try again in a moment. (${fallbackErr.message})`,
        followUpSuggestions: [],
        sourceDocuments: [],
      };
    }
  }
};

/**
 * Contextual translation with 10 translation modes, caching, cultural context, idioms, and formality options
 */
export const translateAndExplain = async ({
  text,
  targetLanguage = 'en',
  sourceLanguage = 'auto',
  formality = 'auto',
  mode = 'standard',
  context = '',
  speedMode = 'balanced',
}) => {
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      literalTranslation: '',
      intendedMeaning: '',
      formalityLevel: formality,
      culturalContext: '',
      alternativePhrases: [],
      mode,
      speedMode,
    };
  }

  // 1. Check in-memory translation cache for instant response (safe public translation cache)
  const cacheKey = translationCache.generateKey({ text, sourceLanguage, targetLanguage, mode, formality, speedMode });
  const cachedResult = translationCache.get(cacheKey);
  if (cachedResult && !context) {
    return { ...cachedResult, cached: true, speedMode };
  }

  if (!genAI) {
    return {
      translatedText: text,
      literalTranslation: text,
      intendedMeaning: 'Please configure GEMINI_API_KEY to enable AI contextual translation.',
      formalityLevel: formality,
      culturalContext: 'AI key required for cultural breakdown.',
      alternativePhrases: [],
      mode,
      speedMode,
    };
  }

  // 2. Super Fast Mode Execution Pipeline (<500ms target, single concise JSON call)
  if (speedMode === 'fast') {
    const fastPrompt = `You are LinguaMate AI Super Fast Translation Engine.
Translate the input accurately into target language "${targetLanguage}".
Source Language: "${sourceLanguage}"
Input: "${text}"

Directives:
1. Translate faithfully into authentic, natural ${targetLanguage}.
2. Strictly preserve names, numbers, dates, currency, punctuation, and idioms.
3. Output strictly valid JSON without conversational preamble:
{"detectedSourceLanguage": "ISO-code", "translatedText": "translated text here"}`;

    try {
      const fastRes = await generateWithFallback(fastPrompt, {
        isJson: true,
        maxTokens: 512,
      });
      const parsed = safeParseJSON(fastRes.text);
      const fastResult = {
        detectedSourceLanguage: parsed.detectedSourceLanguage || sourceLanguage,
        translatedText: parsed.translatedText || text,
        literalTranslation: parsed.translatedText || text,
        intendedMeaning: 'Super Fast Mode: low-latency direct translation.',
        formalityLevel: formality,
        culturalContext: 'Fast AI translation without conversational overhead.',
        alternativePhrases: [],
        confidenceScore: 0.98,
        mode,
        speedMode: 'fast',
        modelUsed: fastRes.modelUsed,
      };
      translationCache.set(cacheKey, fastResult);
      return fastResult;
    } catch (fastErr) {
      console.warn('[Super Fast Translation fallback triggered]:', fastErr.message);
      try {
        const directRes = await generateWithFallback(
          `Translate accurately to ${targetLanguage}: "${text}". Output only the translated text.`,
          { isJson: false, maxTokens: 256 }
        );
        const translated = directRes.text.trim().replace(/^["']|["']$/g, '');
        const fastFallback = {
          detectedSourceLanguage: sourceLanguage,
          translatedText: translated,
          literalTranslation: translated,
          intendedMeaning: 'Super Fast direct translation.',
          formalityLevel: formality,
          culturalContext: '',
          alternativePhrases: [],
          confidenceScore: 0.92,
          mode,
          speedMode: 'fast',
          modelUsed: directRes.modelUsed,
        };
        translationCache.set(cacheKey, fastFallback);
        return fastFallback;
      } catch (err) {
        console.error('[Fast translation failed, falling through to balanced mode]:', err.message);
      }
    }
  }

  const modeDirectives = {
    standard: 'Accurate, clear, and faithful translation matching standard tone and syntax.',
    natural: 'Highly fluent and conversational, exactly as an authentic native speaker would say it in daily life.',
    professional: 'Polished, executive, and courteous tone suitable for formal business correspondence.',
    casual: 'Relaxed, friendly, and informal tone suited for peer-to-peer chats and close friends.',
    academic: 'Scholarly, precise vocabulary and formal syntactic structure suitable for academic contexts.',
    business: 'Commercial precision, negotiation clarity, and corporate terminology.',
    travel: 'Practical, concise, and courteous terminology for navigation, transit, dining, and emergencies.',
    literal: 'Direct word-for-word translation showing grammatical mapping and syntax differences.',
    cultural: 'Emphasizes deep cultural context, local idioms, etiquette, and regional customs.',
    simplified: 'Plain language with simple vocabulary and short, easy-to-read sentences.',
  };

  const selectedDirective = modeDirectives[mode] || modeDirectives.standard;

  const prompt = `You are LinguaMate AI's Master Contextual Translation & Linguistics Engine.
Translate and analyze the input text with the highest linguistic accuracy:

Input Text: "${text}"
Target Language: "${targetLanguage}"
Source Language: "${sourceLanguage}"
Translation Mode: "${mode}" (${selectedDirective})
Preferred Formality: "${formality}"
${context ? `Conversation / Domain Context: "${context}"` : ''}

Strict Translation Directives:
1. Complete Sentence Comprehension: Grasp the entire sentence and communicative intent before translating. Never do naive word-by-word substitution.
2. Natural Native Fluency: Produce translations that sound authentic, natural, and idiomatic to native speakers of the target language.
3. Idioms, Slang & Cultural Metaphors: Faithfully translate cultural idioms into their appropriate cultural equivalent in the target language (e.g. "break a leg" -> good luck blessing, not physical injury).
4. Entity & Detail Preservation: Strictly preserve names of people/places, numbers, quantities, dates, times, currency amounts, technical terms, and punctuation.
5. Grammar Correction: If the source input has informal errors, typos, or grammatical slips, deduce the intended meaning and produce a grammatically correct translation.
6. Code-Switching / Mixed Language Support: Accurately parse mixed-language inputs (e.g. Tanglish, Hinglish, Spanglish) and render them cleanly into the selected target language.
7. Strict Target Language Adherence: Ensure translatedText is strictly and completely in the target language (${targetLanguage}).
8. Concise, High-Value Insights: Keep intendedMeaning and culturalContext crisp and informative—avoiding unnecessary filler or disclaimers unless genuinely ambiguous.
9. Ambiguity Clarification: If the input is genuinely ambiguous with conflicting meanings, clearly highlight the alternate meanings in intendedMeaning.

Respond with a valid JSON object matching this schema:
{
  "detectedSourceLanguage": "ISO code (e.g. en, ta, hi, es)",
  "translatedText": "The high-accuracy translation in target language adhering strictly to ${mode} mode",
  "literalTranslation": "Word-for-word direct translation showing difference from contextual translation",
  "intendedMeaning": "Clear, concise explanation of speaker's true intent",
  "formalityLevel": "casual | polite | formal",
  "culturalContext": "Explanation of cultural context, etiquette, or idiomatic background if relevant",
  "alternativePhrases": [
    { "text": "Alternative phrasing 1", "tone": "formal" },
    { "text": "Alternative phrasing 2", "tone": "colloquial" }
  ],
  "confidenceScore": 0.95
}`;

  try {
    const res = await generateWithFallback(prompt, { isJson: true });
    const parsed = safeParseJSON(res.text);
    const finalResult = {
      detectedSourceLanguage: parsed.detectedSourceLanguage || sourceLanguage,
      translatedText: parsed.translatedText || text,
      literalTranslation: parsed.literalTranslation || text,
      intendedMeaning: parsed.intendedMeaning || 'Contextual translation completed.',
      formalityLevel: parsed.formalityLevel || formality,
      culturalContext: parsed.culturalContext || 'Standard linguistic expression.',
      alternativePhrases: parsed.alternativePhrases || [],
      confidenceScore: parsed.confidenceScore || 0.95,
      mode,
    };

    // Cache the verified translation
    translationCache.set(cacheKey, finalResult);
    return finalResult;
  } catch (err) {
    console.warn('[Gemini Translate Structured JSON Error]:', err.message, 'Trying direct fallback...');
    try {
      // Second tier: Direct translation without complex JSON wrapper
      const directPrompt = `Translate this sentence accurately into ${targetLanguage} using ${mode} style:
"${text}"
Output only the translated text.`;

      const directRes = await generateWithFallback(directPrompt, { isJson: false });
      const translated = directRes.text.trim().replace(/^["']|["']$/g, '');

      const fallbackResult = {
        detectedSourceLanguage: sourceLanguage,
        translatedText: translated,
        literalTranslation: text,
        intendedMeaning: `Direct translation adhering to ${mode} mode.`,
        formalityLevel: formality || 'polite',
        culturalContext: `Standard contextual expression in ${targetLanguage}.`,
        alternativePhrases: [
          { text: translated, tone: formality || 'polite' }
        ],
        confidenceScore: 0.90,
        mode,
      };

      translationCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    } catch (directErr) {
      console.error('[Gemini Direct Translate Error]:', directErr.message);
      return {
        detectedSourceLanguage: sourceLanguage,
        translatedText: text,
        literalTranslation: text,
        intendedMeaning: 'Contextual translation is temporarily experiencing high load. Please try again.',
        formalityLevel: 'auto',
        culturalContext: 'Translation service re-attempting connection.',
        alternativePhrases: [],
        confidenceScore: 0.50,
        mode,
      };
    }
  }
};

/**
 * Generate vector embedding for text chunk using text-embedding-004
 */
export const generateEmbedding = async (text) => {
  if (!genAI) {
    return null;
  }
  for (const embModel of ['text-embedding-004', 'embedding-001', 'gemini-embedding-001']) {
    try {
      const model = genAI.getGenerativeModel({ model: embModel });
      const result = await model.embedContent(text);
      if (result?.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      // Try next embedding candidate
    }
  }
  return null;
};

/**
 * Summarize older conversation to compress memory and save tokens
 */
export const summarizeConversation = async (messages = []) => {
  if (!genAI || messages.length === 0) return '';
  const prompt = `Summarize the key topics, decisions, user preferences, and unresolved questions from this conversation in 3-4 concise bullet points:
${messages.map((m) => `${m.sender}: ${m.text}`).join('\n')}`;

  try {
    const res = await generateWithFallback(prompt, { isJson: false });
    return res.text.trim();
  } catch (err) {
    return '';
  }
};
