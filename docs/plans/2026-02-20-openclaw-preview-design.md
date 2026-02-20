# OpenClaw Preview - 设计文档

**日期：** 2026-02-20
**版本：** v1.0
**作者：** Kira ⚡

---

## 1. 项目概述

### 1.1 产品定位
OpenClaw Preview 是一个基于 React + GitHub Pages 的轻量级内容预览平台，让 OpenClaw 用户能够自动同步和预览 Agent 生成的文档、HTML 和图片。

### 1.2 核心价值
- ✅ **零成本**：基于 GitHub Pages，完全免费
- ✅ **一键安装**：自动化脚本，无需手动配置
- ✅ **自动化同步**：Skill 驱动，无需手动操作
- ✅ **现代化 UI**：黑白配色，简洁大方

---

## 2. 技术架构

### 2.1 技术栈

**前端：**
- React 18 - UI 框架
- Vite - 构建工具
- TailwindCSS - 样式
- React Router - 路由

**数据源：**
- GitHub API - 实时获取文件列表和内容

**Skill：**
- Shell Script - 文件同步脚本

**部署：**
- GitHub Pages - 静态托管
- GitHub Actions - 自动构建

### 2.2 架构图

```
┌─────────────┐
│   Agent     │
│  (Kira/Ha)  │
└──────┬──────┘
       │ 生成文件
       ↓
┌─────────────────┐
│ preview-sync    │
│    Skill        │
└──────┬──────────┘
       │ Git Push
       ↓
┌─────────────────┐
│ GitHub Repo     │
│ (Preview Site)  │
└──────┬──────────┘
       │ GitHub Actions
       ↓
┌─────────────────┐
│ GitHub Pages    │
│ (Static Site)   │
└──────┬──────────┘
       │ HTTPS
       ↓
┌─────────────────┐
│   User Browser  │
│  (React App)    │
└──────┬──────────┘
       │ GitHub API
       ↓
┌─────────────────┐
│  GitHub API     │
│ (File Contents) │
└─────────────────┘
```

---

## 3. 目录结构

```
openclaw-preview/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # 布局组件
│   │   ├── Sidebar.jsx          # Agent 列表侧边栏
│   │   ├── FileGrid.jsx         # 文件网格展示
│   │   ├── PreviewModal.jsx     # 预览模态框
│   │   ├── MarkdownViewer.jsx   # Markdown 渲染
│   │   ├── HtmlViewer.jsx       # HTML 预览
│   │   └── ImageViewer.jsx      # 图片查看
│   ├── pages/
│   │   ├── Home.jsx             # 首页（Agent 列表）
│   │   └── Agent.jsx            # Agent 详情页
│   ├── hooks/
│   │   ├── useGitHubApi.js      # GitHub API 封装
│   │   └── useFiles.js          # 文件管理 Hook
│   ├── utils/
│   │   ├── github.js            # GitHub 工具函数
│   │   ├── fileType.js          # 文件类型判断
│   │   └── markdown.js          # Markdown 解析
│   ├── styles/
│   │   └── index.css            # TailwindCSS 入口
│   ├── App.jsx
│   └── main.jsx
├── public/
│   ├── agents/                  # Agent 输出目录
│   │   ├── kira/
│   │   ├── ha/
│   │   └── hen/
│   └── index.html
├── skill/
│   ├── SKILL.md                 # Skill 文档
│   ├── skill.json               # Skill 配置
│   ├── install.sh               # 一键安装脚本
│   └── preview-sync.sh          # 文件同步脚本
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 4. 核心组件设计

### 4.1 GitHub API 封装

**useGitHubApi.js:**
```javascript
const GITHUB_API = 'https://api.github.com';

