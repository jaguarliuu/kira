---
name: preview-sync
description: Automatically sync files to GitHub repository for preview on GitHub Pages. Use when Agent generates files (markdown, HTML, images) that need to be previewed on a web interface. Triggers on requests like "sync this file to preview", "update preview", "upload to preview site", or when Agent completes writing documents/reports/articles that should be accessible via web.
---

# Preview Sync Skill

Sync local files to GitHub repository for automatic preview deployment on GitHub Pages.

## Quick Start

```bash
preview-sync /path/to/file.md [agent-name]
```

**Example:**
```bash
preview-sync /tmp/report.md kira
```

This will:
1. Copy file to project directory
2. Commit and push to GitHub
3. Trigger GitHub Actions deployment
4. File appears at preview site in 1-2 minutes

## Configuration

Skill reads configuration from `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "username/repo-name",
        "agentName": "default-agent-name"
      }
    }
  }
}
```

**Fields:**
- `previewRepo`: GitHub repository (format: username/repo)
- `agentName`: Default agent name (can be overridden via command line)

## Project Structure

Files are organized by agent:

```
project-root/public/agents/
├── kira/     # Kira's files
├── ha/       # Ha's files
└── hen/      # Hen's files
```

**Adding a new agent:**
```bash
mkdir project-root/public/agents/new-agent
preview-sync /path/to/file.md new-agent
```

No code changes needed.

## Supported File Types

- **Markdown (.md)**: Rendered with GFM syntax, code highlighting
- **HTML (.html)**: Rendered in iframe sandbox
- **Images (.png, .jpg, .gif, .svg, .webp)**: Direct display
- **Code files (.js, .py, .java)**: Plain text display

## Workflow

1. Agent generates a file (document, report, article)
2. Call `preview-sync` with file path and agent name
3. Script copies file to project directory
4. Git commit and push to GitHub
5. GitHub Actions builds and deploys
6. File accessible on preview site in 1-2 minutes

## Script Location

The main script is at `scripts/preview-sync.sh`.

For installation, see `install.sh`.

For script details, see `scripts/preview-sync.sh`.
