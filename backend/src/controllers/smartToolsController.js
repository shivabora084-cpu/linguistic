import * as smartTools from '../services/smartToolsService.js';

export const handleSmartToolAction = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { action, text, language = 'en', targetLanguage = 'en', context = '', word = '' } = req.body;

    let result = null;
    switch (action) {
      case 'grammar':
        result = await smartTools.correctGrammar({ text, language });
        break;
      case 'explain':
        result = await smartTools.explainMeaning({ text, language });
        break;
      case 'tone':
        result = await smartTools.detectTone({ text, language });
        break;
      case 'smart_reply':
        result = await smartTools.generateSmartReplies({ context, incomingMessage: text, preferredLanguage: targetLanguage });
        break;
      case 'simplify':
        result = await smartTools.simplifyText({ text, targetLanguage });
        break;
      case 'pronounce':
        result = await smartTools.getPronunciationGuide({ text, language });
        break;
      case 'compare':
        result = await smartTools.compareTranslations({ text, targetLanguage });
        break;
      case 'dictionary':
        result = await smartTools.lookupContextDictionary({ word: word || text, context, targetLanguage });
        break;
      default:
        return res.status(400).json({ success: false, error: `Unsupported smart tool action: ${action}` });
    }

    return res.json({
      success: true,
      action,
      data: result,
      latencyMs: Date.now() - startTime,
    });
  } catch (err) {
    next(err);
  }
};
