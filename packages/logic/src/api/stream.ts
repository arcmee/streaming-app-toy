import { apiClient } from '../api-client';
import type { Channel } from '../domain/channel';
import type { Stream } from '../domain/stream';

export const getStreams = async (): Promise<Stream[]> => {
  const response = await apiClient.get<Stream[]>('/api/streams');
  return response.data;
};

export const getChannelByUserId = async (userId: string): Promise<Channel> => {
  const response = await apiClient.get<Channel>(`/api/users/${userId}/channel`);
  return response.data;
};
