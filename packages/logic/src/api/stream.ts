import { apiClient } from '../api-client';
import type { Channel } from '../domain/channel';
import type { Stream } from '../domain/stream';
import type { VOD } from '../domain/vod';

export const getStreams = async (): Promise<Stream[]> => {
  const response = await apiClient.get('/streams');
  return response.data;
};

export const getChannelByUserId = async (userId: string): Promise<Channel> => {
  const response = await apiClient.get(`/users/${userId}/channel`);
  return response.data;
};

export const getVodsByUserId = async (userId: string): Promise<VOD[]> => {
  const response = await apiClient.get(`/users/${userId}/vods`);
  return response.data;
};

export const getVodById = async (vodId: string): Promise<VOD> => {
  const response = await apiClient.get(`/vods/${vodId}`);
  return response.data;
};
