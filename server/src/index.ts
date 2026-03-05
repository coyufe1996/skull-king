import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { RoomManager } from './models/RoomManager';
import { registerRoomHandlers } from './handlers/roomHandler';

dotenv.config();

const app = express();
app.use(cors());

// Serve static files from the React app only in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(process.cwd(), '../client/dist');
  app.use(express.static(clientDistPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Skull King Server is running in Development Mode');
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();

// Map to store socketId -> playerId for reconnection
// In a real app, this should be persistent (Redis/DB) and use a session token
const playerSessions = new Map<string, string>(); // socketId -> playerId
const playerIdToRoomId = new Map<string, string>(); // playerId -> roomId

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle Reconnection
  socket.on('reconnect_attempt', ({ playerId }) => {
      if (!playerId) return;
      
      const roomId = playerIdToRoomId.get(playerId);
      if (roomId) {
          const room = roomManager.getRoom(roomId);
          if (room) {
              const player = room.players.find(p => p.id === playerId);
              if (player) {
                  console.log(`Player ${player.name} reconnected to room ${roomId}`);
                  
                  // Update player's socket ID (in a real implementation, we might need to update this in the room object too)
                  player.id = socket.id; // Update the ID in the player object to the new socket ID
                  
                  // Update mappings
                  playerIdToRoomId.set(socket.id, roomId); // New socket maps to room
                  playerIdToRoomId.delete(playerId); // Remove old mapping if keyed by old socket ID? 
                  // Wait, player.id IS the socket ID in current implementation.
                  // We need a persistent ID for reconnection to work properly.
                  // For this MVP, let's assume the client sends the *old* socket ID as 'playerId' to reclaim session?
                  // Or better, we generate a UUID for player.id instead of using socket.id.
                  
                  // CURRENT ARCHITECTURE LIMITATION:
                  // Player.id is currently the socket.id. This makes reconnection hard because the ID changes.
                  // We should change Player.id to be a UUID, and keep socket.id separate.
                  // BUT that's a big refactor.
                  
                  // WORKAROUND:
                  // 1. Client stores its last known socket.id (or we generate a UUID on first join).
                  // 2. Client sends this ID on connect.
                  // 3. Server looks up if this player exists in any active room.
                  // 4. If found, we update the player.id to the NEW socket.id (since the rest of the app uses player.id as socket.id).
                  //    AND we tell the client "Hey, your new ID is X".
                  
                  // Actually, updating player.id is risky if used as key elsewhere.
                  // Let's try to find the player by NAME in the room? No, names aren't unique globally.
                  
                  // Let's look at how roomManager adds players.
              }
          }
      }
  });

  registerRoomHandlers(io, socket, roomManager);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // TODO: Handle unexpected disconnects (remove player from room)
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
