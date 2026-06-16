export interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  character_name?: string;
  title?: string;
  is_active: boolean;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
}
