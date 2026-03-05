# 骷髅王 (Skull King) 部署指南

本指南将帮助你将游戏部署到线上环境。

## 🌟 最佳推荐：Railway (简单稳定，支持 GitHub 自动部署)

Railway 是目前最简单的部署平台之一，只要你把代码推送到 GitHub，它就能自动识别并部署。

### 1. 准备工作
1.  确保代码已推送到 GitHub (刚才我们已经做过了)。
2.  注册一个 [Railway](https://railway.app/) 账号 (可以用 GitHub 账号直接登录)。

### 2. 创建项目
1.  登录 Railway Dashboard。
2.  点击 **New Project** -> **Deploy from GitHub repo**。
3.  选择你的 `skull-king` 仓库。
4.  点击 **Deploy Now**。

### 3. 等待部署
1.  Railway 会自动检测到你的 `Dockerfile` 并开始构建。
2.  你可以点击项目名称进入详情页，查看 **Build Logs**。
3.  构建完成后，Railway 会分配一个默认域名（通常在 Settings -> Domains 中查看或生成）。
4.  打开该域名即可开始游戏！

---

## 方案二：Hugging Face Spaces (无需信用卡，完全免费)

Hugging Face Spaces 提供免费的 Docker 容器托管，无需绑定信用卡。

### 1. 准备工作
1.  确保你已经将代码推送到 GitHub。
2.  注册一个 [Hugging Face](https://huggingface.co/join) 账号。

### 2. 创建 Space
1.  登录 Hugging Face，点击右上角头像 -> **New Space**。
2.  **Space name**: `skull-king-game`。
3.  **Select the Space SDK**: 选择 **Docker**。
4.  **Choose a Docker template**: 选择 **Blank**。
5.  点击 **Create Space**。

### 3. 部署代码
由于 Hugging Face 界面更新频繁，建议使用 Git 命令行推送。

**步骤 A：准备 Access Token**
1.  点击 Hugging Face 右上角头像 -> **Settings** -> **Access Tokens**。
2.  创建一个 **Write** 权限的 Token。

**步骤 B：推送到 Hugging Face**
```bash
# 1. 添加 Hugging Face 远程仓库 (替换 <你的用户名>)
git remote add space https://huggingface.co/spaces/<你的用户名>/skull-king-game

# 2. 强制推送到 Hugging Face
git push space main
```

---

## 常见问题

**Q: Railway 构建失败？**
A: 请检查 **Build Logs**。如果是 `npm install` 相关错误，通常是网络问题或依赖版本冲突。本项目已针对常见问题进行了优化。

**Q: 游戏连不上？**
A: 确保你的浏览器使用 HTTPS 访问部署后的网址。
