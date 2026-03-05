# 骷髅王 (Skull King) 部署指南

本指南将帮助你将游戏部署到线上环境。推荐使用 **Render.com** 进行免费部署，或者使用 Docker 部署到任意 VPS。

## 方案一：使用 Render.com 部署 (推荐 - 最简单)

Render 提供免费的 Web Service 托管，非常适合本项目。

### 1. 准备工作
1.  将本项目推送到你的 GitHub 仓库。
2.  注册一个 [Render.com](https://render.com) 账号。

### 2. 创建 Web Service
1.  在 Render 控制台点击 **New +** -> **Web Service**。
2.  选择 "Build and deploy from a Git repository"。
3.  连接你的 GitHub 仓库。

### 3. 配置服务
在配置页面填写以下信息：

*   **Name**: `skull-king-game` (或者你喜欢的名字)
*   **Region**: 选择离你最近的地区 (如 Singapore)
*   **Branch**: `main` (或者你的开发分支)
*   **Root Directory**: `.` (保持默认，即根目录)
*   **Runtime**: `Node`
*   **Build Command**: `npm install && npm run build`
    *   *注意：这个命令会自动安装根目录、client 和 server 的依赖，并构建前后端。*
*   **Start Command**: `npm start`
    *   *注意：这个命令会启动 server，并托管 client 的静态文件。*

### 4. 环境变量 (Environment Variables)
在 "Environment Variables" 部分添加以下变量：

*   `NODE_ENV`: `production`

### 5. 部署
点击 **Create Web Service**。
Render 会自动开始构建和部署。构建过程可能需要几分钟（因为要安装前后端依赖）。
部署完成后，你会在顶部看到一个 URL (例如 `https://skull-king-game.onrender.com`)。点击即可访问游戏！

---

## 方案二：使用 Docker 部署 (进阶 - 适合 VPS)

如果你有自己的服务器 (VPS)，可以使用 Docker 一键部署。

### 1. 构建镜像
在项目根目录下运行：
```bash
docker build -t skull-king .
```

### 2. 运行容器
```bash
docker run -d -p 3000:3001 --name skull-king-game skull-king
```
*   游戏将在 `http://localhost:3000` 运行。
*   你可以修改 `-p` 参数来改变端口，例如 `-p 80:3001` 让游戏在 80 端口运行。

---

## 方案三：手动部署 (传统方式)

### 1. 环境要求
*   Node.js 18+
*   NPM

### 2. 安装与构建
```bash
# 1. 安装根目录依赖
npm install

# 2. 安装并构建前端
cd client
npm install
npm run build
cd ..

# 3. 安装并构建后端
cd server
npm install
npm run build
cd ..
```

### 3. 启动
```bash
# 设置环境变量为生产模式
export NODE_ENV=production

# 启动服务器
cd server
npm start
```
游戏将在 `http://localhost:3001` 运行。

---

## 常见问题

**Q: 部署后无法连接服务器？**
A: 请检查浏览器控制台 (F12) 的 Console。如果是 `Socket.io connection error`，可能是因为 WebSocket 连接地址不对。
*   在 Render 上，前端会自动连接到当前域名，通常不需要额外配置。
*   如果遇到跨域问题 (CORS)，请检查 `server/src/index.ts` 中的 `cors` 配置。

**Q: 如何查看服务器日志？**
A: 在 Render 控制台点击 "Logs" 标签页即可查看实时日志。
