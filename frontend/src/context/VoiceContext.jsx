import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const VoiceContext = createContext();

export const SPEECH_LOCALE_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ar: 'ar-SA',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState({ stt: false, tts: false });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [lastSpokenText, setLastSpokenText] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSTT = Boolean(SpeechRecognition);
    const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

    setSupported({ stt: hasSTT, tts: hasTTS });

    if (hasSTT) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => (prev ? prev + ' ' + currentFinal : currentFinal).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('[SpeechRecognition Error]:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    if (hasTTS) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          // Select default English or Indian English voice
          const preferred =
            voices.find((v) => v.lang.includes('IN') || v.name.includes('India')) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          setSelectedVoice(preferred);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // STT Controls
  const startListening = (langCode = 'en-US') => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = langCode;
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (e) {
      console.warn('[Start listening notice]:', e.message);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}
    setIsListening(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // TTS Controls
  const speak = (text, langCode = 'en-US') => {
    if (!supported.tts || !text) return;

    window.speechSynthesis.cancel();
    setLastSpokenText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Pick matching voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else if (langCode) {
      const match = availableVoices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (supported.tts && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (supported.tts && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (supported.tts) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const repeatLastSpoken = () => {
    if (lastSpokenText) {
      speak(lastSpokenText);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        transcript,
        setTranscript,
        interimTranscript,
        startListening,
        stopListening,
        clearTranscript,
        isSpeaking,
        isPaused,
        speak,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
        repeatLastSpoken,
        lastSpokenText,
        speechRate,
        setSpeechRate,
        speechPitch,
        setSpeechPitch,
        availableVoices,
        selectedVoice,
        setSelectedVoice,
        supported,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
