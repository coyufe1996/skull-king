import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './stores/useGameStore';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import Rules from './pages/Rules';
import { socket } from './socket';

function App() {
  const { gameState } = useGameStore();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => {
        setIsConnected(true);
        // Attempt to rejoin if we have a userId
        const { userId } = useGameStore.getState();
        if (userId) {
            socket.emit('rejoin_room', { userId });
        }
    };
    const onDisconnect = () => setIsConnected(false);
    
    const onJoinedRoom = (room: any) => {
        useGameStore.getState().setGameState(room);
        // Navigate if needed, or just let the routes handle it based on gameState
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('joined_room', onJoinedRoom);

    // If already connected on mount
    if (socket.connected) {
        onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('joined_room', onJoinedRoom);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Connection Status Indicator */}
      <div className={`fixed top-0 right-0 m-2 px-3 py-1 rounded-full text-xs font-bold z-50 ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
        {isConnected ? '已连接' : '断开连接'}
      </div>

      <Routes>
        <Route 
          path="/" 
          element={!gameState ? <Lobby /> : <Navigate to={`/room/${gameState.roomId}`} />} 
        />
        <Route 
          path="/room/:roomId" 
          element={gameState ? <GameRoom /> : <Navigate to="/" />} 
        />
        <Route 
          path="/rules" 
          element={<Rules />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
