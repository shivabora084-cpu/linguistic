import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingIndicator = ({ text = 'Thinking...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center space-x-2.5 py-4 text-slate-500 dark:text-slate-400">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-500`} />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
};
export default LoadingIndicator;
