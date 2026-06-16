import api from './client';

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  created_at: string;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/user/profile');
  return data;
}

export async function exportData(): Promise<Blob> {
  const response = await api.get('/user/export', { responseType: 'blob' });
  return response.data;
}

export async function deleteAllData(): Promise<void> {
  await api.delete('/user/data');
}
