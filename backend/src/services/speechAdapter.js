import { config } from '../config/index.js';

export const getSpeechCapabilities = () => {
  return {
    sttProvider: config.speech.sttProvider,
    ttsProvider: config.speech.ttsProvider,
    browserSupported: true,
    totalLanguages: 16,
    supportedLanguages: [
      { code: 'en', locale: 'en-US', name: 'English', nativeName: 'English', translation: true, stt: true, tts: true },
      { code: 'hi', locale: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', translation: true, stt: true, tts: true },
      { code: 'ta', locale: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', translation: true, stt: true, tts: true },
      { code: 'te', locale: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', translation: true, stt: true, tts: true },
      { code: 'ml', locale: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', translation: true, stt: true, tts: true },
      { code: 'kn', locale: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', translation: true, stt: true, tts: true },
      { code: 'bn', locale: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', translation: true, stt: true, tts: true },
      { code: 'mr', locale: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', translation: true, stt: true, tts: true },
      { code: 'gu', locale: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', translation: true, stt: true, tts: true },
      { code: 'pa', locale: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', translation: true, stt: true, tts: true },
      { code: 'es', locale: 'es-ES', name: 'Spanish', nativeName: 'Español', translation: true, stt: true, tts: true },
      { code: 'fr', locale: 'fr-FR', name: 'French', nativeName: 'Français', translation: true, stt: true, tts: true },
      { code: 'de', locale: 'de-DE', name: 'German', nativeName: 'Deutsch', translation: true, stt: true, tts: true },
      { code: 'ar', locale: 'ar-SA', name: 'Arabic', nativeName: 'العربية', translation: true, stt: true, tts: true },
      { code: 'ja', locale: 'ja-JP', name: 'Japanese', nativeName: '日本語', translation: true, stt: true, tts: true },
      { code: 'zh', locale: 'zh-CN', name: 'Chinese', nativeName: '中文', translation: true, stt: true, tts: true },
    ],
  };
};

export const transcribeAudio = async (audioBuffer, mimeType) => {
  // If external STT (e.g., Google Cloud Speech) is configured, handle here.
  // By default, the frontend uses the high-precision Web Speech API.
  return {
    provider: config.speech.sttProvider,
    transcript: '',
    note: 'Browser Web Speech API is the active low-cost provider.',
  };
};

export const synthesizeSpeech = async (text, language = 'en', voiceOptions = {}) => {
  // Returns instructions and parameters for speech synthesis
  return {
    provider: config.speech.ttsProvider,
    text,
    language,
    speechRate: voiceOptions.speechRate || 1.0,
    speechPitch: voiceOptions.speechPitch || 1.0,
  };
};
