import { supabase } from '../database/supabaseClient.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// In-memory conversation stores for local development / zero-DB mode
export const localConversations = new Map();
export const localMessages = new Map();

export const createConversation = async (req, res, next) => {
  try {
    const { title = 'New Conversation', language = 'en' } = req.body;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    if (supabase) {
      try {
        const insertPayload = { title, language };
        if (validUserId) insertPayload.user_id = validUserId;

        const { data, error } = await supabase
          .from('conversations')
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          return res.status(201).json({ success: true, conversation: data });
        }
      } catch (dbErr) {
        console.warn('[Conversation Create DB Warning]:', dbErr.message);
      }
    }

    const convId = 'conv-' + Date.now();
    const newConv = {
      id: convId,
      user_id: rawUserId,
      title,
      language,
      is_saved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [{ count: 0 }],
    };
    localConversations.set(convId, newConv);
    localMessages.set(convId, []);

    return res.status(201).json({
      success: true,
      conversation: newConv,
    });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;
    const { savedOnly } = req.query;

    if (supabase) {
      try {
        let query = supabase
          .from('conversations')
          .select('*');

        if (validUserId) {
          query = query.eq('user_id', validUserId);
        }

        if (savedOnly === 'true') {
          query = query.eq('is_saved', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
        if (!error && data) {
          return res.json({ success: true, data: data || [], conversations: data || [] });
        }
      } catch (dbErr) {
        console.warn('[Get Conversations DB Warning]:', dbErr.message);
      }
    }

    let list = Array.from(localConversations.values()).filter(
      (c) => c.user_id === rawUserId || c.user_id === 'demo-user' || rawUserId === 'user-demo-001' || !c.user_id
    );
    if (savedOnly === 'true') {
      list = list.filter((c) => c.is_saved);
    }
    return res.json({ success: true, data: list, conversations: list });
  } catch (err) {
    next(err);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    if (supabase && isUUID(id)) {
      try {
        let query = supabase.from('conversations').select('*').eq('id', id);
        if (validUserId) {
          query = query.eq('user_id', validUserId);
        }
        const { data: conversation } = await query.maybeSingle();

        if (conversation) {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

          return res.json({
            success: true,
            conversation,
            messages: messages || [],
          });
        }
      } catch (dbErr) {
        console.warn('[Get Conversation DB Warning]:', dbErr.message);
      }
    }

    const conversation = localConversations.get(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    const messages = localMessages.get(id) || [];

    return res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    if (supabase && isUUID(id)) {
      try {
        let query = supabase.from('conversations').delete().eq('id', id);
        if (validUserId) {
          query = query.eq('user_id', validUserId);
        }
        const { error } = await query;
        if (!error) {
          localConversations.delete(id);
          localMessages.delete(id);
          return res.json({ success: true, message: 'Conversation deleted successfully' });
        }
      } catch (dbErr) {
        console.warn('[Delete Conversation DB Warning]:', dbErr.message);
      }
    }

    localConversations.delete(id);
    localMessages.delete(id);
    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const toggleSaveConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user';
    const { isSaved } = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from('conversations')
        .update({ is_saved: isSaved, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, conversation: data });
    }

    const conv = localConversations.get(id);
    if (conv) {
      conv.is_saved = Boolean(isSaved);
      conv.updated_at = new Date().toISOString();
      localConversations.set(id, conv);
    }
    return res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
};
