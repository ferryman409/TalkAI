export interface MessageAttachment {
  id: string;
  type: 'image' | 'audio';
  url: string;
  filename: string;
  mime_type: string;
  file_size?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count?: number;
  attachments?: MessageAttachment[];
  created_at: string;
}

export interface MessageListResponse {
  items: Message[];
  has_more: boolean;
}
