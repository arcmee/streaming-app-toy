import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../domain/chat';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';

let socket: Socket | null = null;

const getSocket = (token?: string): Socket => {
  if (!socket && token) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${token}`,
      },
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      // Consider cleaning up the socket instance
      socket = null;
    });
  }
  if (!socket) {
    // This case handles when getSocket is called without a token but socket is not initialized
    // Or when trying to perform actions without being connected.
    // Depending on the app's logic, you might want to throw an error
    // or handle it differently.
    throw new Error('Socket not initialized. Please connect first with a token.');
  }
  return socket;
};

export const chatService = {
  connect: (token: string) => {
    // The actual connection is now managed by getSocket
    getSocket(token);
  },

  disconnect: () => {
    const s = getSocket();
    if (s) {
      s.disconnect();
      socket = null;
    }
  },

  joinRoom: (streamId: string) => {
    getSocket().emit('joinRoom', streamId);
  },

  leaveRoom: (streamId: string) => {
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
};
