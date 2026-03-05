# 骷髅王 (Skull King) 部署指南

本指南将帮助你将游戏部署到线上环境。

## 🌟 最佳推荐：Hugging Face Spaces (无需信用卡，完全免费)

Hugging Face Spaces 提供免费的 Docker 容器托管，无需绑定信用卡，只要注册账号即可使用。非常适合个人项目。

### 1. 准备工作
1.  确保你已经将代码推送到 GitHub（刚才我们已经做过了）。
2.  注册一个 [Hugging Face](https://huggingface.co/join) 账号。

### 2. 创建 Space
1.  登录 Hugging Face，点击右上角头像 -> **New Space**。
2.  **Space name**: `skull-king-game` (或者你喜欢的名字)。
3.  **License**: `MIT` (可选)。
4.  **Select the Space SDK**: 选择 **Docker**。
5.  **Choose a Docker template**: 选择 **Blank**。
6.  **Space hardware**: 保持默认的 **Free (2 vCPU · 16 GB · CPU basic)**。
7.  点击 **Create Space**。

### 3. 部署代码
创建成功后，页面会提示你如何上传代码。你有两种方式：

**方式 A：直接连接 GitHub (最简单)**
1.  在 Space 页面，点击 **Settings** 标签页。
2.  向下滚动找到 **Git Repository** 或 **Connect to a repository** 部分。
3.  点击连接你的 GitHub 仓库。
4.  Hugging Face 会自动拉取代码并开始构建。

**方式 B：手动上传 (如果 GitHub 连接有问题)**
1.  在你的本地终端运行以下命令（将 `<你的Space地址>` 替换为 Hugging Face 提供的地址）：
    ```bash
    git remote add space https://huggingface.co/spaces/<你的用户名>/<Space名称>
    git push space main
    ```
    *(注意：这需要你先在 Hugging Face 设置里生成一个 Access Token 并在推送时输入)*

### 4. 等待构建
*   点击 **App** 标签页，你会看到 "Building" 的状态。
*   构建可能需要几分钟。
*   构建完成后，你的游戏就会直接在页面中运行了！
*   你会得到一个类似 `https://<用户名>-<Space名称>.hf.space` 的网址，发给朋友就可以玩了。

---

## 方案二：Render.com (需要信用卡验证)

如果你有信用卡（国内卡也可以），Render 是一个非常稳定且专业的选择。

1.  注册 [Render.com](https://render.com)。
2.  点击 **New +** -> **Web Service**。
3.  连接你的 GitHub 仓库。
4.  **Runtime**: 选择 **Docker** (因为我们有 Dockerfile)。
5.  **Instance Type**: Free。
6.  点击 **Create Web Service**。

---

## 常见问题

**Q: Hugging Face Spaces 构建失败？**
A: 请点击 "Logs" 查看错误信息。通常是因为 Dockerfile 路径不对或者依赖安装超时。本项目已经配置了标准的 Dockerfile，一般不会有问题。

**Q: 游戏连不上？**
A: Hugging Face 默认使用 HTTPS。如果你的浏览器提示不安全，请确保使用 `https://` 访问。
