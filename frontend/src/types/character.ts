export interface Character {
  id: string;
  creator_id?: string;
  name: string;
  age?: number;
  gender?: string;
  personality_tags: string[];
  backstory: string;
  speaking_style: string;
  taboo_topics: string[];
  knowledge_boundaries: string;
  is_public: boolean;
  is_preset: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterCreate {
  name: string;
  age?: number;
  gender?: string;
  personality_tags: string[];
  backstory: string;
  speaking_style: string;
  taboo_topics: string[];
  knowledge_boundaries: string;
  is_public: boolean;
  avatar_url?: string;
}

export interface CharacterUpdate {
  name?: string;
  age?: number;
  gender?: string;
  personality_tags?: string[];
  backstory?: string;
  speaking_style?: string;
  taboo_topics?: string[];
  knowledge_boundaries?: string;
  is_public?: boolean;
  avatar_url?: string;
}

export interface CharacterListResponse {
  items: Character[];
  total: number;
  page: number;
  limit: number;
}
