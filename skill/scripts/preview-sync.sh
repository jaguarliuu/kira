#!/bin/bash

# OpenClaw Lens - File Sync Script
# Usage: preview-sync <source-file> [agent-name]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fixed project root directory
LENS_ROOT="/opt/openclaw/kira"

# Read configuration from openclaw.json
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
    echo -e "${RED}❌ OpenClaw config not found${NC}"
    exit 1
fi

# Read agent name from config
AGENT_NAME=$(jq -r '.skills.entries["preview-sync"].agentName // "default"' "$OPENCLAW_CONFIG" 2>/dev/null)

# Check parameters
if [ $# -eq 0 ]; then
    echo "Usage: preview-sync <source-file> [agent-name]"
    echo ""
    echo "Examples:"
    echo "  preview-sync /path/to/file.md"
    echo "  preview-sync /path/to/file.md ha"
    echo ""
    echo "Project root: $LENS_ROOT"
    exit 1
fi

SOURCE_FILE="$1"
AGENT_NAME="${2:-$AGENT_NAME}"

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ File not found: $SOURCE_FILE${NC}"
    exit 1
fi

# Check if project root exists
if [ ! -d "$LENS_ROOT" ]; then
    echo -e "${RED}❌ Project root not found: $LENS_ROOT${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 OpenClaw Lens Sync${NC}"
echo "===================="
echo "  Project root: $LENS_ROOT"
echo "  Agent: $AGENT_NAME"
echo ""

# Switch to project root
cd "$LENS_ROOT"

# Create target directory
TARGET_DIR="public/agents/$AGENT_NAME"
mkdir -p "$TARGET_DIR"

# Copy file
FILENAME=$(basename "$SOURCE_FILE")
echo -e "${YELLOW}[1/3] Copying file to $TARGET_DIR/$FILENAME...${NC}"
cp "$SOURCE_FILE" "$TARGET_DIR/$FILENAME"

# Git operations
echo -e "${YELLOW}[2/3] Committing changes...${NC}"
git add "$TARGET_DIR/$FILENAME"
git commit -m "Add $FILENAME to $AGENT_NAME" 2>&1 | grep -v "^Author:\|^Date:\|^$\|^    " || true

echo -e "${YELLOW}[3/3] Pushing to GitHub...${NC}"
git push 2>&1 | grep -v "^To\|^remote:\|^From\|^   " || true

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo -e "${BLUE}Preview URL:${NC}"
echo "  https://jaguarliuu.github.io/kira/"
