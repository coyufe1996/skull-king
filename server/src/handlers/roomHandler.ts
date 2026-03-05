import { Server, Socket } from 'socket.io';
import { RoomManager } from '../models/RoomManager';
import { GameLogic } from '../models/GameLogic';
import { BotLogic } from '../models/BotLogic';

const gameLogic = new GameLogic();

// In-memory session management (replace with DB/Redis in production)
const socketToUser = new Map<string, string>(); // socketId -> userId
const userToRoom = new Map<string, string>();   // userId -> roomId

export const registerRoomHandlers = (io: Server, socket: Socket, roomManager: RoomManager) => {
  const socketId = socket.id;

  const getUserId = () => socketToUser.get(socketId);

  socket.on('create_room', ({ playerName, userId }: { playerName: string, userId: string }) => {
    try {
      const realUserId = userId || socketId; // Fallback
      socketToUser.set(socketId, realUserId);
      
      const room = roomManager.createRoom(realUserId, playerName);
      userToRoom.set(realUserId, room.roomId);
      
      socket.join(room.roomId);
      socket.emit('room_created', room);
      io.to(room.roomId).emit('room_update', room);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  socket.on('join_room', ({ roomId, playerName, userId }: { roomId: string; playerName: string; userId: string }) => {
    try {
      const realUserId = userId || socketId;
      socketToUser.set(socketId, realUserId);

      // Check if already in room (re-join logic could be here too)
      const room = roomManager.joinRoom(roomId, realUserId, playerName);
      if (room) {
        userToRoom.set(realUserId, roomId);
        socket.join(roomId);
        socket.emit('joined_room', room);
        io.to(roomId).emit('room_update', room);
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to join room' });
    }
  });

  socket.on('rejoin_room', ({ userId }: { userId: string }) => {
      const roomId = userToRoom.get(userId);
      if (roomId) {
          const room = roomManager.getRoom(roomId);
          if (room) {
              const player = room.players.find(p => p.id === userId);
              if (player) {
                  // Re-bind socket
                  socketToUser.set(socketId, userId);
                  socket.join(roomId);
                  socket.emit('joined_room', room);
                  console.log(`User ${userId} reconnected to room ${roomId}`);
                  return;
              }
          }
      }
      socket.emit('error', { message: 'No active game found' });
  });

  socket.on('player_ready', ({ roomId, isReady }: { roomId: string; isReady: boolean }) => {
    const userId = getUserId();
    if (!userId) return;

    const room = roomManager.setPlayerReady(roomId, userId, isReady);
    if (room) {
      io.to(roomId).emit('room_update', room);
      
      // Check if all players are ready to start game (min 2 players)
      if (room.players.length >= 2 && room.players.every(p => p.isReady)) {
         gameLogic.startGame(room);
         io.to(roomId).emit('game_started', room);
         
         // Trigger bot bids immediately if game started
         handleBotBids(io, roomId, roomManager);
      }
    }
  });

  socket.on('add_bot', (roomId: string) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.phase === 'lobby') {
      gameLogic.addBot(room);
      io.to(roomId).emit('room_update', room);
    }
  });

  socket.on('leave_room', (roomId: string) => {
    const userId = getUserId();
    if (!userId) return;

    const room = roomManager.removePlayer(roomId, userId);
    socket.leave(roomId);
    userToRoom.delete(userId); // Clear session
    
    if (room) {
      io.to(roomId).emit('room_update', room);
    }
  });
  
  socket.on('submit_bid', ({ roomId, bid }: { roomId: string, bid: number }) => {
      const userId = getUserId();
      if (!userId) return;

      const room = roomManager.getRoom(roomId);
      if (room && room.phase === 'bidding') {
          const success = gameLogic.submitBid(room, userId, bid);
          if (success) {
              io.to(roomId).emit('room_update', room);
              
              // If all players bid, phase changes to playing
              if ((room as any).phase === 'playing') {
                   // Check if first player is bot
                   handleBotTurn(io, roomId, roomManager);
              } else {
                  // Still bidding, check if we need to trigger more bots
                  handleBotBids(io, roomId, roomManager);
              }
          }
      }
  });

  socket.on('play_card', ({ roomId, cardId, playedAs }: { roomId: string, cardId: string, playedAs?: 'escape' | 'pirate' }) => {
      const userId = getUserId();
      if (!userId) return;

      const room = roomManager.getRoom(roomId);
      if (room && room.phase === 'playing') {
          const success = gameLogic.playCard(room, userId, cardId, playedAs);
          if (success) {
              io.to(roomId).emit('room_update', room);
              
              // Check if trick is complete
              if (room.tableCards.length === room.players.length) {
                  // First, find the winner but don't update scores yet
                  const winnerId = gameLogic.determineTrickWinner(room);
                  // Send trick_end with the cards still on the table
                  io.to(roomId).emit('trick_end', { winnerId, tableCards: [...room.tableCards] });
                  
                  setTimeout(() => {
                      // Now resolve the trick (update scores, etc.)
                      gameLogic.resolveTrickWithWinner(room, winnerId);
                      // Clear table
                      room.tableCards = [];
                      room.leadSuit = null;
                      
                      io.to(roomId).emit('room_update', room);

                      // Check if round is complete (hand empty)
                      if (room.players[0].hand.length === 0) {
                          const isGameOver = gameLogic.endRound(room);
                          if (isGameOver) {
                              io.to(roomId).emit('game_ended', room);
                          } else {
                              io.to(roomId).emit('round_ended', room);
                              // Next round bidding phase started
                              handleBotBids(io, roomId, roomManager);
                          }
                          io.to(roomId).emit('room_update', room);
                      } else {
                          // Continue to next trick, check if next player is bot
                          handleBotTurn(io, roomId, roomManager);
                      }
                  }, 2000); // Delay to see result
              } else {
                  // Next player turn
                  handleBotTurn(io, roomId, roomManager);
              }
          } else {
              socket.emit('error', { message: 'Invalid move' });
          }
      }
  });
};

function handleBotBids(io: Server, roomId: string, roomManager: RoomManager) {
    const room = roomManager.getRoom(roomId);
    if (!room || room.phase !== 'bidding') return;
    
    // Slight delay for bot bids to feel natural
    setTimeout(() => {
        let updated = false;
        room.players.forEach(p => {
            if (p.id.startsWith('BOT-') && p.bid === -1) {
                p.bid = BotLogic.makeBid(p.hand);
                updated = true;
            }
        });
        
        if (updated) {
            io.to(roomId).emit('room_update', room);
            // Check if all bid
            if (room.players.every(p => p.bid !== -1)) {
                room.phase = 'playing';
                // Set first player turn
                room.currentTurnIndex = (room.round - 1) % room.players.length;
                io.to(roomId).emit('room_update', room);
                handleBotTurn(io, roomId, roomManager);
            }
        }
    }, 1000);
}

function handleBotTurn(io: Server, roomId: string, roomManager: RoomManager) {
    const room = roomManager.getRoom(roomId);
    if (!room || (room as any).phase !== 'playing') return;

    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id.startsWith('BOT-')) {
        setTimeout(() => {
            const cardToPlay = BotLogic.playCard(room, currentPlayer);
            if (cardToPlay) {
                gameLogic.playCard(room, currentPlayer.id, cardToPlay.id);
                io.to(roomId).emit('room_update', room);

                // Recursively check logic (same as socket event)
                if (room.tableCards.length === room.players.length) {
                    const winnerId = gameLogic.determineTrickWinner(room);
                    io.to(roomId).emit('trick_end', { winnerId, tableCards: [...room.tableCards] });
                    
                    setTimeout(() => {
                        gameLogic.resolveTrickWithWinner(room, winnerId);
                        room.tableCards = [];
                        room.leadSuit = null;
                        
                        io.to(roomId).emit('room_update', room);
                        
                        if (room.players[0].hand.length === 0) {
                            const isGameOver = gameLogic.endRound(room);
                            if (isGameOver) {
                                io.to(roomId).emit('game_ended', room);
                            } else {
                                io.to(roomId).emit('round_ended', room);
                                handleBotBids(io, roomId, roomManager);
                            }
                            io.to(roomId).emit('room_update', room);
                        } else {
                            handleBotTurn(io, roomId, roomManager);
                        }
                    }, 2000);
                } else {
                    handleBotTurn(io, roomId, roomManager);
                }
            }
        }, 1000); // Bot think time
    }
}