export function useGitHubApi(owner, repo) {
  const getAgents = async () => {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/public/agents`
    );
    return response.json();
  };

  const getFiles = async (agentName) => {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/public/agents/${agentName}`
    );
    return response.json();
  };

  const getFileContent = async (agentName, filename) => {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/public/agents/${agentName}/${filename}`,
      { headers: { Accept: 'application/vnd.github.v3.raw' } }
    );
    return response.text();
  };

  return { getAgents, getFiles, getFileContent };
}
```

### 4.2 文件预览组件

**MarkdownViewer.jsx:**
- 使用 `react-markdown` 渲染
- 支持 GitHub 风格 Markdown
- 代码高亮（Prism.js）
- 支持 Mermaid 图表

**HtmlViewer.jsx:**
- 使用 iframe 沙箱渲染
- 支持响应式预览
- 全屏模式

**ImageViewer.jsx:**
- 图片预览
- 缩放功能
- 全屏查看

---

## 5. Skill 设计

### 5.1 一键安装流程

**install.sh 核心逻辑：**
```bash
#!/bin/bash
# 1. 收集信息（用户名、仓库名、Agent 名）
# 2. Clone 模板仓库
# 3. 配置 Git remote
# 4. 自动配置 ~/.openclaw/openclaw.json
# 5. npm install
# 6. Git push
# 7. 启用 GitHub Pages
# 8. 输出访问链接
```

### 5.2 文件同步流程

**preview-sync.sh 核心逻辑：**
```bash
#!/bin/bash
# 1. 从 openclaw.json 读取配置
# 2. Clone 预览仓库到临时目录
# 3. 复制文件到 public/agents/{agent}/{filename}
# 4. Git commit & push
# 5. 输出预览链接
```

### 5.3 Skill 配置

**skill.json:**
```json
{
  "name": "preview-sync",
  "version": "1.0.0",
  "description": "自动同步 Agent 输出到预览仓库",
  "tools": [
    {
      "type": "exec",
      "command": "preview-sync",
      "description": "同步文件到预览仓库"
    }
  ],
  "config": {
    "previewRepo": {
      "description": "预览仓库（格式：owner/repo）",
      "required": true
    },
    "agentName": {
      "description": "Agent 名称",
      "required": true
    }
  }
}
```

---

## 6. 数据流设计

### 6.1 文件同步流程

```
Agent 生成内容
  ↓
用户执行：preview-sync /path/to/file.md
  ↓
Skill 读取 ~/.openclaw/openclaw.json
  ↓
Clone 预览仓库
  ↓
复制文件到 public/agents/{agent}/
  ↓
Git commit & push
  ↓
GitHub Actions 触发构建
  ↓
1-2 分钟后，GitHub Pages 更新
  ↓
用户访问预览链接查看
```

### 6.2 前端加载流程

```
用户访问 https://username.github.io/repo
  ↓
React App 加载
  ↓
调用 GitHub API 获取 agent 列表
  ↓
用户点击 agent → 获取文件列表
  ↓
用户点击文件 → 获取文件内容
  ↓
渲染预览（Markdown/HTML/图片）
```

---

## 7. UI/UX 设计

### 7.1 设计原则
- **黑白配色**：简洁大方
- **衬线字体**：Crimson Pro（标题）+ Inter（正文）
- **极简设计**：注重内容和排版
- **留白空间**：呼吸感，不拥挤

### 7.2 页面结构

**首页（Agent 列表）：**
```
┌─────────────────────────────────────┐
│  OpenClaw Preview                   │
├──────────┬──────────────────────────┤
│          │                          │
│ Agents   │  欢迎使用                │
│  - Kira  │                          │
│  - Ha    │  [Kira] [Ha] [Hen]       │
│  - Hen   │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Agent 详情页：**
```
┌─────────────────────────────────────┐
│  OpenClaw Preview                   │
├──────────┬──────────────────────────┤
│          │  Kira                    │
│ Agents   │  Technical documentation │
│  - Kira  │                          │
│  - Ha    │  [file1.md] [file2.html] │
│  - Hen   │  [file3.md]  [file4.png] │
│          │                          │
└──────────┴──────────────────────────┘
```

**文件预览（模态框）：**
```
┌─────────────────────────────────────┐
│  chapter-01.md     [Raw] [Download] │
├─────────────────────────────────────┤
│                                     │
│  # Chapter 1: The OpenClaw          │
│                                     │
│  In the evolving landscape...       │
│                                     │
└─────────────────────────────────────┘
```

---

## 8. 性能优化

### 8.1 加载优化
- 使用 React.lazy 懒加载组件
- 图片懒加载
- 代码分割

### 8.2 API 优化
- GitHub API 响应缓存
- 请求合并
- 错误重试

---

## 9. 安全考虑

### 9.1 内容安全
- HTML iframe 沙箱
- XSS 防护
- CSP 策略

### 9.2 API 限流
- GitHub API 限流处理
- 优雅降级
- 错误提示

---

## 10. 部署流程

### 10.1 GitHub Actions

**deploy.yml:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 11. 测试策略

### 11.1 单元测试
- 组件测试（React Testing Library）
- Hook 测试
- 工具函数测试

### 11.2 集成测试
- GitHub API 调用测试
- 文件同步流程测试

---

## 12. 后续优化

### V1.5 功能
- 暗黑模式
- 搜索功能
- 文件对比
- 评论系统

### V2.0 功能
- 实时协作
- 版本对比
- 自定义主题

---

**下一步：使用 writing-plans skill 创建详细实施计划**
