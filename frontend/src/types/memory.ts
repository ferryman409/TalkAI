export interface Memory {
  id: string;
  user_id: string;
  character_id?: string;
  content: string;
  importance: number;
  is_manual: boolean;
  keywords?: string;
  recall_count: number;
  last_recalled_at?: string;
  created_at: string;
}

export interface MemoryCreate {
  content: string;
  character_id?: string;
  importance?: number;
}

export interface MemoryListResponse {
  items: Memory[];
  total: number;
  page: number;
  limit: number;
}
