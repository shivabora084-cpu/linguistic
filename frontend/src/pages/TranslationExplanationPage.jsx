import React, { useState, useEffect } from 'react';
import {
  Languages,
  Sparkles,
  BookOpen,
  Volume2,
  ArrowRight,
  Info,
  CheckCircle2,
  Mic,
  MicOff,
  Copy,
  Check,
  Zap,
  Sliders,
  FileCheck2,
  HelpCircle,
  Gauge,
  Layers,
  VolumeX,
} from 'lucide-react';
import LanguageSelector, { LANGUAGES } from '../components/common/LanguageSelector';
import { useVoice, SPEECH_LOCALE_MAP } from '../context/VoiceContext';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const TranslationExplanationPage = () => {
  const [inputText, setInputText] = useState('Break a leg in your presentation today!');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('ta');
  const [formality, setFormality] = useState('auto');
  const [mode, setMode] = useState('standard');
  const [activeTab, setActiveTab] = useState('translate'); // translate | grammar | explain | tone | simplify | pronounce | compare

  const [result, setResult] = useState({
    translatedText: 'இன்று உங்கள் விளக்கக்காட்சியில் சிறப்பாகச் செயல்பட வாழ்த்துகள்!',
    literalTranslation: 'இன்றைய விளக்கக்காட்சியில் காலை உடைத்துக்கொள்ளுங்கள்!',
    intendedMeaning: 'Wishing good luck before a major performance or presentation.',
    culturalContext: 'In English theater and arts, saying "good luck" is superstitiously thought to bring bad luck. Therefore, speakers say "break a leg" to mean the exact opposite—wishing success.',
    formalityLevel: 'polite',
    confidenceScore: 0.98,
    alternativePhrases: [
      { text: 'வெற்றி பெற வாழ்த்துகள் (Wishing you victory)', tone: 'formal' },
      { text: 'நல்லா பண்ணுங்க! (Do well!)', tone: 'casual' },
    ],
  });

  const [smartToolData, setSmartToolData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCached, setIsCached] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [copied, setCopied] = useState(false);

  const { speak, isSpeaking, stopSpeaking, startListening, stopListening, isListening, transcript, clearTranscript } = useVoice();

  // Sync spoken transcript into inputText
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
      clearTranscript();
    }
  }, [transcript]);

  const presetExamples = [
    { label: 'Idiom: Break a leg', text: 'Break a leg in your interview!', lang: 'hi', mode: 'cultural' },
    { label: 'Tanglish: Admission fees', text: 'Sir, admission fees evlo? Installments irukka?', lang: 'en', mode: 'natural' },
    { label: 'Academic: Quantum Computing', text: 'The superposition of states enables exponential parallelism in quantum algorithms.', lang: 'ta', mode: 'academic' },
    { label: 'Business: Negotiation', text: 'We are pleased to present our revised proposal subject to mutual terms.', lang: 'fr', mode: 'business' },
    { label: 'Travel: Train Station', text: 'Where can I find the express train to the international airport?', lang: 'ja', mode: 'travel' },
  ];

  const handleTranslateAndExplain = async (overrideText, overrideLang, overrideMode) => {
    const textToQuery = overrideText || inputText;
    const langToQuery = overrideLang || targetLanguage;
    const modeToQuery = overrideMode || mode;

    if (!textToQuery.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/translation/translate', {
        text: textToQuery,
        targetLanguage: langToQuery,
        sourceLanguage,
        formality,
        mode: modeToQuery,
      });

      if (res.success && res.data) {
        setResult(res.data);
        setIsCached(Boolean(res.cached));
        setLatencyMs(res.latencyMs || null);
        setActiveTab('translate');
      }
    } catch (err) {
      setError(err.message || 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSmartTool = async (action) => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setError('');
    setActiveTab(action);

    try {
      const res = await apiClient.post('/smart-tools/execute', {
        action,
        text: inputText,
        language: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
      });

      if (res.success) {
        setSmartToolData(res.data);
        setLatencyMs(res.latencyMs);
        setIsCached(false);
      }
    } catch (err) {
      setError(err.message || `Smart tool ${action} failed.`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setInputText(preset.text);
    setTargetLanguage(preset.lang);
    setMode(preset.mode || 'standard');
    handleTranslateAndExplain(preset.text, preset.lang, preset.mode);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      const locale = SPEECH_LOCALE_MAP[sourceLanguage] || 'en-US';
      startListening(locale);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Languages className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Advanced Multilingual Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-accuracy translation across 10 distinct modes, native cultural breakdown, and real-time grammar analysis.
          </p>
        </div>

        {/* Latency & Cache Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          {isCached ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant Cache ({latencyMs || 0}ms)</span>
            </span>
          ) : latencyMs ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-medium">
              <Gauge className="w-3.5 h-3.5 text-brand-500" />
              <span>Engine Latency: {latencyMs}ms</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Preset Demonstrations */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-400">Quick Test Cases:</span>
        {presetExamples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => loadPreset(ex)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Input Form Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
        {/* Source & Voice Controls */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Input Text / Phrase / Idiom
            </label>
            <span className="text-[11px] text-slate-400">
              {inputText.length} characters
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type any sentence, mixed language (e.g. Tanglish/Hinglish), or click mic to dictate..."
              className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm outline-none resize-none leading-relaxed"
            />
            {/* Mic button inside textarea */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white dark:bg-navy-900 text-slate-500 hover:text-brand-500 border border-slate-200 dark:border-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Dictate with microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Translation Mode & Language Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Target Language */}
          <LanguageSelector
            selected={targetLanguage}
            onChange={setTargetLanguage}
            label="Target Language"
          />

          {/* Translation Mode Selector (10 Modes) */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
            <Sliders className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              aria-label="Translation Mode"
              className="bg-transparent border-none outline-none w-full cursor-pointer text-xs dark:text-slate-200 capitalize"
            >
              <option value="standard">Mode: Standard</option>
              <option value="natural">Mode: Natural Conversational</option>
              <option value="professional">Mode: Professional Executive</option>
              <option value="casual">Mode: Casual Friendly</option>
              <option value="academic">Mode: Academic Scholarly</option>
              <option value="business">Mode: Business Commercial</option>
              <option value="travel">Mode: Travel & Transit</option>
              <option value="literal">Mode: Literal Word-for-Word</option>
              <option value="cultural">Mode: Cultural & Idiomatic</option>
              <option value="simplified">Mode: Simplified Plain Text</option>
            </select>
          </div>

          {/* Formality Selector */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
            <select
              value={formality}
              onChange={(e) => setFormality(e.target.value)}
              aria-label="Formality Level"
              className="bg-transparent border-none outline-none w-full cursor-pointer text-xs dark:text-slate-200"
            >
              <option value="auto">Formality: Auto</option>
              <option value="polite">Formality: Polite</option>
              <option value="formal">Formality: Formal</option>
              <option value="casual">Formality: Casual</option>
            </select>
          </div>

          {/* Primary Translate Action */}
          <button
            type="button"
            onClick={() => handleTranslateAndExplain()}
            disabled={!inputText.trim() || loading}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Translate & Explain</span>
          </button>
        </div>

        {/* Smart AI Feature Pills */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Smart AI Actions:</span>
            <button
              onClick={() => handleRunSmartTool('grammar')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'grammar'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-3 h-3 inline mr-1" />
              Grammar Check
            </button>
            <button
              onClick={() => handleRunSmartTool('explain')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'explain'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-3 h-3 inline mr-1" />
              Meaning Breakdown
            </button>
            <button
              onClick={() => handleRunSmartTool('tone')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'tone'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3 inline mr-1" />
              Tone Detector
            </button>
            <button
              onClick={() => handleRunSmartTool('simplify')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'simplify'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Simplify Text
            </button>
            <button
              onClick={() => handleRunSmartTool('pronounce')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'pronounce'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Volume2 className="w-3 h-3 inline mr-1" />
              Pronunciation
            </button>
            <button
              onClick={() => handleRunSmartTool('compare')}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                activeTab === 'compare'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3 h-3 inline mr-1" />
              Compare Styles
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingIndicator text="LinguaMate AI is processing semantic context and linguistic nuance..." />}

      {/* Smart Tool Specific Output Cards */}
      {activeTab !== 'translate' && smartToolData && (
        <div className="p-6 rounded-3xl border border-brand-200 dark:border-brand-900 bg-brand-50/30 dark:bg-navy-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Smart Tool Result: {activeTab.replace('_', ' ')}</span>
            </h2>
            <button
              onClick={() => setActiveTab('translate')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Return to Translation
            </button>
          </div>

          {/* Grammar Output */}
          {activeTab === 'grammar' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Corrected Text</span>
                <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  {smartToolData.correctedText}
                </p>
              </div>
              {smartToolData.corrections && smartToolData.corrections.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Corrections:</span>
                  {smartToolData.corrections.map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="line-through text-red-500">{c.original}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.correction}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tone Output */}
          {activeTab === 'tone' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Primary Tone</span>
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400 capitalize">{smartToolData.primaryTone}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Formality Rating</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{smartToolData.formalityRating}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Polite Alternative</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{smartToolData.politeAlternative}</p>
              </div>
            </div>
          )}

          {/* Pronunciation Output */}
          {activeTab === 'pronounce' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Phonetic Spelling</span>
                  <p className="text-xl font-bold tracking-wide text-brand-600 dark:text-brand-400 mt-1">
                    {smartToolData.phoneticSpelling}
                  </p>
                  {smartToolData.ipa && <p className="text-xs text-slate-400 font-mono">[{smartToolData.ipa}]</p>}
                </div>
                <button
                  onClick={() => speak(inputText, targetLanguage)}
                  className="p-3 rounded-2xl bg-brand-600 text-white hover:bg-brand-500 shadow-md transition"
                  title="Listen to native audio"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Tip: {smartToolData.audioTips}
              </p>
            </div>
          )}

          {/* Compare Styles Output */}
          {activeTab === 'compare' && smartToolData.options && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Stylistic Variations:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {smartToolData.options.map((opt, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                      {opt.style}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{opt.translation}</p>
                    <p className="text-[11px] text-slate-400">{opt.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simplify Output */}
          {activeTab === 'simplify' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Simplified Plain Text</span>
              <p className="text-base font-semibold text-slate-900 dark:text-white">{smartToolData.simplifiedText}</p>
            </div>
          )}

          {/* Explain Output */}
          {activeTab === 'explain' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Deep Intended Meaning</span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{smartToolData.intendedMeaning}</p>
              {smartToolData.subtext && <p className="text-xs text-slate-500 dark:text-slate-400 italic">Subtext: {smartToolData.subtext}</p>}
            </div>
          )}
        </div>
      )}

      {/* Main Analysis Results Display */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Translation comparison */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="capitalize">{result.mode || mode} Translation</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium capitalize">
                {formality} formality
              </span>
            </div>

            {/* Contextual Translation (Recommended) */}
            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                  Contextual Result
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(result.translatedText)}
                    className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    title="Copy translation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => (isSpeaking ? stopSpeaking() : speak(result.translatedText, targetLanguage))}
                    className="inline-flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    title={isSpeaking ? 'Stop audio' : 'Listen'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                </div>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {result.translatedText}
              </p>
            </div>

            {/* Literal Translation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Literal Word-for-Word Translation
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                "{result.literalTranslation}"
              </p>
            </div>

            {/* Intended Meaning */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Speaker's True Intended Meaning
              </span>
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                {result.intendedMeaning}
              </p>
            </div>
          </div>

          {/* Right: Cultural Nuance & Formality Alternatives */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Cultural Context & Etiquette</span>
            </h2>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Cultural Context Explanation</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {result.culturalContext}
              </p>
            </div>

            {/* Alternative Formality Phrasings */}
            {result.alternativePhrases && result.alternativePhrases.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alternative Ways to Say This:
                </div>
                <div className="space-y-2">
                  {result.alternativePhrases.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {alt.text}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {alt.tone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TranslationExplanationPage;
