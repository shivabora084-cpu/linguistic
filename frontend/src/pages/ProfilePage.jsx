import React, { useState } from 'react';
import {
  User,
  Settings,
  Volume2,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES } from '../components/common/LanguageSelector';

export const ProfilePage = () => {
  const { user, preferences, updatePreferences } = useAuth();
  const {
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speak,
  } = useVoice();
  const { theme, toggleTheme } = useTheme();

  const [targetLang, setTargetLang] = useState(
    preferences?.target_language || user?.preferredLanguage || 'en'
  );
  const [autoPlay, setAutoPlay] = useState(preferences?.auto_play_audio || false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updatePreferences({
      speechRate,
      speechPitch,
      targetLanguage: targetLang,
      theme,
      autoPlayAudio: autoPlay,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const testVoiceSample = () => {
    speak('This is a test of your preferred speech synthesis settings.', targetLang);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Profile & Audio Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize your speech playback rate, target languages, and interface theme.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences saved successfully to central database!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <User className="w-4 h-4 text-brand-500" />
          <span>Account Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold">Full Name</span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              {user?.fullName || 'Anonymous User'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold">Email Address</span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              {user?.email || 'user@linguamate.ai'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold">Account Role</span>
            <div className="font-bold text-brand-600 dark:text-brand-400 uppercase text-sm">
              {user?.role || 'user'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 uppercase font-semibold">Storage & DB Status</span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
              Central Supabase PostgreSQL
            </div>
          </div>
        </div>
      </div>

      {/* Voice & Speech Preferences */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <span>Voice & Speech Synthesis Controls</span>
        </h2>

        <div className="space-y-4">
          {/* Speaking Rate */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              <span>Speech Rate (Speed):</span>
              <span className="text-brand-600 dark:text-brand-400">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.25"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-brand-600"
            />
          </div>

          {/* Speech Pitch */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              <span>Speech Pitch:</span>
              <span className="text-brand-600 dark:text-brand-400">{speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-brand-600"
            />
          </div>

          {/* Voice Selector */}
          {availableVoices.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Synthesizer Voice:
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const match = availableVoices.find((v) => v.name === e.target.value);
                  if (match) setSelectedVoice(match);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Target Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Response Language:
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Interface Theme</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Toggle)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={testVoiceSample}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Test Voice Sample
          </button>

          <button
            type="submit"
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProfilePage;
