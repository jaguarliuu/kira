#!/bin/bash
# OpenClaw Lens 一键安装脚本

set -e

echo "🔍 OpenClaw Lens 安装向导"
echo "========================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 收集信息
read -p "GitHub 用户名: " GITHUB_USER
read -p "仓库名称 (默认 openclaw-lens): " REPO_NAME
REPO_NAME=${REPO_NAME:-"openclaw-lens"}

read -p "你的 Agent 名称 (默认 kira): " AGENT_NAME
AGENT_NAME=${AGENT_NAME:-"kira"}

echo ""
echo "📋 配置信息："
echo "  GitHub 用户: $GITHUB_USER"
echo "  仓库名称: $REPO_NAME"
echo "  Agent 名称: $AGENT_NAME"
echo ""
read -p "确认安装？ (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消安装"
    exit 1
fi

# 1. Clone 模板
echo ""
echo "📥 正在克隆模板..."
git clone https://github.com/jaguarliuu/OpenClaw-Lens.git "$REPO_NAME"
cd "$REPO_NAME"

# 2. 配置 Git
echo "⚙️  正在配置 Git..."
git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# 3. 创建 .env.local
echo "🔧 正在创建本地配置..."
cat > .env.local << EOF
VITE_GITHUB_OWNER=$GITHUB_USER
VITE_GITHUB_REPO=$REPO_NAME
EOF

# 4. 配置 OpenClaw Skill
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
if [ -f "$OPENCLAW_CONFIG" ]; then
    echo "📝 正在配置 OpenClaw Skill..."

    # 备份
    cp "$OPENCLAW_CONFIG" "$OPENCLAW_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

    # 添加 skill 配置
    if command -v jq &> /dev/null; then
        jq --arg repo "$GITHUB_USER/$REPO_NAME" \
           --arg agent "$AGENT_NAME" \
           '.skills.entries["preview-sync"] = {
             "enabled": true,
             "previewRepo": $repo,
             "agentName": $agent
           }' "$OPENCLAW_CONFIG" > tmp.json && mv tmp.json "$OPENCLAW_CONFIG"
        echo "✅ Skill 已配置"
    else
        echo "⚠️  jq 未安装，跳过自动配置"
        echo "请手动添加以下配置到 ~/.openclaw/openclaw.json:"
        echo ""
        echo '"preview-sync": {'
        echo '  "enabled": true,'
        echo '  "previewRepo": "'$GITHUB_USER/$REPO_NAME'",'
        echo '  "agentName": "'$AGENT_NAME'"'
        echo '}'
    fi
fi

# 5. 安装依赖
echo "📦 正在安装依赖..."
npm install

# 6. 删除示例文件，保留目录结构
echo "🗂️  准备目录结构..."
rm -rf public/agents/*
mkdir -p "public/agents/$AGENT_NAME"

# 7. Git 操作
echo "🚀 正在推送到 GitHub..."
git add .
git commit -m "Initial commit: OpenClaw Lens setup"
git branch -M main
git push -u origin main

# 8. 完成
echo ""
echo "✅ 安装完成！"
echo ""
echo "📋 下一步："
echo "  1. 在 GitHub 仓库设置中启用 Pages"
echo "     Settings → Pages → Source: GitHub Actions"
echo ""
echo "  2. 等待 GitHub Actions 构建完成"
echo ""
echo "  3. 访问你的预览站点："
echo "     https://$GITHUB_USER.github.io/$REPO_NAME"
echo ""
echo "🛠️  使用方法："
echo "  预览仓库中的 skill/preview-sync.sh 脚本"
echo "  或者手动复制文件到 public/agents/$AGENT_NAME/"
echo ""
