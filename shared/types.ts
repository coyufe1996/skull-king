// Shared types for Skull King game

export interface Card {
  id: string;
  type: 'suit' | 'special';
  suit?: 'parrot' | 'map' | 'treasure' | 'jolly_roger'; // green, purple, yellow, black
  value?: number; // 1-14
  specialType?: 'skull_king' | 'pirate' | 'mermaid' | 'escape' | 'tigress';
  playedAs?: 'escape' | 'pirate'; // For Tigress
}

export interface Player {
  id: string;      // Socket ID
  name: string;
  hand: Card[];    // Cards in hand
  bid: number;     // Bid for the round
  tricksWon: number; // Tricks won in current round
  score: number;   // Total score
  isReady: boolean;
}

export interface GameState {
  roomId: string;
  phase: 'lobby' | 'bidding' | 'playing' | 'scoring' | 'ended';
  round: number;   // 1-10
  players: Player[];
  currentTurnIndex: number;
  tableCards: { playerId: string; card: Card }[];
  leadSuit: string | null;
}
