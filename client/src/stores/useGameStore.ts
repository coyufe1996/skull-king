import { create } from 'zustand';
import { GameState, Player } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

interface GameStore {
  gameState: GameState | null;
  playerName: string;
  userId: string;
  setGameState: (state: GameState | null) => void;
  setPlayerName: (name: string) => void;
  updateRoom: (room: GameState) => void;
  reset: () => void;
}

const getUserId = () => {
  let id = localStorage.getItem('skull_king_user_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('skull_king_user_id', id);
  }
  return id;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  playerName: localStorage.getItem('skull_king_player_name') || '',
  userId: getUserId(),
  setGameState: (state) => set({ gameState: state }),
  setPlayerName: (name) => {
    localStorage.setItem('skull_king_player_name', name);
    set({ playerName: name });
  },
  updateRoom: (room) => set({ gameState: room }),
  reset: () => set({ gameState: null }),
}));
