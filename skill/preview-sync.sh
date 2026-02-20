#!/bin/bash

# OpenClaw Preview Sync - 文件同步脚本
# 用法: ./skill/preview-sync.sh [commit-message]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 默认提交信息
DEFAULT_MESSAGE="chore: sync preview files"

# 获取提交信息参数
COMMIT_MESSAGE="${1:-$DEFAULT_MESSAGE}"

echo -e "${BLUE}📁 OpenClaw Preview Sync${NC}"
echo "================================"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 检查是否有远程仓库
echo -e "\n${YELLOW}[1/5] 检查远程仓库...${NC}"
if ! git remote | grep -q "origin"; then
    echo -e "${RED}❌ 未配置远程仓库 origin${NC}"
    echo "请先添加远程仓库: git remote add origin <repository-url>"
    exit 1
fi
REMOTE_URL=$(git remote get-url origin)
echo -e "${GREEN}✓ 远程仓库: $REMOTE_URL${NC}"

# 检查工作目录状态
echo -e "\n${YELLOW}[2/5] 检查文件状态...${NC}"
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}✓ 没有需要同步的更改${NC}"
    echo -e "${BLUE}当前已是最新状态${NC}"
    exit 0
fi

# 显示更改的文件
echo -e "${BLUE}以下文件已更改:${NC}"
git status --short
echo ""

# 添加所有更改
echo -e "${YELLOW}[3/5] 添加更改到暂存区...${NC}"
git add .
echo -e "${GREEN}✓ 更改已添加到暂存区${NC}"

# 创建提交
echo -e "\n${YELLOW}[4/5] 创建提交...${NC}"
git commit -m "$COMMIT_MESSAGE"
echo -e "${GREEN}✓ 提交已创建: $COMMIT_MESSAGE${NC}"

# 推送到远程
echo -e "\n${YELLOW}[5/5] 推送到远程仓库...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$CURRENT_BRANCH"
echo -e "${GREEN}✓ 已推送到 origin/$CURRENT_BRANCH${NC}"

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ 同步完成！${NC}"
echo ""
echo -e "${BLUE}GitHub Actions 将自动构建并部署。${NC}"
echo -e "${BLUE}请访问 Actions 页面查看构建状态。${NC}"
