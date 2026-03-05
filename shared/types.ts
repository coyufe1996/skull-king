// Shared types for Skull King game

export interface Card {
  id: string;
  type: 'suit' | 'special';
  suit?: 'parrot' | 'map' | 'treasure' | 'jolly_roger';
  value?: number; // 1-14
  specialType?: 'skull_king' | 'pirate' | 'mermaid' | 'escape' | 'tigress';
  playedAs?: 'escape' | 'pirate'; // For Tigress
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  bid: number; // -1 if not bid yet
  tricksWon: number;
  score: number;
  isReady: boolean;
}

export interface TableCard {
  playerId: string;
  card: Card;
}

export type GamePhase = 'lobby' | 'bidding' | 'playing' | 'ended';

export interface GameState {
  roomId: string;
  phase: GamePhase;
  round: number;
  players: Player[];
  currentTurnIndex: number;
  tableCards: TableCard[];
  leadSuit: string | null;
}
