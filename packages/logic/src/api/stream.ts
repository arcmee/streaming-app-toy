import { apiClient } from '../api-client';
import type { Stream } from '../domain/stream';

export const getStreams = async (): Promise<Stream[]> => {
  const response = await apiClient.get<Stream[]>('/api/streams');
  return response.data;
};
