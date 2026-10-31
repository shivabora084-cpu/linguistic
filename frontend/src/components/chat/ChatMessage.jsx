import React from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';
import VoicePlayer from '../common/VoicePlayer';
import FeedbackButtons from '../common/FeedbackButtons';
import ClarificationCard from './ClarificationCard';
import KnowledgeSourceCard from './KnowledgeSourceCard';

export const ChatMessage = ({
  message,
  conversationId,
  onSelectClarification,
  onSelectFollowUp,
}) => {
  const isUser = message.sender === 'user';

  const sentimentStyles = {
    frustrated: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800',
    confused: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    satisfied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-3`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
            isUser
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              : 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-brand-500/20'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message bubble & metadata */}
        <div className="space-y-1.5 flex-1">
          {/* Metadata chips */}
          <div className={`flex items-center gap-1.5 flex-wrap text-[10px] ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.detected_language && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase">
                {message.detected_language}
              </span>
            )}

            {message.mixed_languages && message.mixed_languages.length > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-semibold">
                Mixed: {message.mixed_languages.join(' + ')}
              </span>
            )}

            {message.sentiment && message.sentiment !== 'neutral' && sentimentStyles[message.sentiment] && (
              <span className={`px-1.5 py-0.5 rounded border font-medium capitalize ${sentimentStyles[message.sentiment]}`}>
                {message.sentiment}
              </span>
            )}

            {message.urgency && (message.urgency === 'high' || message.urgency === 'critical') && (
              <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border border-red-300 dark:border-red-800 font-semibold uppercase">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Urgent</span>
              </span>
            )}
          </div>

          {/* Bubble content */}
          <div
            className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
              isUser
                ? 'bg-brand-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
            }`}
          >
            {message.text}

            {/* Clarification prompt card */}
            {message.is_clarification && (
              <ClarificationCard
                prompt={message.text}
                options={message.clarification_options}
                onSelectOption={onSelectClarification}
              />
            )}

            {/* Verified knowledge sources */}
            {message.source_documents && message.source_documents.length > 0 && (
              <KnowledgeSourceCard sources={message.source_documents} />
            )}
          </div>

          {/* Assistant action footer: Voice playback & feedback */}
          {!isUser && (
            <div className="flex items-center justify-between px-1">
              <VoicePlayer text={message.text} language={message.detected_language || 'en'} />
              <FeedbackButtons conversationId={conversationId} messageId={message.id} />
            </div>
          )}

          {/* Follow-up suggestions */}
          {!isUser && message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {message.follow_up_suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectFollowUp && onSelectFollowUp(suggestion)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition active:scale-95 text-left"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatMessage;
