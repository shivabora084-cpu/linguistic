export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto Detect', flag: '✨', speechLocale: 'en-US' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', speechLocale: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechLocale: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechLocale: 'ta-IN' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechLocale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechLocale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechLocale: 'de-DE' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechLocale: 'ja-JP' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', flag: '🇨🇳', speechLocale: 'zh-CN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechLocale: 'ar-SA' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechLocale: 'ru-RU' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', speechLocale: 'pt-BR' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speechLocale: 'it-IT' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechLocale: 'ko-KR' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechLocale: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', speechLocale: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', speechLocale: 'mr-IN' },
];

export const getLanguageByCode = (code: string): Language => {
  return SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase()) || SUPPORTED_LANGUAGES[1];
};
