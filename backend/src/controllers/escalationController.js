import { supabase } from '../database/supabaseClient.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const localEscalations = [];

export const createEscalation = async (req, res, next) => {
  try {
    const { conversationId, issueSummary, escalationReason, urgency = 'medium', preferredLanguage = 'en' } = req.body;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    if (supabase) {
      try {
        const payload = {
          issue_summary: issueSummary,
          escalation_reason: escalationReason,
          urgency,
          preferred_language: preferredLanguage,
          status: 'pending',
        };
        if (isUUID(conversationId)) payload.conversation_id = conversationId;
        if (validUserId) payload.user_id = validUserId;

        const { data, error } = await supabase
          .from('escalations')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return res.status(201).json({
            success: true,
            message: 'Your request for a human representative has been queued. An agent will assist you.',
            escalation: data,
          });
        }
      } catch (dbErr) {
        console.warn('[Escalation DB Warning]:', dbErr.message);
      }
    }

    const localRecord = {
      id: 'esc-' + Date.now(),
      conversation_id: conversationId,
      user_id: rawUserId,
      issue_summary: issueSummary,
      escalation_reason: escalationReason,
      urgency,
      preferred_language: preferredLanguage,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    localEscalations.unshift(localRecord);

    return res.status(201).json({
      success: true,
      message: 'Support escalation created successfully',
      escalation: localRecord,
    });
  } catch (err) {
    next(err);
  }
};

export const getEscalations = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (supabase) {
      try {
        let query = supabase
          .from('escalations')
          .select('*')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data) {
          return res.json({ success: true, escalations: data });
        }
      } catch (dbErr) {
        console.warn('[Get Escalations DB Warning]:', dbErr.message);
      }
    }

    let list = [...localEscalations];
    if (status) {
      list = list.filter((e) => e.status === status);
    }
    return res.json({ success: true, escalations: list });
  } catch (err) {
    next(err);
  }
};

export const updateEscalationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const agentId = req.user?.id || 'agent-001';

    if (supabase && isUUID(id)) {
      try {
        const payload = {
          status,
          resolution_notes: resolutionNotes,
          updated_at: new Date().toISOString(),
        };
        if (isUUID(agentId)) payload.assigned_agent_id = agentId;

        const { data, error } = await supabase
          .from('escalations')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return res.json({ success: true, escalation: data });
        }
      } catch (dbErr) {
        console.warn('[Update Escalation DB Warning]:', dbErr.message);
      }
    }

    const item = localEscalations.find((e) => e.id === id);
    if (item) {
      item.status = status;
      item.resolution_notes = resolutionNotes;
    }
    return res.json({ success: true, escalation: item || { id, status } });
  } catch (err) {
    next(err);
  }
};
