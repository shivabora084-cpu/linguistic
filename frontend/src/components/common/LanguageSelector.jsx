import React from 'react';
import { Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'es', name: 'Spanish', native: 'Español', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', speechCode: 'de-DE' },
  { code: 'ar', name: 'Arabic', native: 'العربية', speechCode: 'ar-SA' },
  { code: 'ja', name: 'Japanese', native: '日本語', speechCode: 'ja-JP' },
  { code: 'zh', name: 'Chinese', native: '中文', speechCode: 'zh-CN' },
];

export const LanguageSelector = ({ selected, onChange, label, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {label && <span className="text-xs text-slate-500 mr-2 font-medium">{label}:</span>}
      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-brand-500">
        <Globe className="w-3.5 h-3.5 text-brand-500" />
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || 'Select Language'}
          className="bg-transparent border-none outline-none pr-3 cursor-pointer text-xs dark:text-slate-200"
        >
          {LANGUAGES.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100"
            >
              {lang.name} ({lang.native})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default LanguageSelector;
