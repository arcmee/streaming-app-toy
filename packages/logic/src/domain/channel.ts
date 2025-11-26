import type { User } from './user';

export interface Channel {
  user: User;
  streamKey?: string; // some endpoints may return streamKey at the top-level
  stream: {
    id: string;
    title: string;
    description: string;
    isLive: boolean;
    streamKey?: string; // may be included for public channel or my channel responses
  };
}
