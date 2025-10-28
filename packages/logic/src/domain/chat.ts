import type { User } from './user';

// Based on schema.prisma
// The payload for the 'newMessage' event is expected to include the user details.
export interface ChatMessage {
  id: string;
  text: string;
  createdAt: string; // Date will be serialized as a string
  streamId: string;
  userId: string;
  user: Pick<User, 'id' | 'username'>; // We only need id and username for display
  isSystem?: boolean; // To flag system messages like 'user joined'
}
