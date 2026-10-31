import { apiClient } from './client';

export interface Conversation {
  id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at?: string;
  messages?: Array<{ count: number }> | any[];
  is_saved?: boolean;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  text: string;
  detected_language?: string;
  is_clarification?: boolean;
  clarification_options?: string[];
  created_at: string;
}

export const conversationApi = {
  async getConversations(): Promise<{ success: boolean; data: Conversation[] }> {
    const res = await apiClient.get('/conversations');
    return res.data;
  },

  async getConversationById(id: string): Promise<{ success: boolean; conversation: Conversation; messages: ChatMessage[] }> {
    const res = await apiClient.get(`/conversations/${id}`);
    return res.data;
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete(`/conversations/${id}`);
    return res.data;
  },

  async sendMessage(data: {
    conversationId?: string | null;
    text: string;
    language?: string;
    inputType?: 'text' | 'voice';
    speedMode?: 'fast' | 'balanced';
  }) {
    const res = await apiClient.post('/chat/message', {
      ...data,
      speedMode: data.speedMode || 'balanced',
    });
    return res.data;
  },
};

