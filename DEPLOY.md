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

### 3. 部署代码 (最稳妥的方式)
由于 Hugging Face 界面更新频繁，直接使用 Git 命令行推送是最稳妥的方式。

**步骤 A：准备 Access Token**
1.  点击 Hugging Face 右上角头像 -> **Settings** -> **Access Tokens**。
2.  点击 **Create new token**。
3.  **Token type** 选择 **Write** (必须选 Write 才有推送权限)。
4.  **Name** 随便填，比如 `deploy-token`。
5.  点击 **Create token**，然后**复制这个 Token** (以 `hf_` 开头)。

**步骤 B：推送到 Hugging Face**
回到你的 VS Code 终端，依次运行以下命令（请替换 `<你的用户名>`）：

```bash
# 1. 添加 Hugging Face 远程仓库
# 注意：将 <你的用户名> 替换为你 Hugging Face 的用户名
git remote add space https://huggingface.co/spaces/<你的用户名>/skull-king-game

# 2. 强制推送到 Hugging Face
git push space main
```

**⚠️ 注意：**
*   当终端提示输入 **Username** 时，输入你的 **Hugging Face 用户名**。
*   当终端提示输入 **Password** 时，**粘贴刚才复制的 Access Token** (注意：输入密码时屏幕不会显示任何字符，粘贴后直接回车即可)。

### 4. 等待构建
*   推送成功后，回到 Hugging Face 的 Space 页面。
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
