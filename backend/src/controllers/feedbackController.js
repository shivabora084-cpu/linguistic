import { supabase } from '../database/supabaseClient.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const localFeedback = [];

export const submitFeedback = async (req, res, next) => {
  try {
    const { conversationId, messageId, rating, comment } = req.body;
    const rawUserId = req.user?.id || null;
    const validUserId = isUUID(rawUserId) ? rawUserId : null;

    if (supabase) {
      try {
        const payload = {
          rating,
          comment: comment || '',
        };
        if (isUUID(conversationId)) payload.conversation_id = conversationId;
        if (isUUID(messageId)) payload.message_id = messageId;
        if (validUserId) payload.user_id = validUserId;

        const { data, error } = await supabase
          .from('feedback')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback: data,
          });
        }
      } catch (dbErr) {
        console.warn('[Feedback DB Warning]:', dbErr.message);
      }
    }

    const localRecord = {
      id: 'fb-' + Date.now(),
      user_id: rawUserId,
      conversation_id: conversationId,
      message_id: messageId,
      rating,
      comment: comment || '',
      created_at: new Date().toISOString(),
    };
    localFeedback.unshift(localRecord);

    return res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback: localRecord,
    });
  } catch (err) {
    next(err);
  }
};
