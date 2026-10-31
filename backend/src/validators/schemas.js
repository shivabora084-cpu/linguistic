import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  preferredLanguage: z.string().default('en'),
  role: z.enum(['user', 'admin', 'support']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updatePreferencesSchema = z.object({
  speechRate: z.number().min(0.5).max(2.0).optional(),
  speechPitch: z.number().min(0.5).max(2.0).optional(),
  selectedVoice: z.string().optional(),
  targetLanguage: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  autoPlayAudio: z.boolean().optional(),
  speedMode: z.enum(['fast', 'balanced']).optional(),
});

export const chatMessageSchema = z.object({
  conversationId: z.string().optional().nullable(),
  text: z.string().min(1, 'Message text cannot be empty'),
  language: z.string().default('en'),
  inputType: z.enum(['text', 'voice']).default('text'),
  speedMode: z.enum(['fast', 'balanced']).default('balanced'),
});

export const createConversationSchema = z.object({
  title: z.string().optional().default('New Conversation'),
  language: z.string().optional().default('en'),
});

export const translationSchema = z.object({
  text: z.string().min(1, 'Text to translate is required'),
  targetLanguage: z.string().min(2, 'Target language is required'),
  sourceLanguage: z.string().optional(),
  formality: z.enum(['casual', 'polite', 'formal', 'auto']).default('auto'),
  context: z.string().optional().default(''),
  speedMode: z.enum(['fast', 'balanced']).default('balanced'),
  mode: z.enum([
    'standard',
    'natural',
    'professional',
    'casual',
    'academic',
    'business',
    'travel',
    'literal',
    'cultural',
    'simplified',
  ]).default('standard'),
});

export const smartToolsSchema = z.object({
  action: z.enum(['grammar', 'explain', 'tone', 'smart_reply', 'simplify', 'pronounce', 'compare', 'dictionary']),
  text: z.string().min(1, 'Text is required for analysis'),
  language: z.string().optional().default('en'),
  targetLanguage: z.string().optional().default('en'),
  context: z.string().optional().default(''),
  word: z.string().optional().default(''),
});

export const explainSchema = z.object({
  phrase: z.string().min(1, 'Phrase to explain is required'),
  context: z.string().optional(),
  targetLanguage: z.string().default('en'),
});

export const feedbackSchema = z.object({
  conversationId: z.string(),
  messageId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().default(''),
});

export const escalationSchema = z.object({
  conversationId: z.string(),
  issueSummary: z.string().min(5, 'Issue summary must be at least 5 characters'),
  escalationReason: z.string().min(5, 'Reason must be at least 5 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  preferredLanguage: z.string().default('en'),
});
