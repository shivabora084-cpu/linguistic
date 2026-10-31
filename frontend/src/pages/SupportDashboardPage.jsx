import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const SupportDashboardPage = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      setError('');
      const query = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
      const res = await apiClient.get(`/escalations${query}`);
      if (res.success) {
        setEscalations(res.escalations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load support escalations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, [filterStatus]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiClient.put(`/escalations/${id}/status`, {
        status: newStatus,
        resolutionNotes,
      });
      setEscalations((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus, resolution_notes: resolutionNotes } : e))
      );
      setSelectedTicket(null);
      setResolutionNotes('');
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const urgencyBadge = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <LifeBuoy className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Human Support Escalation Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real tickets escalated by users when automated reasoning requires human representative review.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={fetchEscalations}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-slate-500 hover:text-slate-800"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingIndicator text="Loading escalation queue..." />
          </div>
        ) : escalations.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No support escalation tickets found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {escalations.map((ticket) => (
              <div key={ticket.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${urgencyBadge[ticket.urgency] || ''}`}>
                        {ticket.urgency}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {ticket.issue_summary}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                      <span>Reason: {ticket.escalation_reason}</span>
                      <span>•</span>
                      <span>Language: {ticket.preferred_language?.toUpperCase() || 'EN'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ticket.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setResolutionNotes(ticket.resolution_notes || '');
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>

                {ticket.resolution_notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Agent Resolution Notes: </span>
                    {ticket.resolution_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Manage Ticket: {selectedTicket.issue_summary}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Resolution Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document resolution steps, phone callbacks, or action items..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-xs text-slate-400 hover:underline"
              >
                Close
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'assigned')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                >
                  Mark Assigned
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupportDashboardPage;
