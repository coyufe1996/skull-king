import { GameState, Player } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class RoomManager {
  private rooms: Map<string, GameState> = new Map();

  createRoom(hostPlayerId: string, hostPlayerName: string): GameState {
    const roomId = uuidv4().slice(0, 6).toUpperCase(); // 6-character room ID
    const newRoom: GameState = {
      roomId,
      phase: 'lobby',
      round: 0,
      players: [{
        id: hostPlayerId,
        name: hostPlayerName,
        hand: [],
        bid: -1,
        tricksWon: 0,
        score: 0,
        isReady: false
      }],
      currentTurnIndex: 0,
      tableCards: [],
      leadSuit: null
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.length >= 6) {
      throw new Error('Room is full');
    }

    if (room.phase !== 'lobby') {
      throw new Error('Game already started');
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      bid: -1,
      tricksWon: 0,
      score: 0,
      isReady: false
    };

    room.players.push(newPlayer);
    return room;
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  removePlayer(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    return room;
  }

  setPlayerReady(roomId: string, playerId: string, isReady: boolean): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
    }

    return room;
  }
}
