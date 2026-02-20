#!/bin/bash

# OpenClaw Lens - 文件同步脚本
# 用法: preview-sync <source-file> [agent-name]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 从 openclaw.json 读取配置
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
    echo -e "${RED}❌ 未找到 OpenClaw 配置文件${NC}"
    exit 1
fi

# 读取配置
PREVIEW_REPO=$(jq -r '.skills.entries["preview-sync"].previewRepo // empty' "$OPENCLAW_CONFIG" 2>/dev/null)
AGENT_NAME=$(jq -r '.skills.entries["preview-sync"].agentName // "default"' "$OPENCLAW_CONFIG" 2>/dev/null)

if [ -z "$PREVIEW_REPO" ]; then
    echo -e "${RED}❌ 未配置 preview-sync skill${NC}"
    echo "请在 ~/.openclaw/openclaw.json 中添加配置："
    echo ""
    echo '"preview-sync": {'
    echo '  "enabled": true,'
    echo '  "previewRepo": "username/repo-name",'
    echo '  "agentName": "kira"'
    echo '}'
    exit 1
fi

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: preview-sync <source-file> [agent-name]"
    echo ""
    echo "示例:"
    echo "  preview-sync /path/to/file.md"
    echo "  preview-sync /path/to/file.md ha"
    exit 1
fi

SOURCE_FILE="$1"
AGENT_NAME="${2:-$AGENT_NAME}"

# 检查源文件是否存在
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ 文件不存在: $SOURCE_FILE${NC}"
    exit 1
fi

# 解析仓库信息
GITHUB_USER=$(echo "$PREVIEW_REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$PREVIEW_REPO" | cut -d'/' -f2)

echo -e "${BLUE}🔍 OpenClaw Lens Sync${NC}"
echo "===================="
echo "  仓库: $PREVIEW_REPO"
echo "  Agent: $AGENT_NAME"
echo ""

# Clone 预览仓库到临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo -e "${YELLOW}[1/4] Clone 预览仓库...${NC}"
git clone "https://github.com/$PREVIEW_REPO.git" "$TEMP_DIR" 2>&1 | grep -v "^Cloning into\|^remote:\|^Receiving\|^Resolving\|^From"

cd "$TEMP_DIR"

# 创建目标目录
TARGET_DIR="public/agents/$AGENT_NAME"
mkdir -p "$TARGET_DIR"

# 复制文件
FILENAME=$(basename "$SOURCE_FILE")
echo -e "${YELLOW}[2/4] 复制文件到 $TARGET_DIR/$FILENAME...${NC}"
cp "$SOURCE_FILE" "$TARGET_DIR/$FILENAME"

# Git 操作
echo -e "${YELLOW}[3/4] 提交更改...${NC}"
git add "$TARGET_DIR/$FILENAME"
git commit -m "Add $FILENAME to $AGENT_NAME" 2>&1 | grep -v "^Author:\|^Date:\|^$\|^    " || true

echo -e "${YELLOW}[4/4] 推送到 GitHub...${NC}"
git push 2>&1 | grep -v "^To\|^remote:\|^From\|^   "

echo ""
echo -e "${GREEN}✅ 同步完成！${NC}"
echo ""
echo -e "${BLUE}预览地址:${NC}"
echo "  https://$GITHUB_USER.github.io/$REPO_NAME/"
