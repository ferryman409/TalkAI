import api from './client';
import type { Conversation, ConversationListResponse } from '../types';
import type { MessageListResponse } from '../types/message';

export async function listConversations(characterId?: string): Promise<ConversationListResponse> {
  const params: Record<string, string> = {};
  if (characterId) params.character_id = characterId;
  const { data } = await api.get<ConversationListResponse>('/conversations', { params });
  return data;
}

export async function createConversation(characterId: string, title?: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>('/conversations', { character_id: characterId, title });
  return data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<Conversation>(`/conversations/${id}`);
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/conversations/${id}`);
}

export async function getMessages(
  conversationId: string,
  before?: string,
  limit = 50,
): Promise<MessageListResponse> {
  const params: Record<string, string | number> = { limit };
  if (before) params.before = before;
  const { data } = await api.get<MessageListResponse>(
    `/conversations/${conversationId}/messages`,
    { params },
  );
  return data;
}

export function streamMessage(
  conversationId: string,
  content: string,
  remember: boolean,
  attachmentIds: string[],
  onToken: (token: string) => void,
  onDone: (messageId: string, tokenCount: number) => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();

  fetch(`/api/v1/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, remember, attachment_ids: attachmentIds }),
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      onError('Request failed');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let eventType = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'token') {
              onToken(data.token);
            } else if (eventType === 'done') {
              onDone(data.message_id, data.token_count);
            } else if (eventType === 'error') {
              onError(data.detail || 'Unknown error');
            }
          } catch {
            // Skip parse errors
          }
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') {
      onError(err.message);
    }
  });

  return controller;
}
