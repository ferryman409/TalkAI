import type { MessageAttachment } from '../types/message';

export async function uploadFile(file: File): Promise<MessageAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}
