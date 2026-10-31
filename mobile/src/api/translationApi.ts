import { apiClient } from './client';

export interface TranslationParams {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  formality?: 'casual' | 'polite' | 'formal' | 'auto';
  mode?: string;
  context?: string;
  speedMode?: 'fast' | 'balanced';
}

export interface TranslationResult {
  detectedSourceLanguage: string;
  translatedText: string;
  literalTranslation?: string;
  intendedMeaning?: string;
  formalityLevel?: string;
  culturalContext?: string;
  alternativePhrases?: Array<{ text: string; tone: string }>;
  confidenceScore?: number;
  mode: string;
  speedMode?: 'fast' | 'balanced';
  modelUsed?: string;
}

export interface TranslationResponse {
  success: boolean;
  data: TranslationResult;
  cached: boolean;
  latencyMs: number;
  speedMode: 'fast' | 'balanced';
}

export const translationApi = {
  async translate(params: TranslationParams): Promise<TranslationResponse> {
    const res = await apiClient.post<TranslationResponse>('/translation/translate', {
      ...params,
      sourceLanguage: params.sourceLanguage || 'auto',
      formality: params.formality || 'auto',
      mode: params.mode || 'standard',
      speedMode: params.speedMode || 'balanced',
    });
    return res.data;
  },

  async explain(phrase: string, targetLanguage = 'en') {
    const res = await apiClient.post('/translation/explain', { phrase, targetLanguage });
    return res.data;
  },

  async getCapabilities() {
    const res = await apiClient.get('/speech/capabilities');
    return res.data;
  },
};
