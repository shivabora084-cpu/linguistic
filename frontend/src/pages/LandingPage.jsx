import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Mic,
  MessageSquare,
  FileText,
  HelpCircle,
  Users2,
  Check,
  X,
  Languages,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import LanguageSelector from '../components/common/LanguageSelector';

export const LandingPage = () => {
  const [demoInput, setDemoInput] = useState('Sir, admission fees evlo? Installments-la pay panlama?');
  const [demoResponse, setDemoResponse] = useState({
    detectedLanguage: 'ta + en (Tanglish)',
    intent: 'College Admission & Fee Inquiry',
    sentiment: 'neutral',
    response: 'The total admission fee is ₹25,000 according to college records. Yes, you can pay in 2 installments (₹15,000 at enrollment and ₹10,000 within 45 days).',
    clarification: null,
    source: 'college_admission_guide.pdf (Page 3)',
  });

  const sampleQueries = [
    {
      title: 'Tamil-English Mixed (Tanglish)',
      text: 'Sir, admission fees evlo? Installments-la pay panlama?',
    },
    {
      title: 'Hindi-English Mixed (Hinglish)',
      text: 'Kal college jaana hai, what is the timing and documents required?',
    },
    {
      title: 'Ambiguous Request (Clarification)',
      text: 'Cancel it.',
    },
  ];

  const handleRunSample = (sample) => {
    setDemoInput(sample.text);
    if (sample.text.includes('Cancel it')) {
      setDemoResponse({
        detectedLanguage: 'en',
        intent: 'Cancellation Request',
        sentiment: 'neutral',
        response: 'Which service or application would you like to cancel?',
        clarification: ['Admission Application', 'Hostel Booking', 'Exam Registration'],
        source: null,
      });
    } else if (sample.text.includes('Kal college')) {
      setDemoResponse({
        detectedLanguage: 'hi + en (Hinglish)',
        intent: 'College Schedule Inquiry',
        sentiment: 'neutral',
        response: 'College reporting time is 9:00 AM. Please carry your 12th mark sheet, transfer certificate, and 2 passport photos.',
        clarification: null,
        source: 'orientation_schedule.pdf (Section 1.2)',
      });
    } else {
      setDemoResponse({
        detectedLanguage: 'ta + en (Tanglish)',
        intent: 'College Admission & Fee Inquiry',
        sentiment: 'neutral',
        response: 'The total admission fee is ₹25,000 according to college records. Yes, you can pay in 2 installments (₹15,000 at enrollment and ₹10,000 within 45 days).',
        clarification: null,
        source: 'college_admission_guide.pdf (Page 3)',
      });
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 text-center max-w-5xl mx-auto px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-indigo-500/20 to-violet-500/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Full-Stack Multilingual Conversational Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Beyond Translation.{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Understand Every Conversation.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Conventional tools translate words out of context. <strong>LinguaMate AI</strong> understands user intent, speaks and listens in real-time, decodes mixed-language speech (Tanglish, Hinglish), retains multi-turn conversational memory, asks clarifying questions, and retrieves verified facts from uploaded PDFs.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 transition active:scale-95"
          >
            <span>Launch LinguaMate AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/app/dual-translation"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
          >
            <Users2 className="w-4 h-4 text-brand-500" />
            <span>Two-Person Translation</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800/80 text-left">
          <div className="p-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">7+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Indian & Global Languages</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Single Central Supabase DB</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">RAG</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">pgvector Verified Answers</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">Zero-Cost</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Browser STT/TTS First</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Preview */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-500 ml-2">Interactive Capability Showcase</span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              Try Preset Scenarios
            </span>
          </div>

          <div className="p-5 space-y-4">
            {/* Sample query buttons */}
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRunSample(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition"
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Input display */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                User Input (Voice or Text)
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                "{demoInput}"
              </div>
            </div>

            {/* AI Response Display */}
            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase text-[10px]">
                    {demoResponse.detectedLanguage}
                  </span>
                  <span className="text-slate-500">Intent: {demoResponse.intent}</span>
                </div>
                {demoResponse.source && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{demoResponse.source}</span>
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {demoResponse.response}
              </div>

              {demoResponse.clarification && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                    Click to select clarification:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {demoResponse.clarification.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-navy-900 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Google Translate vs LinguaMate AI Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How LinguaMate AI Differs from Conventional Translation
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Google Translate focuses primarily on text and audio translation. LinguaMate AI focuses on contextual communication, intention understanding, and problem solving.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-navy-900/90 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3 sm:p-4">Feature / Capability</th>
                <th className="p-3 sm:p-4 text-slate-500 dark:text-slate-400">Google Translate</th>
                <th className="p-3 sm:p-4 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20">
                  LinguaMate AI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Mixed-Language Input (e.g. "admission fees evlo?")
                </td>
                <td className="p-3 sm:p-4 text-slate-500">Often misinterprets or translates literally</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Understands intent across blended languages</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Multi-Turn Context & Pronoun Memory ("Can I pay it later?")
                </td>
                <td className="p-3 sm:p-4 text-slate-500">No context memory between turns</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Resolves "it" and maintains conversation context</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Intelligent Clarification ("Cancel it")
                </td>
                <td className="p-3 sm:p-4 text-slate-500">Translates words blindly without clarifying</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Asks follow-up options before executing</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Verified PDF Knowledge Base (RAG)
                </td>
                <td className="p-3 sm:p-4 text-slate-500">Not supported</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Answers from uploaded documents with source citations</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Cultural Nuance & Idiom Explanation ("Break a leg")
                </td>
                <td className="p-3 sm:p-4 text-slate-500">Literal or dictionary definition</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Explains intended meaning, etiquette & formal alternatives</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 sm:p-4 font-medium text-slate-800 dark:text-slate-200">
                  Human Support Escalation
                </td>
                <td className="p-3 sm:p-4 text-slate-500">Not supported</td>
                <td className="p-3 sm:p-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-950/10">
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Seamlessly passes context to human representatives</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Integrated Multilingual Intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Powered by a single centralized Supabase PostgreSQL database and Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Live Voice Conversation
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Browser Web Speech API for low-cost, zero-latency speech recognition and synthesis. Controls for repeat, playback speed (0.75x, 1x, 1.25x), and audio waveforms.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Mixed-Language Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Native handling of code-mixed languages like Tanglish and Hinglish. Automatically detects source languages and generates replies in the user's preferred tongue.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Document Knowledge Base (RAG)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload PDF and TXT guidelines. Gemini and pgvector extract semantic chunks to answer user questions with source citations—guaranteeing zero hallucinations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
