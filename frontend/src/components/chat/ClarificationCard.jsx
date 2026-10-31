import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const ClarificationCard = ({ prompt, options = [], onSelectOption }) => {
  return (
    <div className="my-2 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-sm">
      <div className="flex items-start space-x-2.5">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <div className="font-semibold text-xs tracking-wide uppercase text-amber-700 dark:text-amber-400">
            Intelligent Clarification Required
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {prompt || 'Could you please clarify your request?'}
          </p>

          {options && options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectOption && onSelectOption(opt)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-navy-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm active:scale-95"
                >
                  <span>{opt}</span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClarificationCard;
