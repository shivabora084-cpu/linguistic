import React from 'react';

export const AudioWaveform = ({ active = false, color = 'brand', barCount = 12 }) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className="flex items-center space-x-1 h-8 px-2 justify-center">
      {bars.map((bar) => {
        const delays = ['0s', '0.2s', '0.4s', '0.1s', '0.3s'];
        const delay = delays[bar % delays.length];
        return (
          <span
            key={bar}
            style={{
              animationDelay: delay,
              height: active ? '100%' : '20%',
            }}
            className={`w-1 rounded-full transition-all duration-300 ${
              active
                ? 'bg-gradient-to-t from-brand-600 to-indigo-400 animate-waveform-1'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        );
      })}
    </div>
  );
};
export default AudioWaveform;
