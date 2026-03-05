import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? undefined : 'http://localhost:3001');

// Create a singleton socket instance
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// For debugging
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});
