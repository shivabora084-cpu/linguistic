import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Sparkles,
  Send,
  Languages,
} from 'lucide-react';
import { useVoice, SPEECH_LOCALE_MAP } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import AudioWaveform from '../components/common/AudioWaveform';
import LanguageSelector from '../components/common/LanguageSelector';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const LiveVoicePage = () => {
  const { user, preferences } = useAuth();
  const {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    speak,
    stopSpeaking,
    isSpeaking,
    repeatLastSpoken,
    speechRate,
    setSpeechRate,
    supported,
  } = useVoice();

  const [selectedLanguage, setSelectedLanguage] = useState(
    preferences?.target_language || user?.preferredLanguage || 'en'
  );
  const [editableText, setEditableText] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync spoken transcript into editable text
  useEffect(() => {
    if (transcript) {
      setEditableText((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
      clearTranscript();
    }
  }, [transcript]);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(SPEECH_LOCALE_MAP[selectedLanguage] || 'en-US');
    }
  };

  const handleSendVoiceQuery = async () => {
    const textToSend = editableText.trim();
    if (!textToSend || loading) return;

    if (isListening) stopListening();
    setLastUserMessage(textToSend);
    setEditableText('');
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/chat/voice', {
        text: textToSend,
        language: selectedLanguage,
        inputType: 'voice',
      });

      if (res.success) {
        setAiResponse(res.response);
        // Automatically speak AI response using browser SpeechSynthesis
        speak(res.response.text, res.response.detectedLanguage || selectedLanguage);
      }
    } catch (err) {
      setError(err.message || 'Voice request failed.');
    } finally {
      setLoading(false);
    }
  };

  const cycleSpeed = () => {
    if (speechRate === 1.0) setSpeechRate(0.75);
    else if (speechRate === 0.75) setSpeechRate(1.25);
    else setSpeechRate(1.0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Mic className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Live Voice Conversation</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Talk naturally in English, Tamil, Hindi, or mixed phrases. Preview, edit, and listen to spoken replies.
          </p>
        </div>

        <LanguageSelector
          selected={selectedLanguage}
          onChange={setSelectedLanguage}
          label="Voice Language"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Interactive Voice Hub */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-xl overflow-hidden p-6 sm:p-10 text-center space-y-6">
        {/* Status Indicator */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-red-500 animate-ping' : isSpeaking ? 'bg-brand-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span>
            {isListening
              ? 'Listening to your speech...'
              : isSpeaking
              ? 'Speaking response...'
              : 'Tap microphone to speak'}
          </span>
        </div>

        {/* Central Audio Waveform Visualizer */}
        <div className="h-20 flex items-center justify-center">
          <AudioWaveform active={isListening || isSpeaking} barCount={20} />
        </div>

        {/* Big Central Microphone Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleMic}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 ${
              isListening
                ? 'bg-red-500 shadow-red-500/40 ring-8 ring-red-400/20 animate-pulse'
                : 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 shadow-brand-500/30 hover:scale-105'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Speaking'}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        {/* Real-time editable transcription box */}
        <div className="max-w-xl mx-auto space-y-2 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isListening ? 'Live Transcription Preview (Speak now)' : 'Transcription (Editable before sending)'}
          </label>
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 shadow-inner">
            <textarea
              rows={2}
              value={editableText || interimTranscript}
              onChange={(e) => setEditableText(e.target.value)}
              placeholder="Your spoken words will appear here. You can also edit or type manually..."
              className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none leading-relaxed"
            />
            {editableText && (
              <button
                type="button"
                onClick={handleSendVoiceQuery}
                disabled={loading}
                className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to AI</span>
              </button>
            )}
          </div>
        </div>

        {loading && <LoadingIndicator text="Reasoning over voice input..." />}

        {/* AI Spoken Response Card */}
        {aiResponse && (
          <div className="max-w-xl mx-auto mt-6 p-5 rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/30 text-left space-y-3 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold uppercase text-[10px]">
                {aiResponse.detectedLanguage} Response
              </span>

              {/* Audio Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(aiResponse.text, aiResponse.detectedLanguage))}
                  className="p-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50"
                  title={isSpeaking ? 'Stop voice' : 'Play response audio'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={repeatLastSpoken}
                  className="p-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800"
                  title="Repeat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={cycleSpeed}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                  title="Cycle Speed"
                >
                  {speechRate}x
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {aiResponse.text}
            </p>

            {aiResponse.sourceDocuments && aiResponse.sourceDocuments.length > 0 && (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Verified Sources: {aiResponse.sourceDocuments.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default LiveVoicePage;
