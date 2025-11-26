import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../domain/chat';
import { tokenStorage } from '../auth/token-storage';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';
const RECONNECT_MAX = 5;

let socket: Socket | null = null;
let tokenCache: string | null = null;
const joinedRooms = new Set<string>();
let reconnectAttempts = 0;
const connectionErrorListeners = new Set<(message: string) => void>();

const createSocket = (token: string): Socket => {
  tokenCache = token;
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      token: `Bearer ${token}`,
    },
    reconnection: true,
    reconnectionAttempts: RECONNECT_MAX,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
    joinedRooms.forEach((roomId) => {
      socket?.emit('joinRoom', roomId);
    });
  });

  socket.on('connect_error', (err) => {
    reconnectAttempts += 1;
    console.error('Socket connect error:', err.message);
    connectionErrorListeners.forEach((listener) => listener(err.message));
  });

  socket.on('error', (err) => {
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message: string }).message;
      connectionErrorListeners.forEach((listener) => listener(msg));
      const refresh = tokenStorage.getRefresh();
      if (refresh) {
        connectionErrorListeners.forEach((listener) =>
          listener('Token might be expired. Please retry after re-login.')
        );
      }
    }
  });

  socket.on('disconnect', (reason) => {
    if (!socket?.connected && reconnectAttempts < RECONNECT_MAX) {
      reconnectAttempts += 1;
      console.warn(`Socket disconnected (${reason}), retry ${reconnectAttempts}/${RECONNECT_MAX}`);
    }
    if (reconnectAttempts >= RECONNECT_MAX) {
      console.error('Socket reconnection attempts exhausted.');
    }
  });

  return socket;
};

const getSocket = (): Socket => {
  if (!socket && tokenCache) {
    return createSocket(tokenCache);
  }
  if (!socket) {
    throw new Error('Socket not initialized. Please connect first with a token.');
  }
  return socket;
};

export const chatService = {
  connect: (token: string) => {
    if (socket?.connected) return;
    createSocket(token);
  },

  updateToken: (token: string) => {
    tokenCache = token;
    if (socket) {
      socket.auth = { token: `Bearer ${token}` };
      socket.disconnect().connect();
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    joinedRooms.clear();
    reconnectAttempts = 0;
  },

  joinRoom: (streamId: string) => {
    joinedRooms.add(streamId);
    getSocket().emit('joinRoom', streamId);
  },

  leaveRoom: (streamId: string) => {
    joinedRooms.delete(streamId);
    getSocket().emit('leaveRoom', streamId);
  },

  sendMessage: (payload: { streamId: string; text: string; userId: string }) => {
    getSocket().emit('sendMessage', payload);
  },

  onNewMessage: (callback: (message: ChatMessage) => void) => {
    getSocket().on('newMessage', callback);
  },

  offNewMessage: () => {
    getSocket().off('newMessage');
  },

  onError: (callback: (error: { message: string }) => void) => {
    getSocket().on('error', callback);
  },

  offError: () => {
    getSocket().off('error');
  },

  onUserJoined: (callback: (message: ChatMessage) => void) => {
    getSocket().on('userJoined', ({ userId, username }: { userId: string; username: string }) => {
      callback({
        id: `system-${userId}-${Date.now()}`,
        text: `${username} has joined the chat.`,
        createdAt: new Date().toISOString(),
        isSystem: true,
        streamId: '',
        userId,
        user: { id: userId, username },
      });
    });
  },

  offUserJoined: () => {
    getSocket().off('userJoined');
  },

  onUserLeft: (callback: (message: ChatMessage) => void) => {
    getSocket().on('userLeft', ({ userId, username }: { userId: string; username: string }) => {
      callback({
        id: `system-${userId}-${Date.now()}`,
        text: `${username} has left the chat.`,
        createdAt: new Date().toISOString(),
        isSystem: true,
        streamId: '',
        userId,
        user: { id: userId, username },
      });
    });
  },

  offUserLeft: () => {
    getSocket().off('userLeft');
  },

  onConnectionError: (callback: (message: string) => void) => {
    connectionErrorListeners.add(callback);
  },

  offConnectionError: (callback: (message: string) => void) => {
    connectionErrorListeners.delete(callback);
  },
};
