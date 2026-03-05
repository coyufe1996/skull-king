import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useSocket } from '../hooks/useSocket';
import { Card as CardType, GameState, Player } from '../../../shared/types';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Crown } from 'lucide-react';
import { checkCardPlayability } from '../utils/gameRules';

const GameRoom: React.FC = () => {
  const { gameState, playerName, reset } = useGameStore();
  const socket = useSocket();
  const navigate = useNavigate();
  const [myBid, setMyBid] = useState<number>(0);
  const [showTigressModal, setShowTigressModal] = useState<boolean>(false);
  const [selectedTigressCard, setSelectedTigressCard] = useState<CardType | null>(null);
  
  // Modal states for end of trick/round
  const [showTrickEndModal, setShowTrickEndModal] = useState(false);
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const [trickWinner, setTrickWinner] = useState<string | null>(null);
  const [previousScores, setPreviousScores] = useState<Record<string, number>>({});

  if (!gameState) return <div>加载中...</div>;

  // Track score changes
  useEffect(() => {
    if (gameState) {
      const scores: Record<string, number> = {};
      gameState.players.forEach(p => {
        scores[p.id] = p.score;
      });
      setPreviousScores(scores);
    }
  }, []);

  // Set up socket listeners for trick/round end
  useEffect(() => {
    if (!socket) return;

    const onTrickEnd = ({ winnerId }: { winnerId: string }) => {
      setTrickWinner(winnerId);
      setShowTrickEndModal(true);
    };

    const onRoundEnded = (room: GameState) => {
      setShowRoundEndModal(true);
    };

    socket.on('trick_end', onTrickEnd);
    socket.on('round_ended', onRoundEnded);

    return () => {
      socket.off('trick_end', onTrickEnd);
      socket.off('round_ended', onRoundEnded);
    };
  }, [socket]);

  const currentPlayer = gameState.players.find(p => p.name === playerName);
  const isHost = gameState.players[0].name === playerName;
  
  const isMyTurn = currentPlayer && gameState.players[gameState.currentTurnIndex]?.id === currentPlayer.id;

  // Calculate my turn order relative to current start
  const myIndex = gameState.players.findIndex(p => p.name === playerName);
  const startIndex = gameState.currentTurnIndex; // In bidding phase, this is the starting player
  const playerCount = gameState.players.length;
  // Calculate position: (myIndex - startIndex + playerCount) % playerCount + 1
  const myTurnOrder = (myIndex - startIndex + playerCount) % playerCount + 1;

  const toggleReady = () => {
    if (currentPlayer) {
      socket?.emit('player_ready', { 
        roomId: gameState.roomId, 
        isReady: !currentPlayer.isReady 
      });
    }
  };

  const addBot = () => {
    socket?.emit('add_bot', gameState.roomId);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(gameState.roomId);
    alert('房间号已复制!');
  };
  
  const submitBid = () => {
      socket.emit('submit_bid', { roomId: gameState.roomId, bid: myBid });
  };

  const playCard = (card: CardType) => {
      if (!isMyTurn || gameState.phase !== 'playing') return;
      
      // Client-side validation
      if (!checkCardPlayability(card, currentPlayer!.hand, gameState.leadSuit)) {
          // Optional: Show toast or shake animation
          return;
      }

      if (card.specialType === 'tigress') {
        setSelectedTigressCard(card);
        setShowTigressModal(true);
        return;
      }

      socket.emit('play_card', { roomId: gameState.roomId, cardId: card.id });
  };

  const playTigress = (as: 'escape' | 'pirate') => {
      if (!selectedTigressCard) return;
      socket.emit('play_card', { roomId: gameState.roomId, cardId: selectedTigressCard.id, playedAs: as });
      setShowTigressModal(false);
      setSelectedTigressCard(null);
  };

  const leaveRoom = () => {
      socket.emit('leave_room', gameState.roomId);
      reset();
      navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 select-none">
      <div className="max-w-6xl mx-auto flex flex-col min-h-[80vh]">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold text-yellow-500">房间: <span onClick={copyRoomId} className="cursor-pointer hover:underline font-mono">{gameState.roomId}</span></h1>
             <span className="bg-slate-700 px-3 py-1 rounded text-sm">回合: {gameState.round}/10</span>
             <span className={`px-3 py-1 rounded text-sm uppercase font-bold ${isMyTurn && gameState.phase === 'playing' ? 'bg-green-600 animate-pulse' : 'bg-slate-700 text-blue-400'}`}>
                {gameState.phase === 'playing' && isMyTurn ? '轮到你了' : 
                 gameState.phase === 'lobby' ? '等待开始' :
                 gameState.phase === 'bidding' ? '叫分阶段' :
                 gameState.phase === 'playing' ? '出牌阶段' :
                 gameState.phase === 'ended' ? '游戏结束' : gameState.phase}
             </span>
          </div>
          <div className="flex gap-4">
             {isHost && gameState.phase === 'lobby' && (
                <button onClick={addBot} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded font-bold text-sm">
                    + 添加机器人
                </button>
             )}
             <button onClick={leaveRoom} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-sm">
                 离开房间
             </button>
          </div>
        </header>

        {/* Game Table Area */}
        <div className="flex-1 relative bg-slate-800/50 rounded-2xl border border-slate-700 mb-8 flex items-center justify-center p-8 min-h-[400px]">
            {/* Played Cards */}
            <div className="flex gap-4 items-center justify-center flex-wrap">
                {gameState.tableCards.map((played, idx) => {
                    const player = gameState.players.find(p => p.id === played.playerId);
                    return (
                        <div key={idx} className="flex flex-col items-center animate-in fade-in zoom-in duration-300 mx-2">
                            <Card card={played.card} size="lg" />
                            <span className="mt-2 font-bold text-sm bg-slate-900 px-2 py-1 rounded border border-slate-700">{player?.name}</span>
                        </div>
                    );
                })}
                {gameState.tableCards.length === 0 && gameState.phase === 'playing' && (
                    <div className="text-slate-500 text-xl italic animate-pulse">等待 {gameState.players[gameState.currentTurnIndex]?.name} 出牌...</div>
                )}
                {gameState.phase === 'lobby' && (
                    <div className="text-slate-500 text-xl italic">等待所有玩家准备就绪...</div>
                )}
            </div>
        </div>

        {/* Players Stats Row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {gameState.players.map((player) => (
            <div 
              key={player.id} 
              className={`p-3 rounded-lg border transition-all ${
                gameState.currentTurnIndex >= 0 && gameState.players[gameState.currentTurnIndex]?.id === player.id && gameState.phase === 'playing'
                  ? 'bg-blue-900/50 border-blue-500 shadow-lg scale-105' 
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate max-w-[80px]">{player.name}</h3>
                    {gameState.currentTurnIndex >= 0 && gameState.players[gameState.currentTurnIndex]?.id === player.id && (
                        <span className="text-[10px] bg-yellow-600 text-white px-1 rounded flex items-center" title="本轮先手">
                            先
                        </span>
                    )}
                </div>
                {player.name === playerName && <span className="text-[10px] bg-blue-600 px-1 rounded">我</span>}
              </div>
              <div className="flex justify-between text-xs mb-1">
                  <span>叫分: <b className="text-yellow-400">{player.bid === -1 ? '?' : player.bid}</b></span>
                  <span>得分: <b className="text-green-400">{player.tricksWon}</b></span>
              </div>
              <div className="text-center bg-slate-900 rounded py-1">
                  <span className="text-xs text-slate-400">总分</span>
                  <div className="font-bold text-purple-400">{player.score}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lobby Controls */}
        {gameState.phase === 'lobby' && (
            <div className="flex justify-center mb-12">
                <button
                onClick={toggleReady}
                className={`px-12 py-4 text-xl font-bold rounded-full transition-all transform hover:scale-105 ${
                    currentPlayer?.isReady
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/50'
                }`}
                >
                {currentPlayer?.isReady ? '取消准备' : '准备开始'}
                </button>
            </div>
        )}
        
        {/* Bidding Modal */}
        {gameState.phase === 'bidding' && currentPlayer && currentPlayer.bid === -1 && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-xl border border-yellow-500 max-w-md w-full text-center shadow-2xl">
                    <h2 className="text-3xl font-bold text-yellow-500 mb-6">第 {gameState.round} 回合</h2>
                    <h3 className="text-xl font-bold text-white mb-2">呦吼吼!</h3>
                    <p className="mb-4 text-lg text-slate-300">
                        {gameState.players[gameState.currentTurnIndex]?.id === currentPlayer.id 
                            ? <span className="text-green-400 font-bold block mb-2 text-2xl">本轮由你先出牌!</span> 
                            : <div className="flex flex-col gap-1">
                                <span>本轮先手: <span className="font-bold text-yellow-400">{gameState.players[gameState.currentTurnIndex]?.name}</span></span>
                                <span className="text-sm bg-slate-700 py-1 px-3 rounded-full mx-auto">你是第 <span className="text-yellow-400 font-bold">{myTurnOrder}</span> 个出牌</span>
                              </div>
                        }
                    </p>
                    <p className="mb-6 text-sm text-slate-400">你觉得你能赢几墩?</p>
                    
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <button onClick={() => setMyBid(Math.max(0, myBid - 1))} className="w-12 h-12 bg-slate-700 rounded-full text-2xl font-bold hover:bg-slate-600 transition-colors">-</button>
                        <span className="text-5xl font-bold w-20 font-mono text-yellow-400">{myBid}</span>
                        <button onClick={() => setMyBid(Math.min(gameState.round, myBid + 1))} className="w-12 h-12 bg-slate-700 rounded-full text-2xl font-bold hover:bg-slate-600 transition-colors">+</button>
                    </div>
                    
                    <button 
                        onClick={submitBid}
                        className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg text-xl transition-colors shadow-lg shadow-yellow-900/50"
                    >
                        确认叫分
                    </button>
                    
                    {/* Hand Preview for Bidding */}
                    <div className="mt-8">
                        <p className="text-sm text-slate-400 mb-2">你的手牌预览:</p>
                        <div className="overflow-x-auto whitespace-nowrap py-2 px-2 bg-slate-900/50 rounded-lg">
                            <div className="inline-flex gap-2">
                                {currentPlayer.hand.map((card) => (
                                    <Card key={card.id} card={card} size="sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Trick End Modal */}
        {showTrickEndModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-xl border border-green-500 max-w-lg w-full text-center shadow-2xl">
                    <h2 className="text-3xl font-bold text-green-400 mb-6">🎉 一墩结束!</h2>
                    <p className="text-xl mb-4">
                        <span className="text-yellow-400 font-bold">{gameState.players.find(p => p.id === trickWinner)?.name}</span> 赢得了这墩!
                    </p>
                    
                    <div className="bg-slate-900 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-bold mb-3 text-slate-300">当前得分情况:</h3>
                        <div className="space-y-2">
                            {gameState.players.map((player) => {
                                const prevScore = previousScores[player.id] || 0;
                                const scoreChange = player.score - prevScore;
                                return (
                                    <div key={player.id} className="flex justify-between items-center text-sm">
                                        <span className={player.id === trickWinner ? 'text-yellow-400 font-bold' : 'text-slate-300'}>
                                            {player.name}
                                        </span>
                                        <span className="font-mono">
                                            <span className="text-slate-400">{prevScore}</span>
                                            {scoreChange > 0 && <span className="text-green-400 ml-2">+{scoreChange}</span>}
                                            {scoreChange < 0 && <span className="text-red-400 ml-2">{scoreChange}</span>}
                                            <span className="text-purple-400 ml-2">→ {player.score}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowTrickEndModal(false)}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xl transition-colors shadow-lg shadow-green-900/50"
                    >
                        继续游戏
                    </button>
                </div>
            </div>
        )}
        
        {/* Round End Modal */}
        {showRoundEndModal && (
            <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-xl border border-blue-500 max-w-2xl w-full text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-blue-400 mb-2">第 {gameState.round - 1} 回合结束!</h2>
                    <p className="text-lg text-slate-300 mb-6">准备进入第 {gameState.round} 回合</p>
                    
                    <div className="bg-slate-900 rounded-lg p-6 mb-6">
                        <h3 className="text-xl font-bold mb-4 text-slate-200">本回合结果:</h3>
                        <div className="space-y-3">
                            {gameState.players.map((player) => {
                                const prevScore = previousScores[player.id] || 0;
                                const scoreChange = player.score - prevScore;
                                const madeBid = player.tricksWon === player.bid;
                                return (
                                    <div key={player.id} className={`flex justify-between items-center p-3 rounded-lg ${madeBid ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                                        <div className="text-left">
                                            <span className="font-bold text-lg">{player.name}</span>
                                            <div className="text-xs text-slate-400">
                                                叫分: <span className="text-yellow-400 font-bold">{player.bid}</span> | 
                                                赢得: <span className="text-green-400 font-bold">{player.tricksWon}</span>
                                            </div>
                                        </div>
                                        <div className="text-right font-mono">
                                            <div className="text-lg">
                                                {scoreChange > 0 && <span className="text-green-400">+{scoreChange}</span>}
                                                {scoreChange < 0 && <span className="text-red-400">{scoreChange}</span>}
                                                {scoreChange === 0 && <span className="text-slate-400">±0</span>}
                                            </div>
                                            <div className="text-sm text-purple-400">总分: {player.score}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setShowRoundEndModal(false);
                            const scores: Record<string, number> = {};
                            gameState.players.forEach(p => {
                                scores[p.id] = p.score;
                            });
                            setPreviousScores(scores);
                        }}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xl transition-colors shadow-lg shadow-blue-900/50"
                    >
                        进入下一回合
                    </button>
                </div>
            </div>
        )}
        
        {/* Game Over Modal */}
        {gameState.phase === 'ended' && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-xl border border-yellow-500 max-w-2xl w-full text-center shadow-2xl">
                    <h1 className="text-5xl font-extrabold text-yellow-500 mb-8">游戏结束</h1>
                    
                    <div className="space-y-4 mb-8">
                        {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                            <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${i === 0 ? 'bg-yellow-900/50 border border-yellow-500 scale-105' : 'bg-slate-700'}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl font-bold w-8 ${i===0 ? 'text-yellow-400' : 'text-slate-400'}`}>{i + 1}.</span>
                                    <span className="text-xl font-bold">{p.name}</span>
                                    {i === 0 && <Crown className="text-yellow-400 w-6 h-6" />}
                                </div>
                                <span className="text-2xl font-bold text-yellow-400">{p.score} 分</span>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={leaveRoom}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xl shadow-lg shadow-blue-900/50 transition-colors"
                    >
                        返回大厅
                    </button>
                </div>
            </div>
        )}
        
        {/* Tigress Modal */}
        {showTigressModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-xl border border-orange-500 max-w-md w-full text-center shadow-2xl">
                    <h2 className="text-3xl font-bold text-orange-500 mb-6">母老虎效果选择</h2>
                    <p className="mb-8 text-lg text-slate-300">你想把这张母老虎当作什么牌打出？</p>
                    
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => playTigress('pirate')}
                            className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xl transition-colors shadow-lg shadow-red-900/50 flex flex-col items-center gap-2"
                        >
                            <span>⚔️</span>
                            <span>海盗</span>
                        </button>
                        <button 
                            onClick={() => playTigress('escape')}
                            className="flex-1 py-4 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg text-xl transition-colors shadow-lg shadow-slate-900/50 flex flex-col items-center gap-2"
                        >
                            <span>🏳️</span>
                            <span>撤退</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => {setShowTigressModal(false); setSelectedTigressCard(null);}}
                        className="mt-6 text-slate-400 hover:text-white underline"
                    >
                        取消
                    </button>
                </div>
            </div>
        )}

        {/* Hand Display */}
        {currentPlayer && gameState.phase !== 'lobby' && (
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    你的手牌 
                    {isMyTurn && gameState.phase === 'playing' && <span className="text-sm font-normal text-green-400 animate-pulse">(请出牌)</span>}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center pb-8">
                    {currentPlayer.hand.map((card) => {
                        const canPlayThisCard = isMyTurn && gameState.phase === 'playing' && checkCardPlayability(card, currentPlayer.hand, gameState.leadSuit);
                        return (
                            <Card 
                                key={card.id} 
                                card={card} 
                                isPlayable={canPlayThisCard}
                                onClick={() => playCard(card)}
                                className={canPlayThisCard ? 'hover:-translate-y-4' : 'opacity-40 grayscale cursor-not-allowed'}
                            />
                        );
                    })}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default GameRoom;
