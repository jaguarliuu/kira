# OpenClaw Preview Sync Skill

自动将本地文件同步到 GitHub 仓库，触发 GitHub Actions 构建并部署预览站点。

## 功能

- 📁 本地文件自动同步到 GitHub
- 🚀 触发 GitHub Actions 自动构建
- 🌐 部署到 GitHub Pages 预览

## 前置要求

1. 已安装 Git
2. 有 GitHub 仓库的写权限
3. 已配置 GitHub Token（如需私有仓库访问）

## 安装

```bash
./skill/install.sh
```

## 使用方法

### 同步文件

```bash
./skill/preview-sync.sh [commit-message]
```

参数：
- `commit-message` (可选): 提交信息，默认为 "chore: sync preview files"

### 示例

```bash
# 使用默认提交信息
./skill/preview-sync.sh

# 使用自定义提交信息
./skill/preview-sync.sh "feat: 更新预览内容"
```

## 配置

编辑 `skill/skill.json` 自定义行为：

```json
{
  "name": "preview-sync",
  "version": "1.0.0",
  "description": "OpenClaw Preview 同步工具",
  "repository": "your-username/your-repo",
  "branch": "main"
}
```

## 工作流程

1. 脚本检查是否有未提交的更改
2. 将更改添加到 Git 暂存区
3. 创建提交
4. 推送到远程仓库
5. GitHub Actions 自动触发构建
6. 构建完成后部署到 GitHub Pages

## 注意事项

- 确保已在项目根目录初始化 Git 仓库
- 确保远程仓库已正确配置
- GitHub Actions 构建可能需要几分钟时间
