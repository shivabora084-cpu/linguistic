import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import apiClient from '../../api/client';

export const FeedbackButtons = ({ conversationId, messageId }) => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  const handleRate = async (rating) => {
    if (submitted || !conversationId) return;
    try {
      setSelectedRating(rating);
      await apiClient.post('/feedback', {
        conversationId,
        messageId: messageId || null,
        rating,
        comment: rating === 5 ? 'Helpful response' : 'Could be improved',
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('[Feedback notice]:', err.message);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-500 font-medium">
        <Check className="w-3 h-3" />
        <span>Feedback saved</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center space-x-1 text-slate-400">
      <button
        onClick={() => handleRate(5)}
        className="p-1 rounded hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Helpful"
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleRate(1)}
        className="p-1 rounded hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Not helpful"
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
    </div>
  );
};
export default FeedbackButtons;
