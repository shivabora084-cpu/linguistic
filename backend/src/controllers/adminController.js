import { supabase, testDatabaseConnection } from '../database/supabaseClient.js';
import { testGeminiConnection } from '../services/geminiService.js';
import { getSpeechCapabilities } from '../services/speechAdapter.js';
import { translationCache } from '../services/translationCache.js';

export const getAnalytics = async (req, res, next) => {
  try {
    if (supabase) {
      const safeCount = async (table, altTable = null) => {
        try {
          const res = await supabase.from(table).select('*', { count: 'exact', head: true });
          if (!res.error && res.count !== null && res.count !== undefined) return res.count;
          if (altTable) {
            const res2 = await supabase.from(altTable).select('*', { count: 'exact', head: true });
            if (!res2.error && res2.count !== null) return res2.count;
          }
          return 0;
        } catch (e) {
          return 0;
        }
      };

      const [userCount, conversationCount, messageCount, documentCount, escalationCount] = await Promise.all([
        safeCount('profiles', 'users'),
        safeCount('conversations'),
        safeCount('messages'),
        safeCount('knowledge_documents'),
        safeCount('escalations'),
      ]);

      // 2. Language breakdown from messages
      let languageCounts = {};
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('detected_language, language')
          .limit(200);

        if (messages) {
          messages.forEach((m) => {
            const lang = m.detected_language || m.language || 'en';
            languageCounts[lang] = (languageCounts[lang] || 0) + 1;
          });
        }
      } catch (lErr) {}

      // 3. Feedback average
      let avgRating = 5.0;
      let feedbackCount = 0;
      try {
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('rating');

        if (feedbackData && feedbackData.length > 0) {
          feedbackCount = feedbackData.length;
          const sum = feedbackData.reduce((acc, f) => acc + (f.rating || 0), 0);
          avgRating = Number((sum / feedbackData.length).toFixed(1));
        }
      } catch (fErr) {}

      // 4. Recent escalations
      let recentEscalations = [];
      try {
        const { data: escData } = await supabase
          .from('escalations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (escData) recentEscalations = escData;
      } catch (eErr) {}

      // 5. Recent events
      let recentEvents = [];
      try {
        const { data: evData } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (evData) recentEvents = evData;
      } catch (evErr) {}

      return res.json({
        success: true,
        metrics: {
          totalUsers: userCount || 1,
          totalConversations: conversationCount || 0,
          totalMessages: messageCount || 0,
          totalDocuments: documentCount || 0,
          totalEscalations: escalationCount || 0,
          averageFeedbackRating: avgRating,
          feedbackCount,
          languageDistribution: languageCounts,
        },
        recentEscalations,
        recentEvents,
      });
    }

    // Default mock stats if database is not yet populated
    return res.json({
      success: true,
      metrics: {
        totalUsers: 1,
        totalConversations: 0,
        totalMessages: 0,
        totalDocuments: 0,
        totalEscalations: 0,
        averageFeedbackRating: 5.0,
        feedbackCount: 0,
        languageDistribution: { en: 1 },
      },
      recentEscalations: [],
      recentEvents: [],
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, preferred_language, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, users: data || [] });
    }
    return res.json({ success: true, users: [] });
  } catch (err) {
    next(err);
  }
};

export const getAllConversations = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, profiles:user_id(full_name, email), messages(count)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.json({ success: true, conversations: data || [] });
    }
    return res.json({ success: true, conversations: [] });
  } catch (err) {
    next(err);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const dbStatus = await testDatabaseConnection();
    const aiStatus = await testGeminiConnection();
    const speechStatus = getSpeechCapabilities();
    const cacheStats = translationCache.getStats();

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      aiEngine: aiStatus,
      speechServices: speechStatus,
      cachePerformance: cacheStats,
    });
  } catch (err) {
    next(err);
  }
};
