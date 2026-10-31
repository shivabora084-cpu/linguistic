import { getSpeechCapabilities, transcribeAudio, synthesizeSpeech } from '../services/speechAdapter.js';

export const handleGetCapabilities = (req, res) => {
  const capabilities = getSpeechCapabilities();
  return res.json({ success: true, capabilities });
};

export const handleTranscribe = async (req, res, next) => {
  try {
    const audioBuffer = req.file?.buffer || null;
    const mimeType = req.file?.mimetype || 'audio/wav';

    const result = await transcribeAudio(audioBuffer, mimeType);
    return res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

export const handleSynthesize = async (req, res, next) => {
  try {
    const { text, language = 'en', speechRate, speechPitch } = req.body;
    const result = await synthesizeSpeech(text, language, { speechRate, speechPitch });
    return res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};
