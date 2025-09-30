import type { User } from './user';

export interface Channel {
  user: User;
  stream: {
    id: string;
    title: string;
    description: string;
    isLive: boolean;
  };
}
