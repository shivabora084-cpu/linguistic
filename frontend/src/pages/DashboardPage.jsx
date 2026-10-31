import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Mic,
  Users2,
  Languages,
  BookOpen,
  ArrowRight,
  Database,
  Cpu,
  Volume2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  History,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import apiClient from '../api/client';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { speak, startListening, stopListening, isListening, transcript, isSpeaking } = useVoice();
  const [healthStatus, setHealthStatus] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch health & integrations
        const healthRes = await apiClient.get('/health');
        setHealthStatus(healthRes);

        // Fetch recent conversations
        const convRes = await apiClient.get('/conversations');
        if (convRes.success) {
          setRecentConversations(convRes.conversations.slice(0, 4));
        }
      } catch (err) {
        console.warn('[Dashboard data notice]:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startNewChat = async () => {
    try {
      const res = await apiClient.post('/conversations', {
        title: 'New Conversation',
        language: user?.preferredLanguage || 'en',
      });
      if (res.success && res.conversation) {
        navigate(`/app/chat?id=${res.conversation.id}`);
      } else {
        navigate('/app/chat');
      }
    } catch (e) {
      navigate('/app/chat');
    }
  };

  const testQuickVoice = () => {
    speak('Welcome to LinguaMate AI. How can I assist your conversation today?', 'en-US');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-900 via-indigo-900 to-navy-900 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-200">
            <span>Beyond Translation</span>
            <span>•</span>
            <span className="capitalize">{user?.preferredLanguage || 'English'} Profile</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.fullName || 'Explorer'}! 👋
          </h1>
          <p className="text-sm text-brand-100/90 leading-relaxed">
            Ready to communicate without linguistic barriers? Speak naturally in mixed languages, ask follow-up questions, or ground conversations in verified documents.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={startNewChat}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-brand-900 hover:bg-brand-50 shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              <span>New Conversation</span>
            </button>
            <Link
              to="/app/voice"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
            >
              <Mic className="w-4 h-4 text-brand-300" />
              <span>Live Voice Mode</span>
            </Link>
          </div>
        </div>

        {/* Abstract decorative graphic */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-brand-400 to-transparent blur-2xl" />
      </div>

      {/* Integration & Live Services Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Supabase PostgreSQL</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthStatus?.integrations?.supabase?.connected
                ? 'Central Database Connected'
                : 'Local / Ready for keys'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Google Gemini AI</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthStatus?.integrations?.gemini?.connected
                ? 'Intelligence Engine Ready'
                : 'Intent & Reasoning Service'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Speech STT & TTS</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Web Speech Provider Active
            </div>
          </div>
        </div>
      </div>

      {/* Primary Feature Launchpads */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Intelligent Communication Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/app/chat"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              AI Conversation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-turn dialog with contextual memory, intent understanding, mixed-language decoding, and intelligent clarification.
            </p>
          </Link>

          <Link
            to="/app/voice"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                <Mic className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Live Voice Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hands-free audio communication with animated waveforms, instant transcription preview, and natural voice playback.
            </p>
          </Link>

          <Link
            to="/app/dual-translation"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Users2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Two-Person Translation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Face-to-face split screen between two speakers with independent language buttons (e.g. English & Tamil).
            </p>
          </Link>

          <Link
            to="/app/translation"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Languages className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cultural & Idiom Translation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Break down idioms, colloquial slang, formal vs polite etiquette, and literal vs contextual nuances.
            </p>
          </Link>

          <Link
            to="/app/knowledge"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Document Knowledge Base (RAG)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload PDF or TXT files. The AI extracts text, indexes pgvector chunks, and answers questions with cited source pages.
            </p>
          </Link>

          <Link
            to="/app/support"
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Human Support Escalation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Escalate complex or urgent issues directly to human representatives with full conversational context and status tracking.
            </p>
          </Link>
        </div>
      </div>

      {/* Quick Voice Demo Strip */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 to-brand-50/70 dark:from-navy-900 dark:to-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-center sm:justify-start space-x-2">
            <Volume2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Interactive Voice Diagnostic</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify browser speech synthesis and recognition in your environment with one click.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={testQuickVoice}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow transition"
          >
            Play Test Speech
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      {recentConversations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Recent Conversations</span>
            </h2>
            <Link to="/app/history" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/app/chat?id=${conv.id}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between shadow-sm"
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {conv.title || 'Untitled Conversation'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;
