import React from 'react';
import { Volume2, VolumeX, RotateCcw, FastForward } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';

export const VoicePlayer = ({ text, language = 'en', className = '' }) => {
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    repeatLastSpoken,
    speechRate,
    setSpeechRate,
    supported,
  } = useVoice();

  if (!supported.tts) return null;

  const cycleSpeed = () => {
    if (speechRate === 1.0) setSpeechRate(0.75);
    else if (speechRate === 0.75) setSpeechRate(1.25);
    else setSpeechRate(1.0);
  };

  return (
    <div
      className={`inline-flex items-center space-x-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs ${className}`}
    >
      <button
        onClick={() => (isSpeaking ? stopSpeaking() : speak(text, language))}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        title={isSpeaking ? 'Stop Voice' : 'Listen with Natural TTS'}
      >
        {isSpeaking ? (
          <VolumeX className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-brand-500" />
        )}
      </button>

      <button
        onClick={() => repeatLastSpoken()}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        title="Repeat Response"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      <button
        onClick={cycleSpeed}
        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        title="Playback Speed"
      >
        {speechRate}x
      </button>
    </div>
  );
};
export default VoicePlayer;
