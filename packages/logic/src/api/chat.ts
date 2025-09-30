import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../domain/chat';

const SOCKET_URL = 'http://localhost:3000'; // As per the provided spec

let socket: Socket;

export const chatService = {
  connect: () => {
    if (socket) return;
    socket = io(SOCKET_URL, {
      transports: ['websocket'], // Prefer websockets
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
    }
  },

  joinRoom: (streamId: string) => {
    if (!socket) return;
    socket.emit('joinRoom', streamId);
  },

  leaveRoom: (streamId: string) => {
    if (!socket) return;
    socket.emit('leaveRoom', streamId);
  },

  sendMessage: (payload: { streamId: string; text: string; userId: string }) => {
    if (!socket) return;
    socket.emit('sendMessage', payload);
  },

  onNewMessage: (callback: (message: ChatMessage) => void) => {
    if (!socket) return;
    socket.on('newMessage', callback);
  },

  offNewMessage: () => {
    if (!socket) return;
    socket.off('newMessage');
  },

  onError: (callback: (error: { message: string }) => void) => {
    if (!socket) return;
    socket.on('error', callback);
  },

  offError: () => {
    if (!socket) return;
    socket.off('error');
  },
};
