import React, { useState } from 'react';
import {
  Users2,
  Mic,
  MicOff,
  Volume2,
  ArrowRightLeft,
  Send,
  Sparkles,
} from 'lucide-react';
import LanguageSelector from '../components/common/LanguageSelector';
import { useVoice, SPEECH_LOCALE_MAP } from '../context/VoiceContext';
import LoadingIndicator from '../components/common/LoadingIndicator';
import apiClient from '../api/client';

export const TwoPersonTranslationPage = () => {
  const [lang1, setLang1] = useState('en');
  const [lang2, setLang2] = useState('ta');

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const [activeSpeaker, setActiveSpeaker] = useState(null); // 1 or 2
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      speaker: 1,
      sourceText: 'Hello, welcome to our university. How can I help you today?',
      targetText: 'வணக்கம், எங்கள் பல்கலைக்கழகத்திற்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      langFrom: 'en',
      langTo: 'ta',
    },
  ]);

  const { speak, startListening, stopListening, isListening, transcript, clearTranscript, isSpeaking, stopSpeaking } = useVoice();

  const handleSpeakerRecord = (speakerNum) => {
    if (activeSpeaker === speakerNum && isListening) {
      stopListening();
      setActiveSpeaker(null);
    } else {
      setActiveSpeaker(speakerNum);
      const targetLang = speakerNum === 1 ? lang1 : lang2;
      startListening(SPEECH_LOCALE_MAP[targetLang] || 'en-US');
    }
  };

  // When speech recognition produces text, place into the active speaker's input
  React.useEffect(() => {
    if (transcript && activeSpeaker) {
      if (activeSpeaker === 1) {
        setInput1((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
      } else {
        setInput2((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
      }
      clearTranscript();
    }
  }, [transcript, activeSpeaker]);

  const handleSend = async (speakerNum) => {
    const text = speakerNum === 1 ? input1.trim() : input2.trim();
    if (!text || loading) return;

    if (isListening) stopListening();
    setActiveSpeaker(null);
    setLoading(true);

    const fromLang = speakerNum === 1 ? lang1 : lang2;
    const toLang = speakerNum === 1 ? lang2 : lang1;

    try {
      const res = await apiClient.post('/translation/translate', {
        text,
        sourceLanguage: fromLang,
        targetLanguage: toLang,
      });

      if (res.success) {
        const translated = res.data.translatedText;
        setConversation((prev) => [
          ...prev,
          {
            speaker: speakerNum,
            sourceText: text,
            targetText: translated,
            langFrom: fromLang,
            langTo: toLang,
          },
        ]);

        if (speakerNum === 1) setInput1('');
        else setInput2('');

        // Speak the translation to the opposite speaker
        speak(translated, toLang);
      }
    } catch (err) {
      alert(err.message || 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <Users2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Two-Person Translation Mode</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Split-screen face-to-face dialogue. Each person speaks in their native language; LinguaMate AI translates and speaks in the other's.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSelector selected={lang1} onChange={setLang1} label="Speaker 1" />
          <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          <LanguageSelector selected={lang2} onChange={setLang2} label="Speaker 2" />
        </div>
      </div>

      {/* Split Screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 Panel */}
        <div className="p-5 rounded-3xl border-2 border-brand-200 dark:border-brand-900 bg-white dark:bg-navy-900 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Speaker 1 ({lang1.toUpperCase()})
              </span>
            </div>
            <button
              onClick={() => handleSpeakerRecord(1)}
              className={`p-2.5 rounded-full text-white transition ${
                activeSpeaker === 1 && isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-brand-600 hover:bg-brand-500'
              }`}
              title="Record Speaker 1"
            >
              {activeSpeaker === 1 && isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <textarea
            rows={3}
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="Type or speak in Speaker 1's language..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSend(1)}
              disabled={!input1.trim() || loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <span>Translate for Speaker 2</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Speaker 2 Panel */}
        <div className="p-5 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-navy-900 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Speaker 2 ({lang2.toUpperCase()})
              </span>
            </div>
            <button
              onClick={() => handleSpeakerRecord(2)}
              className={`p-2.5 rounded-full text-white transition ${
                activeSpeaker === 2 && isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
              title="Record Speaker 2"
            >
              {activeSpeaker === 2 && isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <textarea
            rows={3}
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Type or speak in Speaker 2's language..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none resize-none"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSend(2)}
              disabled={!input2.trim() || loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <span>Translate for Speaker 1</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingIndicator text="Translating conversation between speakers..." />}

      {/* Live Dialogue Transcript */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Bilingual Dialogue History</span>
        </h2>

        <div className="space-y-3">
          {conversation.map((turn, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${
                turn.speaker === 1
                  ? 'border-brand-200 dark:border-brand-900/60 bg-brand-50/40 dark:bg-brand-950/20'
                  : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
              } space-y-2`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Speaker {turn.speaker} ({turn.langFrom.toUpperCase()} → {turn.langTo.toUpperCase()})
                </span>
                <button
                  onClick={() => speak(turn.targetText, turn.langTo)}
                  className="inline-flex items-center space-x-1 text-brand-600 dark:text-brand-400 hover:underline"
                  title="Speak translation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                "{turn.sourceText}"
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {turn.targetText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TwoPersonTranslationPage;
