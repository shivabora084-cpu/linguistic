import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export const KnowledgeSourceCard = ({ sources = [] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
      <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Verified from Knowledge Base:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((src, i) => (
          <span
            key={i}
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
          >
            <FileText className="w-3 h-3 text-emerald-500" />
            <span className="truncate max-w-[200px]">{src}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
export default KnowledgeSourceCard;
