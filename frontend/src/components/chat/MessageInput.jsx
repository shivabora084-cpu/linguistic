import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import MicrophoneButton from '../common/MicrophoneButton';
import LanguageSelector from '../common/LanguageSelector';
import AudioWaveform from '../common/AudioWaveform';
import { useVoice } from '../../context/VoiceContext';

export const MessageInput = ({
  onSendMessage,
  disabled = false,
  selectedLanguage = 'en',
  onLanguageChange,
  placeholder = 'Type your message or speak in English, Tamil, Hindi, Tanglish...',
}) => {
  const [text, setText] = useState('');
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    interimTranscript,
  } = useVoice();
  const textareaRef = useRef(null);

  // Sync speech transcript into input field so user can preview & edit
  useEffect(() => {
    if (transcript) {
      setText((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
      clearTranscript();
    }
  }, [transcript]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      const speechLangMap = {
        en: 'en-US',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        bn: 'bn-IN',
      };
      startListening(speechLangMap[selectedLanguage] || 'en-US');
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (isListening) stopListening();
    onSendMessage(trimmed, selectedLanguage, 'text');
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Listening / Audio Waveform Status */}
        {isListening && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                Listening... Speak naturally (English, Tamil, Hindi, Tanglish...)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AudioWaveform active={true} color="red" barCount={10} />
              <button
                type="button"
                onClick={stopListening}
                className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                title="Stop recording"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500 transition-all shadow-sm">
          {/* Microphone button */}
          <MicrophoneButton
            isListening={isListening}
            onClick={handleToggleVoice}
            disabled={disabled}
            size="sm"
          />

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={isListening ? interimTranscript || 'Listening...' : placeholder}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 py-1.5 max-h-32 leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm active:scale-95 flex-shrink-0"
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom bar: Language picker and quick shortcuts */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center space-x-3">
            <LanguageSelector
              selected={selectedLanguage}
              onChange={onLanguageChange}
              label="Response Language"
            />
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span>Understands mixed-language phrases & context</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MessageInput;
