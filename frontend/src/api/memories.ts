import api from './client';
import type { Memory, MemoryCreate, MemoryListResponse } from '../types/memory';

export async function listMemories(
  characterId?: string,
  sort = 'recent',
  page = 1,
  limit = 50,
): Promise<MemoryListResponse> {
  const params: Record<string, string | number> = { sort, page, limit };
  if (characterId) params.character_id = characterId;
  const { data } = await api.get<MemoryListResponse>('/memories', { params });
  return data;
}

export async function createMemory(body: MemoryCreate): Promise<Memory> {
  const { data } = await api.post<Memory>('/memories', body);
  return data;
}

export async function deleteMemory(id: string): Promise<void> {
  await api.delete(`/memories/${id}`);
}

export async function recallMemory(id: string): Promise<void> {
  await api.post(`/memories/${id}/recall`);
}
