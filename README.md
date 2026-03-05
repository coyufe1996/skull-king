---
title: Skull King Game
emoji: ☠️
colorFrom: yellow
colorTo: red
sdk: docker
pinned: false
---

# Skull King Web Game (骷髅王网页版)

A multiplayer trick-taking card game built with React, Node.js, and Socket.io.

## 🎮 Game Rules
Skull King is a trick-taking game where players bid on how many tricks they will win each round. 
- **Suits**: Parrot (Green), Map (Purple), Treasure (Yellow). Numbered 1-14.
- **Trump**: Jolly Roger (Black). Beats all suits.
- **Special Cards**:
  - **Escape**: Value 0. Usually loses.
  - **Pirate**: Beats all suits and Jolly Roger.
  - **Skull King**: Beats everything EXCEPT Mermaid.
  - **Mermaid**: Beats all suits and Jolly Roger. Beats Skull King if played in same trick.
  - **Tigress**: Can be played as Escape or Pirate (Simplified to Pirate for now).

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, Socket.io
- **Language**: TypeScript

## 🚀 Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   npm run install:all
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Client: http://localhost:5173
   - Server: http://localhost:3001

## 📦 Deployment Guide (Render.com)

This project is set up as a Monorepo, which makes it easy to deploy on Render.com as a **Web Service**.

### Option 1: Deploy as Monorepo (Recommended)

1. **Create a new Web Service** on Render.
2. **Connect your GitHub repository**.
3. **Configure Settings**:
   - **Name**: `skull-king-game`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build` 
     *(This builds both client and server)*
   - **Start Command**: `npm start`
   - **Root Directory**: `.` (default)

4.52→4. **Environment Variables**:
53→   - `NODE_ENV`: `production`
54→   - `PORT`: `10000` (Render default)
55→   - `VITE_SOCKET_URL`: (Optional) Leave empty to connect to the same host (recommended for monorepo).
56→
57→### Option 2: Deploy Client and Server Separately

**Server (Web Service)**:
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Client (Static Site)**:
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- **Environment Variable**: `VITE_SOCKET_URL` = `https://your-server-url.onrender.com`

## 📝 TODOs & Future Improvements
- [ ] Implement proper Tigress card selection (Escape vs Pirate).
- [ ] Add bonus points (Pirate capture, etc.).
- [ ] Improve UI animations for card playing.
- [ ] Add chat functionality.
