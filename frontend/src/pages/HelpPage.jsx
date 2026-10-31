import React from 'react';
import {
  HelpCircle,
  Sparkles,
  Mic,
  MessageSquare,
  FileText,
  LifeBuoy,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const HelpPage = () => {
  const demos = [
    {
      num: 1,
      title: 'Multilingual & Mixed-Language Understanding',
      tagline: 'Code-mixing (Tanglish / Hinglish)',
      prompt: 'Sir, admission fees evlo? Installments-la pay panlama?',
      explanation:
        'Notice how LinguaMate AI immediately detects the mixture of Tamil and English words, extracts the true intent (fee inquiry + installment inquiry), and replies fluently without failing like literal translation engines.',
    },
    {
      num: 2,
      title: 'Contextual Conversational Memory',
      tagline: 'Multi-turn Reference Resolution',
      prompt: 'Turn 1: "What is the admission fee?" → Turn 2: "Can I pay it in installments?"',
      explanation:
        'Notice how the AI resolves "it" as referring to the admission fee discussed in the previous turn, maintaining seamless continuous context.',
    },
    {
      num: 3,
      title: 'Intelligent Clarification Engine',
      tagline: 'Ambiguity Resolution',
      prompt: 'User: "Cancel it."',
      explanation:
        'Instead of making blind assumptions or blindly translating, LinguaMate AI detects missing context and asks: "Which request or service would you like to cancel?" providing one-click options.',
    },
    {
      num: 4,
      title: 'Verified Document Knowledge Base (RAG)',
      tagline: 'Zero-Hallucination Grounding',
      prompt: 'Upload college PDF → Ask in Tamil: "சேர்க்கைக்கு என்ன சான்றிதழ்கள் தேவை?"',
      explanation:
        'The backend extracts PDF chunks, retrieves vector embeddings via pgvector, and answers strictly based on the uploaded document with verifiable source citations.',
    },
    {
      num: 5,
      title: 'Natural Voice Response & Speed Controls',
      tagline: 'Audio Accessibility',
      prompt: 'Listen to AI speech, toggle 0.75x slow-down, repeat with one click.',
      explanation:
        'Browser-native Web Speech API ensures zero cost and zero latency, with interactive waveform visualizers and editable transcription previews.',
    },
    {
      num: 6,
      title: 'Human Support Escalation',
      tagline: 'Automated Agent Handoff',
      prompt: 'Click "Escalate" or say "Connect me to a human representative"',
      explanation:
        'The conversation is packaged with urgency level, language preference, and context, and instantly dispatched to the Support Escalation Queue.',
    },
    {
      num: 7,
      title: 'Live Admin & Operational Analytics',
      tagline: 'Database Source of Truth',
      prompt: 'Open Admin Dashboard to view real PostgreSQL statistics',
      explanation:
        'All statistics (users, conversations, languages, escalations, system health) are calculated directly from live database tables—no mock counters.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <HelpCircle className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Hackathon Demo Guide & System Architecture</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Step-by-step walkthrough of the 7 core demonstration scenarios for hackathon presentation.
        </p>
      </div>

      {/* Demo Scenarios Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>7 Live Hackathon Demonstrations</span>
        </h2>

        <div className="space-y-3">
          {demos.map((d) => (
            <div
              key={d.num}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center">
                    {d.num}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {d.title}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {d.tagline}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
                {d.prompt}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {d.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment & Architecture Summary */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Production Architecture Highlights</span>
        </h2>

        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Single Central Database:</strong> All modules connect to one Supabase PostgreSQL instance with pgvector for vector search and Supabase Storage for files.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Frontend:</strong> React + Vite + Tailwind CSS designed for zero-configuration deployment to Vercel.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Backend:</strong> Node.js + Express REST API designed for Render Web Service deployment with production CORS & health routes.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Low-Cost Architecture:</strong> Leverages browser Web Speech API for voice and centralized Google Gemini service with context summarization to minimize token burn.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default HelpPage;
