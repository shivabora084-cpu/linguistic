import React, { createContext, useContext, useState, useEffect } from 'react';
import { appStorage } from '../utils/storage';
import { authApi } from '../api/authApi';

interface SettingsContextType {
  speedMode: 'fast' | 'balanced';
  setSpeedMode: (mode: 'fast' | 'balanced') => void;
  toggleSpeedMode: () => void;
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  lastLatencyMs: number | null;
  recordLatency: (ms: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [speedMode, setSpeedModeState] = useState<'fast' | 'balanced'>('fast');
  const [sourceLanguage, setSourceLanguageState] = useState<string>('auto');
  const [targetLanguage, setTargetLanguageState] = useState<string>('ta');
  const [speechRate, setSpeechRateState] = useState<number>(1.0);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSpeed = await appStorage.get<'fast' | 'balanced'>('pref_speed_mode', 'fast');
      const savedSrc = await appStorage.get<string>('pref_source_lang', 'auto');
      const savedTgt = await appStorage.get<string>('pref_target_lang', 'ta');
      const savedRate = await appStorage.get<number>('pref_speech_rate', 1.0);
      const savedTheme = await appStorage.get<'dark' | 'light'>('pref_theme', 'dark');

      setSpeedModeState(savedSpeed);
      setSourceLanguageState(savedSrc);
      setTargetLanguageState(savedTgt);
      setSpeechRateState(savedRate);
      setThemeState(savedTheme);
    };

    loadSettings();
  }, []);

  const setSpeedMode = (mode: 'fast' | 'balanced') => {
    setSpeedModeState(mode);
    appStorage.set('pref_speed_mode', mode);
    authApi.updatePreferences({ speedMode: mode }).catch(() => {});
  };

  const toggleSpeedMode = () => {
    const nextMode = speedMode === 'fast' ? 'balanced' : 'fast';
    setSpeedMode(nextMode);
  };

  const setSourceLanguage = (lang: string) => {
    setSourceLanguageState(lang);
    appStorage.set('pref_source_lang', lang);
  };

  const setTargetLanguage = (lang: string) => {
    setTargetLanguageState(lang);
    appStorage.set('pref_target_lang', lang);
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    appStorage.set('pref_speech_rate', rate);
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    appStorage.set('pref_theme', t);
  };

  const recordLatency = (ms: number) => {
    setLastLatencyMs(ms);
  };

  return (
    <SettingsContext.Provider
      value={{
        speedMode,
        setSpeedMode,
        toggleSpeedMode,
        sourceLanguage,
        setSourceLanguage,
        targetLanguage,
        setTargetLanguage,
        speechRate,
        setSpeechRate,
        theme,
        setTheme,
        lastLatencyMs,
        recordLatency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};

