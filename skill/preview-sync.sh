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

# 固定的项目根目录
LENS_ROOT="/opt/openclaw/kira"

# 从 openclaw.json 读取配置
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
    echo -e "${RED}❌ 未找到 OpenClaw 配置文件${NC}"
    exit 1
fi

# 读取配置
AGENT_NAME=$(jq -r '.skills.entries["preview-sync"].agentName // "default"' "$OPENCLAW_CONFIG" 2>/dev/null)

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: preview-sync <source-file> [agent-name]"
    echo ""
    echo "示例:"
    echo "  preview-sync /path/to/file.md"
    echo "  preview-sync /path/to/file.md ha"
    echo ""
    echo "项目根目录: $LENS_ROOT"
    exit 1
fi

SOURCE_FILE="$1"
AGENT_NAME="${2:-$AGENT_NAME}"

# 检查源文件是否存在
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ 文件不存在: $SOURCE_FILE${NC}"
    exit 1
fi

# 检查项目根目录
if [ ! -d "$LENS_ROOT" ]; then
    echo -e "${RED}❌ 项目根目录不存在: $LENS_ROOT${NC}"
    echo "请先运行安装脚本"
    exit 1
fi

echo -e "${BLUE}🔍 OpenClaw Lens Sync${NC}"
echo "===================="
echo "  项目根目录: $LENS_ROOT"
echo "  Agent: $AGENT_NAME"
echo ""

# 切换到项目根目录
cd "$LENS_ROOT"

# 创建目标目录
TARGET_DIR="public/agents/$AGENT_NAME"
mkdir -p "$TARGET_DIR"

# 复制文件
FILENAME=$(basename "$SOURCE_FILE")
echo -e "${YELLOW}[1/3] 复制文件到 $TARGET_DIR/$FILENAME...${NC}"
cp "$SOURCE_FILE" "$TARGET_DIR/$FILENAME"

# Git 操作
echo -e "${YELLOW}[2/3] 提交更改...${NC}"
git add "$TARGET_DIR/$FILENAME"
git commit -m "Add $FILENAME to $AGENT_NAME" 2>&1 | grep -v "^Author:\|^Date:\|^$\|^    " || true

echo -e "${YELLOW}[3/3] 推送到 GitHub...${NC}"
git push 2>&1 | grep -v "^To\|^remote:\|^From\|^   " || true

echo ""
echo -e "${GREEN}✅ 同步完成！${NC}"
echo ""
echo -e "${BLUE}预览地址:${NC}"
echo "  https://jaguarliuu.github.io/kira/"
