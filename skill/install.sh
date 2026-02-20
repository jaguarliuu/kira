#!/bin/bash

# OpenClaw Preview Sync - 一键安装脚本
# 用法: ./skill/install.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}🚀 OpenClaw Preview Sync 安装向导${NC}"
echo "================================"

# 检查 Git
echo -e "\n${YELLOW}[1/4] 检查 Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安装，请先安装 Git${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git 已安装: $(git --version)${NC}"

# 检查 Node.js
echo -e "\n${YELLOW}[2/4] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 版本过低，需要 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js 已安装: $(node -v)${NC}"

# 检查 Git 仓库
echo -e "\n${YELLOW}[3/4] 检查 Git 仓库...${NC}"
cd "$PROJECT_ROOT"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Git 仓库未初始化，正在初始化...${NC}"
    git init
    echo -e "${GREEN}✓ Git 仓库已初始化${NC}"
else
    echo -e "${GREEN}✓ Git 仓库已存在${NC}"
fi

# 设置脚本权限
echo -e "\n${YELLOW}[4/4] 设置脚本权限...${NC}"
chmod +x "$SCRIPT_DIR/preview-sync.sh"
chmod +x "$SCRIPT_DIR/install.sh"
echo -e "${GREEN}✓ 脚本权限已设置${NC}"

# 安装依赖
echo -e "\n${YELLOW}安装项目依赖...${NC}"
if [ -f "$PROJECT_ROOT/package.json" ]; then
    cd "$PROJECT_ROOT"
    npm install
    echo -e "${GREEN}✓ 依赖已安装${NC}"
else
    echo -e "${YELLOW}⚠ 未找到 package.json，跳过依赖安装${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ 安装完成！${NC}"
echo ""
echo "使用方法:"
echo "  ./skill/preview-sync.sh              # 使用默认提交信息同步"
echo "  ./skill/preview-sync.sh \"你的信息\"   # 使用自定义提交信息同步"
echo ""
echo -e "${GREEN}祝使用愉快！${NC}"
