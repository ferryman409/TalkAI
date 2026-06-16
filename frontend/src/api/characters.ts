import api from './client';
import type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse } from '../types/character';

export async function listCharacters(
  search?: string,
  tags?: string,
  page = 1,
  limit = 20,
): Promise<CharacterListResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (search) params.search = search;
  if (tags) params.tags = tags;
  const { data } = await api.get<CharacterListResponse>('/characters', { params });
  return data;
}

export async function getPresetCharacters(): Promise<Character[]> {
  const { data } = await api.get<Character[]>('/characters/presets');
  return data;
}

export async function getCharacter(id: string): Promise<Character> {
  const { data } = await api.get<Character>(`/characters/${id}`);
  return data;
}

export async function createCharacter(body: CharacterCreate): Promise<Character> {
  const { data } = await api.post<Character>('/characters', body);
  return data;
}

export async function updateCharacter(id: string, body: CharacterUpdate): Promise<Character> {
  const { data } = await api.put<Character>(`/characters/${id}`, body);
  return data;
}

export async function deleteCharacter(id: string): Promise<void> {
  await api.delete(`/characters/${id}`);
}
