import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LifeBuoy,
  PlusCircle,
  Share2,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';
import ChatMessage from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('id');

  const { user, preferences } = useAuth();
  const [conversationId, setConversationId] = useState(conversationIdFromUrl);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [isSaved, setIsSaved] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(
    preferences?.target_language || user?.preferredLanguage || 'en'
  );

  // Escalation modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateSummary, setEscalateSummary] = useState('');
  const [escalateReason, setEscalateReason] = useState('Requires specialized human clarification');
  const [escalateUrgency, setEscalateUrgency] = useState('medium');
  const [escalateSuccess, setEscalateSuccess] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load conversation if ID is in URL
  useEffect(() => {
    if (conversationIdFromUrl) {
      setConversationId(conversationIdFromUrl);
      const loadHistory = async () => {
        setLoadingHistory(true);
        setError('');
        try {
          const res = await apiClient.get(`/conversations/${conversationIdFromUrl}`);
          if (res.success) {
            setConversationTitle(res.conversation.title);
            setIsSaved(res.conversation.is_saved);
            setMessages(res.messages || []);
          }
        } catch (err) {
          console.warn('[History load notice]:', err.message);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadHistory();
    } else {
      setConversationId(null);
      setConversationTitle('New Conversation');
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: `Hello! I am LinguaMate AI. You can speak or write to me in English, Tamil, Hindi, Tanglish, Hinglish, or any supported language.\n\nAsk me questions, explore college admissions, upload documents to verify facts, or test my memory with follow-up questions!`,
          detected_language: 'en',
          follow_up_suggestions: [
            'Sir, admission fees evlo?',
            'Kal college jaana hai, timing kya hai?',
            'What documents are required for admission?',
          ],
        },
      ]);
    }
  }, [conversationIdFromUrl]);

  const handleSendMessage = async (text, language, inputType = 'text') => {
    if (!text.trim() || sending) return;
    setError('');

    // Append user message immediately
    const userTempMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      text,
      detected_language: language,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userTempMsg]);
    setSending(true);

    try {
      const res = await apiClient.post('/chat/message', {
        conversationId,
        text,
        language,
        inputType,
      });

      if (res.success) {
        if (!conversationId && res.conversationId) {
          setConversationId(res.conversationId);
          setSearchParams({ id: res.conversationId });
        }

        const assistantMsg = {
          id: res.messageId || 'ai-' + Date.now(),
          sender: 'assistant',
          text: res.response.text,
          detected_language: res.response.detectedLanguage || language,
          mixed_languages: res.response.mixedLanguages,
          intent: res.response.intent,
          sentiment: res.response.sentiment,
          urgency: res.response.urgency,
          is_clarification: res.response.isClarification,
          clarification_options: res.response.clarificationOptions,
          follow_up_suggestions: res.response.followUpSuggestions,
          source_documents: res.response.sourceDocuments,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectClarification = (opt) => {
    handleSendMessage(`I choose: ${opt}`, selectedLanguage);
  };

  const handleSelectFollowUp = (suggestion) => {
    handleSendMessage(suggestion, selectedLanguage);
  };

  const handleToggleSave = async () => {
    if (!conversationId) return;
    try {
      const newSaved = !isSaved;
      await apiClient.put(`/conversations/${conversationId}/save`, { isSaved: newSaved });
      setIsSaved(newSaved);
    } catch (e) {
      setIsSaved(!isSaved);
    }
  };

  const handleStartNewChat = () => {
    setSearchParams({});
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!conversationId) {
      alert('Please start a conversation first before escalating.');
      return;
    }
    try {
      await apiClient.post('/escalations', {
        conversationId,
        issueSummary: escalateSummary || 'User requested human escalation from chat',
        escalationReason: escalateReason,
        urgency: escalateUrgency,
        preferredLanguage: selectedLanguage,
      });
      setEscalateSuccess(true);
      setTimeout(() => {
        setShowEscalateModal(false);
        setEscalateSuccess(false);
        setEscalateSummary('');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Escalation submission failed.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-navy-950 flex items-center justify-between gap-3">
        <div className="truncate flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {conversationTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {conversationId && (
            <button
              onClick={handleToggleSave}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isSaved ? 'Remove Bookmark' : 'Bookmark Conversation'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-brand-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={() => setShowEscalateModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
            title="Request human support agent"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Escalate</span>
          </button>

          <button
            onClick={handleStartNewChat}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition"
            title="Start fresh conversation"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="py-20">
            <LoadingIndicator text="Retrieving conversation history..." />
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              conversationId={conversationId}
              onSelectClarification={handleSelectClarification}
              onSelectFollowUp={handleSelectFollowUp}
            />
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <LoadingIndicator text="LinguaMate AI is understanding & reasoning..." size="sm" />
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      {/* Human Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-base">
              <LifeBuoy className="w-5 h-5" />
              <span>Human Support Escalation</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our AI will bundle your conversation history and route it to an available human agent.
            </p>

            {escalateSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center">
                ✓ Escalation ticket created! An agent has been notified.
              </div>
            ) : (
              <form onSubmit={handleEscalateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Issue Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={escalateSummary}
                    onChange={(e) => setEscalateSummary(e.target.value)}
                    placeholder="Brief description of the problem..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={escalateUrgency}
                    onChange={(e) => setEscalateUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="low">Low (Standard inquiry)</option>
                    <option value="medium">Medium (Requires assistance)</option>
                    <option value="high">High (Urgent deadline / fee)</option>
                    <option value="critical">Critical (Immediate resolution)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatPage;
