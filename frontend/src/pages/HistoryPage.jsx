import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  MessageSquare,
  Search,
  Trash2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const HistoryPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/conversations');
      if (res.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this entire conversation?')) return;
    try {
      await apiClient.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete conversation.');
    }
  };

  const handleToggleSave = async (id, currentSaved, e) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/conversations/${id}/save`, { isSaved: !currentSaved });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_saved: !currentSaved } : c))
      );
    } catch (err) {
      console.warn('[Save error]:', err.message);
    }
  };

  const filtered = conversations.filter((c) =>
    (c.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Conversation History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review, resume, or export your multi-lingual conversational interactions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingIndicator text="Fetching conversation history..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              {searchQuery ? 'No conversations match your search.' : 'No conversation history found.'}
            </p>
            <Link
              to="/app/chat"
              className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
            >
              Start New Conversation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/app/chat?id=${conv.id}`)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {conv.title || 'Untitled Conversation'}
                    </h3>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(conv.updated_at || conv.created_at).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-slate-500">
                        {conv.language || 'EN'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleSave(conv.id, conv.is_saved, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={conv.is_saved ? 'Remove Bookmark' : 'Bookmark'}
                  >
                    {conv.is_saved ? (
                      <BookmarkCheck className="w-4 h-4 text-brand-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default HistoryPage;
