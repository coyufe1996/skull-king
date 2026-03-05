import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';

const Lobby: React.FC = () => {
  const { playerName, setPlayerName, userId } = useGameStore();
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const checkConnection = () => setIsConnected(socket.connected);
    socket.on('connect', checkConnection);
    socket.on('disconnect', checkConnection);
    
    // Initial check
    checkConnection();

    return () => {
      socket.off('connect', checkConnection);
      socket.off('disconnect', checkConnection);
    };
  }, [socket]);

  const handleCreateRoom = () => {
    if (!isConnected) return alert('未连接到服务器，请稍候...');
    if (!playerName.trim()) return alert('请输入你的昵称');
    
    setIsCreating(true);
    console.log('Emitting create_room event...');
    socket.emit('create_room', { playerName, userId });
    
    // Reset loading state after timeout
    setTimeout(() => setIsCreating(false), 5000);
  };

  const handleJoinRoom = () => {
    if (!isConnected) return alert('未连接到服务器，请稍候...');
    if (!playerName.trim()) return alert('请输入你的昵称');
    if (!roomIdToJoin.trim()) return alert('请输入房间号');
    
    setIsJoining(true);
    console.log('Emitting join_room event...');
    socket.emit('join_room', { roomId: roomIdToJoin.toUpperCase(), playerName, userId });
    
    setTimeout(() => setIsJoining(false), 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-6xl font-extrabold mb-4 text-yellow-500 tracking-wider drop-shadow-lg">骷髅王</h1>
      <button onClick={() => navigate('/rules')} className="mb-8 text-slate-400 hover:text-white underline underline-offset-4">
        查看游戏规则
      </button>
      
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 relative">
        {!isConnected && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-xl z-10">
                <div className="text-red-500 font-bold animate-pulse">正在连接服务器...</div>
            </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">你的昵称</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-white placeholder-slate-500"
            placeholder="请输入海盗名..."
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !isConnected}
            className={`w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${(isCreating || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCreating ? '创建中...' : '创建新房间'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-500">或者加入房间</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white placeholder-slate-500 uppercase"
              placeholder="房间号"
            />
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !isConnected}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors duration-200 ${(isJoining || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isJoining ? '加入中...' : '加入'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
