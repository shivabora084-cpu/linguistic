import { translateAndExplain } from '../services/geminiService.js';
import { translationCache } from '../services/translationCache.js';
import { supabase } from '../database/supabaseClient.js';

export const handleTranslate = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { text, targetLanguage, sourceLanguage = 'auto', formality = 'auto', mode = 'standard', context = '' } = req.body;
    const userId = req.user?.id || null;

    const result = await translateAndExplain({
      text,
      targetLanguage,
      sourceLanguage,
      formality,
      mode,
      context,
    });

    if (supabase && userId) {
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'translation',
        language: targetLanguage,
        latency_ms: Date.now() - startTime,
        metadata: {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          formality,
          mode,
          cached: Boolean(result.cached),
        },
      });
    }

    return res.json({
      success: true,
      data: result,
      cached: Boolean(result.cached),
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetCacheStats = (req, res) => {
  return res.json({
    success: true,
    stats: translationCache.getStats(),
  });
};

export const handleExplain = async (req, res, next) => {
  try {
    const { phrase, context, targetLanguage = 'en' } = req.body;

    const result = await translateAndExplain({
      text: phrase,
      targetLanguage,
      sourceLanguage: 'auto',
      formality: 'auto',
    });

    return res.json({
      success: true,
      explanation: {
        phrase,
        intendedMeaning: result.intendedMeaning,
        literalTranslation: result.literalTranslation,
        culturalContext: result.culturalContext,
        alternativePhrases: result.alternativePhrases,
        formalityLevel: result.formalityLevel,
      },
    });
  } catch (err) {
    next(err);
  }
};
