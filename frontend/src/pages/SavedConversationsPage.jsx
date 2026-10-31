import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  MessageSquare,
  BookmarkCheck,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import LoadingIndicator from '../components/common/LoadingIndicator';
import apiClient from '../api/client';

export const SavedConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/conversations?savedOnly=true');
      if (res.success) {
        setConversations(res.conversations || []);
      }
    } catch (err) {
      console.warn('[Saved fetch error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemoveBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/conversations/${id}/save`, { isSaved: false });
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.warn('[Remove error]:', err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <Bookmark className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Saved Conversations</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bookmarked dialogues and important translations kept for quick reference.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingIndicator text="Loading saved chats..." />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No saved conversations yet.</p>
            <Link
              to="/app/chat"
              className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
            >
              Start Chat & Bookmark
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/app/chat?id=${conv.id}`)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex-shrink-0">
                    <BookmarkCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {conv.title || 'Untitled Conversation'}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(conv.updated_at || conv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleRemoveBookmark(conv.id, e)}
                    className="p-2 rounded-lg text-brand-500 hover:text-slate-400"
                    title="Remove from Saved"
                  >
                    <BookmarkCheck className="w-4 h-4" />
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
export default SavedConversationsPage;
