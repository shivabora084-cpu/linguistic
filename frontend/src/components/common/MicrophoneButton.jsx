import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export const MicrophoneButton = ({ isListening, onClick, disabled = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2.5',
    lg: 'w-14 h-14 p-4',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={isListening ? 'Stop Recording' : 'Start Voice Input'}
      className={`relative rounded-full flex items-center justify-center transition-all ${
        sizeClasses[size]
      } ${
        isListening
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse ring-4 ring-red-400/30'
          : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
      {isListening ? (
        <MicOff className={iconSizes[size]} />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
};
export default MicrophoneButton;
