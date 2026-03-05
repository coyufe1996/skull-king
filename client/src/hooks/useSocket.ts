import { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { GameState } from '../../../shared/types';
import { socket } from '../socket';

export const useSocket = () => {
  const { updateRoom } = useGameStore();

  useEffect(() => {
    // Set up listeners
    const onRoomUpdate = (room: GameState) => {
      console.log('Room updated:', room);
      updateRoom(room);
    };

    const onRoomCreated = (room: GameState) => {
      console.log('Room created:', room);
      updateRoom(room);
    };

    const onJoinedRoom = (room: GameState) => {
      console.log('Joined room:', room);
      updateRoom(room);
    };

    const onGameStarted = (room: GameState) => {
        console.log('Game started:', room);
        updateRoom(room);
    };

    const onError = (err: { message: string }) => {
      console.error('Socket error:', err);
      // Don't show alert for "No active game found" - it's expected when there's no active session
      if (err.message !== 'No active game found') {
        alert(err.message);
      }
    };

    // Attach listeners
    socket.on('room_update', onRoomUpdate);
    socket.on('room_created', onRoomCreated);
    socket.on('joined_room', onJoinedRoom);
    socket.on('game_started', onGameStarted);
    socket.on('error', onError);

    // Clean up listeners on unmount
    return () => {
      socket.off('room_update', onRoomUpdate);
      socket.off('room_created', onRoomCreated);
      socket.off('joined_room', onJoinedRoom);
      socket.off('game_started', onGameStarted);
      socket.off('error', onError);
    };
  }, [updateRoom]);

  return socket;
};
