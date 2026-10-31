import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  MessageSquare,
  FileText,
  LifeBuoy,
  Star,
  Activity,
  Globe,
  Database,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import apiClient from '../api/client';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        apiClient.get('/admin/analytics'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/system-health'),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value?.success) {
        setAnalytics(results[0].value);
      }
      if (results[1].status === 'fulfilled' && results[1].value?.success) {
        setUsers(results[1].value.users || []);
      }
      if (results[2].status === 'fulfilled' && results[2].value?.success) {
        setSystemHealth(results[2].value);
      }
    } catch (err) {
      console.warn('[Admin data warning]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>Administrator & Operational Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time PostgreSQL query metrics, language distribution, user roles, and system diagnostics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Metrics</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="p-12">
          <LoadingIndicator text="Querying database metrics and health..." />
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Users</span>
                <Users className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.totalUsers ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Chats</span>
                <MessageSquare className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.totalConversations ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Messages</span>
                <Activity className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.totalMessages ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Documents</span>
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.totalDocuments ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Escalations</span>
                <LifeBuoy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.totalEscalations ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase">Avg Rating</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {analytics?.metrics?.averageFeedbackRating ?? 5.0}★
              </div>
            </div>
          </div>

          {/* System Health Diagnostics */}
          {systemHealth && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Backend Platform Health & Diagnostics</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-brand-500" />
                    <span>Supabase PostgreSQL DB</span>
                  </div>
                  <p className="text-slate-500">
                    {systemHealth.database?.message || 'Database Connected'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Google Gemini AI</span>
                  </div>
                  <p className="text-slate-500">
                    {systemHealth.aiEngine?.message || 'AI Engine Configured'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Uptime & Platform
                  </div>
                  <p className="text-slate-500">
                    Uptime: {systemHealth.uptimeSeconds}s • Active Node Daemon
                  </p>
                </div>
              </div>

              {systemHealth.cachePerformance && (
                <div className="mt-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">⚡ Translation Cache Layer</span>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      In-Memory LRU cache eliminates duplicate Gemini calls & latency
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Hit Rate</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{systemHealth.cachePerformance.hitRatePercent}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cached Items</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{systemHealth.cachePerformance.size} / {systemHealth.cachePerformance.maxSize}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Latency Saved</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">~{systemHealth.cachePerformance.savedLatencySeconds}s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language Breakdown & Users List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language Breakdown */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Multilingual Activity Distribution</span>
              </h2>

              {analytics?.metrics?.languageDistribution ? (
                <div className="space-y-2">
                  {Object.entries(analytics.metrics.languageDistribution).map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 uppercase">
                        {lang} Language
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 font-bold text-brand-600 dark:text-brand-400">
                        {count} messages
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No language data recorded yet.</p>
              )}
            </div>

            {/* User Directory */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span>Registered Profiles ({users.length})</span>
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
                {users.map((u) => (
                  <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {u.full_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminDashboardPage;
