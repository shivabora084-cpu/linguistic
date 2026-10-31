import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Send,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import LanguageSelector from '../components/common/LanguageSelector';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const KnowledgeBasePage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // RAG Query Sandbox
  const [queryText, setQueryText] = useState('What are the documents required for admission?');
  const [queryLanguage, setQueryLanguage] = useState('ta');
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const fetchDocuments = async () => {
    try {
      const res = await apiClient.get('/knowledge');
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.warn('[Doc fetch notice]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Poll documents status every 10 seconds if processing
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError('Only PDF and TXT documents are supported.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        setSuccessMsg(`Document "${file.name}" uploaded successfully! Chunking and indexing in progress.`);
        fetchDocuments();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge document and all its indexed chunks?')) return;
    try {
      await apiClient.delete(`/knowledge/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed.');
    }
  };

  const handleRunTestQuery = async () => {
    if (!queryText.trim() || querying) return;
    setQuerying(true);
    setQueryResult(null);

    try {
      const res = await apiClient.post('/knowledge/query', {
        query: queryText,
        language: queryLanguage,
      });

      if (res.success) {
        setQueryResult(res);
      }
    } catch (err) {
      alert(err.message || 'Query failed.');
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Document Knowledge Base & RAG Engine</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload PDF or TXT policies, guides, or FAQs. The system chunks, generates embeddings with pgvector, and answers multi-lingual questions strictly citing verified facts.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 text-center space-y-3 hover:border-brand-500 transition-colors shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {uploading ? 'Processing & Indexing Document...' : 'Upload Knowledge Document'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Supported formats: PDF, TXT (Maximum file size 15MB)
          </p>
        </div>

        <div>
          <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 cursor-pointer transition active:scale-95">
            <span>Select File</span>
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Uploaded Documents ({documents.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Stored in Supabase Storage (`linguamate-files`)
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingIndicator text="Loading knowledge documents..." />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No documents uploaded yet. Upload a PDF guide above to enable grounded RAG answering.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => {
              const statusColors = {
                completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
                processing: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
                uploaded: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
                failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300',
              };

              return (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {doc.title || doc.filename}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chunk_count || 0} Chunks Indexed</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusColors[doc.status] || ''}`}>
                      {doc.status}
                    </span>
                    {doc.publicUrl && (
                      <a
                        href={doc.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View file in Supabase Storage"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RAG Verification & Test Sandbox */}
      <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-tr from-indigo-50/40 via-white to-brand-50/40 dark:from-navy-900 dark:via-navy-900 dark:to-navy-950 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Document Q&A Sandbox (RAG Verification)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test asking questions in any language against the uploaded PDFs. Gemini retrieves matching vector chunks and cites the source.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Ask a question from the uploaded documents..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm outline-none"
            />
            <LanguageSelector
              selected={queryLanguage}
              onChange={setQueryLanguage}
              label="Answer In"
            />
            <button
              onClick={handleRunTestQuery}
              disabled={querying || !queryText.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <span>Query</span>
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {querying && <LoadingIndicator text="Searching vector chunks & generating answer..." />}

          {queryResult && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Grounded Answer ({queryLanguage.toUpperCase()})</span>
                </div>
                {queryResult.sources && queryResult.sources.length > 0 && (
                  <span className="text-slate-400">
                    Citations: {queryResult.sources.join(', ')}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {queryResult.answer}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Document Translation (PDF & TXT) */}
      <div className="p-6 rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-white dark:bg-navy-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <span>Full Document Translation Engine (PDF / TXT)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Translate entire multi-paragraph documents into any supported language with structure preservation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            id="docTranslateInput"
            accept=".pdf,.txt"
            className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-950 dark:file:text-violet-300 cursor-pointer"
          />
          <LanguageSelector
            selected={queryLanguage}
            onChange={setQueryLanguage}
            label="Translate Into"
          />
          <button
            onClick={async () => {
              const fileInput = document.getElementById('docTranslateInput');
              const file = fileInput?.files?.[0];
              if (!file) {
                alert('Please select a PDF or TXT file first.');
                return;
              }
              const formData = new FormData();
              formData.append('file', file);
              formData.append('targetLanguage', queryLanguage);

              setUploading(true);
              setError('');
              try {
                const res = await apiClient.post('/knowledge/translate-doc', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (res.success && res.data) {
                  const blob = new Blob([res.data.translatedContent], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `translated_${queryLanguage}_${file.name.replace(/\.[^/.]+$/, '')}.txt`;
                  a.click();
                  setSuccessMsg(`Document translated successfully! (${res.data.paragraphCount} paragraphs, ${res.data.characterCount} characters). Download initiated.`);
                }
              } catch (err) {
                setError(err.message || 'Document translation failed.');
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Translate & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default KnowledgeBasePage;
