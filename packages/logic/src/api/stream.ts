import { apiClient } from '../api-client';
import type { Channel } from '../domain/channel';
import type { Stream } from '../domain/stream';
import type { VOD } from '../domain/vod';

const API_PREFIX = '/api';

export type MyChannel = Channel & {
  stream: Channel['stream'] & { streamKey?: string };
  streamKey?: string; // fallback if API returns at top-level
};

export const getStreams = async (): Promise<Stream[]> => {
  const response = await apiClient.get(`${API_PREFIX}/streams`);
  return response.data;
};

export const getChannelByUserId = async (userId: string): Promise<Channel> => {
  const response = await apiClient.get(`${API_PREFIX}/users/${userId}/channel`);
  return response.data;
};

export const getVodsByChannelId = async (channelId: string): Promise<VOD[]> => {
  const response = await apiClient.get(`${API_PREFIX}/vods/channel/${channelId}`);
  return response.data;
};

export const getVodById = async (vodId: string): Promise<VOD> => {
  const response = await apiClient.get(`${API_PREFIX}/vods/${vodId}`);
  return response.data;
};

export const getMyChannel = async (): Promise<MyChannel> => {
  const response = await apiClient.get(`${API_PREFIX}/users/me/channel`);
  return response.data;
};

export const uploadVod = async (params: { file: File; title: string; description?: string }) => {
  const formData = new FormData();
  formData.append('video', params.file);
  formData.append('title', params.title);
  if (params.description) {
    formData.append('description', params.description);
  }

  const response = await apiClient.post(`${API_PREFIX}/vods/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
