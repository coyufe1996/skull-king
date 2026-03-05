# Skull King Web版 - 技术架构文档

## 1. 技术栈选择 (Tech Stack)

### 前端 (Frontend)
*   **框架**: React 18 (使用 Vite 构建)
*   **语言**: TypeScript
*   **样式**: Tailwind CSS (快速构建UI) + Framer Motion (动画)
*   **状态管理**: Zustand (轻量级状态管理)
*   **通信**: Socket.io-client (实时通信)
*   **路由**: React Router v6

### 后端 (Backend)
*   **运行时**: Node.js
*   **框架**: Express (HTTP服务) + Socket.io (WebSocket服务)
*   **语言**: TypeScript
*   **数据存储**: 
    *   MVP阶段：内存存储 (In-Memory)，利用 Node.js 变量存储房间状态。
    *   生产阶段：Redis (缓存房间状态) + PostgreSQL (持久化战绩，可选)。

### 部署 (Deployment)
*   **平台**: Render.com
*   **方式**: 
    *   方案A (推荐): Monorepo 部署。后端作为 Web Service，前端构建后由后端静态托管。
    *   方案B: 前后端分离。前端部署为 Static Site，后端部署为 Web Service。

## 2. 项目结构 (Project Structure)
采用 Monorepo 结构，方便管理前后端类型共享。

```
/
├── client/                 # 前端 React 项目
│   ├── src/
│   │   ├── components/     # UI组件 (Card, PlayerAvatar, etc.)
│   │   ├── pages/          # 页面 (Lobby, GameRoom)
│   │   ├── hooks/          # Custom Hooks (useSocket, useGameLogic)
│   │   ├── stores/         # Zustand stores
│   │   └── utils/          # 游戏逻辑辅助函数
├── server/                 # 后端 Express 项目
│   ├── src/
│   │   ├── handlers/       # Socket事件处理器
│   │   ├── models/         # 游戏类 (Game, Player, Deck)
│   │   └── utils/          # 辅助函数
├── shared/                 # 前后端共享类型定义 (Types)
│   ├── types.ts            # Card, GameState, PlayerAction 接口
├── package.json            # Root package configuration
└── README.md
```

## 3. 数据模型 (Data Models)

### 3.1 核心对象
**Card (卡牌)**
```typescript
interface Card {
  id: string;
  type: 'suit' | 'special';
  suit?: 'parrot' | 'map' | 'treasure' | 'jolly_roger'; // 绿, 紫, 黄, 黑
  value?: number; // 1-14
  specialType?: 'skull_king' | 'pirate' | 'mermaid' | 'escape' | 'tigress';
}
```

**Player (玩家)**
```typescript
interface Player {
  id: string;      // Socket ID
  name: string;
  hand: Card[];    // 手牌
  bid: number;     // 叫分
  tricksWon: number; // 当前赢得墩数
  score: number;   // 总分
  isReady: boolean;
}
```

**GameState (游戏状态)**
```typescript
interface GameState {
  roomId: string;
  phase: 'lobby' | 'bidding' | 'playing' | 'scoring' | 'ended';
  round: number;   // 当前轮数 (1-10)
  players: Player[];
  currentTurnIndex: number; // 当前出牌玩家索引
  tableCards: { playerId: string; card: Card }[]; // 桌面上的牌
  leadSuit: string | null; // 本轮先手花色
}
```

## 4. 通信协议 (Socket Events)

### Client -> Server
*   `join_room`: { roomId, playerName }
*   `player_ready`: {}
*   `submit_bid`: { bid: number }
*   `play_card`: { cardId: string, specialAction?: string }
*   `send_message`: { text: string }

### Server -> Client
*   `room_update`: { players, readyState }
*   `game_start`: { hand: Card[], round: number }
*   `phase_change`: { phase: string }
*   `turn_update`: { currentTurnPlayerId }
*   `table_update`: { playedCards }
*   `trick_end`: { winnerId }
*   `round_end`: { scores }
*   `error`: { message }

## 5. Render.com 部署指南

### 5.1 配置
*   **Build Command**: `npm install && npm run build` (在根目录，会触发 client 和 server 的构建)
*   **Start Command**: `npm run start` (启动 server，server 会托管 client 的静态文件)
*   **Environment Variables**:
    *   `NODE_ENV`: production
    *   `PORT`: 10000 (或其他端口)

### 5.2 域名
*   Render 提供 `xxx.onrender.com` 免费子域名，支持 HTTPS。
*   自定义域名可在 Render 控制台添加 CNAME 记录即可。
