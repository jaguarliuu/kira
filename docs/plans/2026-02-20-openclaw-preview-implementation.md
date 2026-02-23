# OpenClaw Preview 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个基于 React + GitHub Pages 的内容预览平台，支持 Agent 输出文件的自动同步和预览。

**Architecture:** React SPA 调用 GitHub API 获取文件列表和内容，使用 Skill 自动同步文件到预览仓库，GitHub Pages 自动构建部署。

**Tech Stack:** React 18, Vite, TailwindCSS, GitHub API, Shell Script

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `index.html`

**Step 1: 初始化 npm 项目**

```bash
cd /root/.openclaw/workspace/openclaw-preview
npm init -y
```

**Step 2: 安装依赖**

```bash
npm install react react-dom react-router-dom react-markdown
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

**Step 3: 配置 Vite**

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './'
})
```

**Step 4: 配置 TailwindCSS**

Run: `npx tailwindcss init -p`

Modify `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

Modify `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `src/styles/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;500;600&display=swap');
```

**Step 5: 更新 package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js
git commit -m "chore: 初始化项目配置"
```

---

## Task 2: 创建基础布局

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/components/Layout.jsx`
- Create: `src/components/Sidebar.jsx`

**Step 1: 创建 main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 2: 创建 App.jsx**

```jsx
import React from 'react'
import Layout from './components/Layout'

export default function App() {
  return <Layout />
}
```

**Step 3: 创建 Layout.jsx**

```jsx
import React from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="font-serif text-xl font-semibold tracking-tight">
          OpenClaw <span className="font-normal text-gray-400">Preview</span>
        </div>
        <nav className="flex gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-black">Agents</a>
          <a href="#" className="hover:text-black">Files</a>
          <a href="#" className="hover:text-black">Settings</a>
        </nav>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-16 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 4: 创建 Sidebar.jsx**

```jsx
import React from 'react'

const AGENTS = [
  { id: 'kira', name: 'Kira', count: 24 },
  { id: 'ha', name: 'Ha', count: 12 },
  { id: 'hen', name: 'Hen', count: 8 }
]

export default function Sidebar({ activeAgent, onSelectAgent }) {
  return (
    <aside className="w-60 border-r border-gray-200 p-8">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-4">
        Agents
      </div>
      <div className="space-y-1">
        {AGENTS.map(agent => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={`px-4 py-2 rounded cursor-pointer transition-colors ${
              activeAgent === agent.id
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="font-medium text-sm">{agent.name}</div>
            <div className={`text-xs ${
              activeAgent === agent.id ? 'text-gray-300' : 'text-gray-400'
            }`}>
              {agent.count} files
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
```

**Step 5: 测试运行**

Run: `npm run dev`
Expected: 页面正常显示，侧边栏有 agent 列表

**Step 6: Commit**

```bash
git add src/
git commit -m "feat: 创建基础布局组件"
```

---

## Task 3: 创建 GitHub API Hook

**Files:**
- Create: `src/hooks/useGitHubApi.js`
- Create: `src/utils/github.js`

**Step 1: 创建 github.js 工具函数**

```javascript
const GITHUB_API = 'https://api.github.com'

export async function fetchFromGitHub(path) {
  const response = await fetch(`${GITHUB_API}${path}`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

export async function fetchFileContent(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: 'application/vnd.github.v3.raw' }
  })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.text()
}
```

**Step 2: 创建 useGitHubApi Hook**

```javascript
import { useState, useEffect } from 'react'
import { fetchFromGitHub, fetchFileContent } from '../utils/github'

export function useGitHubApi(owner, repo) {
  const [agents, setAgents] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAgents = async () => {
    setLoading(true)
    try {
      const data = await fetchFromGitHub(
        `/repos/${owner}/${repo}/contents/public/agents`
      )
      setAgents(data.filter(item => item.type === 'dir'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getFiles = async (agentName) => {
    setLoading(true)
    try {
      const data = await fetchFromGitHub(
        `/repos/${owner}/${repo}/contents/public/agents/${agentName}`
      )
      setFiles(data.filter(item => item.type === 'file'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getFileContent = async (agentName, filename) => {
    return await fetchFileContent(
      `/repos/${owner}/${repo}/contents/public/agents/${agentName}/${filename}`
    )
  }

  return {
    agents,
    files,
    loading,
    error,
    getAgents,
    getFiles,
    getFileContent
  }
}
```

**Step 3: Commit**

```bash
git add src/hooks/ src/utils/
git commit -m "feat: 添加 GitHub API Hook"
```

---

## Task 4: 创建文件类型判断工具

**Files:**
- Create: `src/utils/fileType.js`

**Step 1: 创建 fileType.js**

```javascript
export function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()

  if (['md', 'markdown'].includes(ext)) return 'markdown'
  if (['html', 'htm'].includes(ext)) return 'html'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  if (['json', 'js', 'jsx', 'ts', 'tsx', 'py', 'java'].includes(ext)) return 'code'
  return 'text'
}

export function getFileIcon(type) {
  switch (type) {
    case 'markdown': return 'M'
    case 'html': return 'H'
    case 'image': return 'I'
    case 'code': return 'C'
    default: return 'T'
  }
}
```

**Step 2: Commit**

```bash
git add src/utils/fileType.js
git commit -m "feat: 添加文件类型判断工具"
```

---

## Task 5: 创建文件网格组件

**Files:**
- Create: `src/components/FileGrid.jsx`

**Step 1: 创建 FileGrid.jsx**

```jsx
import React from 'react'
import { getFileType } from '../utils/fileType'

export default function FileGrid({ files, onFileClick }) {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        No files found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6">
      {files.map(file => (
        <div
          key={file.name}
          onClick={() => onFileClick(file)}
          className="p-6 border border-gray-200 cursor-pointer hover:border-black transition-colors"
        >
          <div className="font-mono text-sm mb-2 font-medium">
            {file.name}
          </div>
          <div className="text-xs text-gray-400">
            {formatSize(file.size)} · {formatTime(file.updatedAt || file.git_url)}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(timestamp) {
  // TODO: 实现时间格式化
  return 'recently'
}
```

**Step 2: Commit**

```bash
git add src/components/FileGrid.jsx
git commit -m "feat: 创建文件网格组件"
```

---

## Task 6: 创建预览模态框

**Files:**
- Create: `src/components/PreviewModal.jsx`
- Create: `src/components/MarkdownViewer.jsx`
- Create: `src/components/HtmlViewer.jsx`
- Create: `src/components/ImageViewer.jsx`

**Step 1: 创建 MarkdownViewer.jsx**

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownViewer({ content }) {
  return (
    <div className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
```

**Step 2: 创建 HtmlViewer.jsx**

```jsx
import React from 'react'

export default function HtmlViewer({ content }) {
  return (
    <div className="p-8">
      <iframe
        srcDoc={content}
        className="w-full h-[500px] border border-gray-200"
        sandbox="allow-same-origin"
      />
    </div>
  )
}
```

**Step 3: 创建 ImageViewer.jsx**

```jsx
import React from 'react'

export default function ImageViewer({ url }) {
  return (
    <div className="p-8 text-center">
      <img src={url} alt="Preview" className="max-w-full h-auto mx-auto" />
    </div>
  )
}
```

**Step 4: 创建 PreviewModal.jsx**

```jsx
import React from 'react'
import { getFileType } from '../utils/fileType'
import MarkdownViewer from './MarkdownViewer'
import HtmlViewer from './HtmlViewer'
import ImageViewer from './ImageViewer'

export default function PreviewModal({ file, content, onClose }) {
  if (!file) return null

  const fileType = getFileType(file.name)

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 p-8 overflow-y-auto flex justify-center items-start"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
          <div className="font-mono text-sm font-semibold">{file.name}</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-200 hover:border-black transition-colors">
              Raw
            </button>
            <button className="px-4 py-2 text-sm border border-gray-200 hover:border-black transition-colors">
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-black text-white border border-black hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div id="preview-content">
          {fileType === 'markdown' && <MarkdownViewer content={content} />}
          {fileType === 'html' && <HtmlViewer content={content} />}
          {fileType === 'image' && <ImageViewer url={file.download_url} />}
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: 创建预览模态框和查看器组件"
```

---

## Task 7: 创建首页

**Files:**
- Create: `src/pages/Home.jsx`

**Step 1: 创建 Home.jsx**

```jsx
import React, { useState, useEffect } from 'react'
import { useGitHubApi } from '../hooks/useGitHubApi'
import Sidebar from '../components/Sidebar'
import FileGrid from '../components/FileGrid'
import PreviewModal from '../components/PreviewModal'

const GITHUB_OWNER = 'jaguarliu'
const GITHUB_REPO = 'openclaw-preview'

export default function Home() {
  const [activeAgent, setActiveAgent] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')

  const { agents, files, loading, error, getAgents, getFiles, getFileContent } =
    useGitHubApi(GITHUB_OWNER, GITHUB_REPO)

  useEffect(() => {
    getAgents()
  }, [])

  useEffect(() => {
    if (activeAgent) {
      getFiles(activeAgent)
    }
  }, [activeAgent])

  const handleFileClick = async (file) => {
    setSelectedFile(file)
    if (getFileType(file.name) !== 'image') {
      const content = await getFileContent(activeAgent, file.name)
      setFileContent(content)
    }
  }

  return (
    <>
      <Sidebar activeAgent={activeAgent} onSelectAgent={setActiveAgent} />

      <div className="flex-1 p-16 max-w-4xl">
        <div className="mb-16">
          <h1 className="font-serif text-4xl font-semibold tracking-tight mb-2">
            {activeAgent ? activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1) : 'Welcome'}
          </h1>
          <p className="text-gray-600">
            {activeAgent ? 'Technical documentation and files' : 'Select an agent to view their files'}
          </p>
        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-600">Error: {error}</div>}

        {activeAgent && (
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">
              Files
            </div>
            <FileGrid files={files} onFileClick={handleFileClick} />
          </div>
        )}
      </div>

      <PreviewModal
        file={selectedFile}
        content={fileContent}
        onClose={() => {
          setSelectedFile(null)
          setFileContent('')
        }}
      />
    </>
  )
}

function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (['md', 'markdown'].includes(ext)) return 'markdown'
  if (['html', 'htm'].includes(ext)) return 'html'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  return 'text'
}
```

**Step 2: 更新 App.jsx**

```jsx
import React from 'react'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="font-serif text-xl font-semibold tracking-tight">
          OpenClaw <span className="font-normal text-gray-400">Preview</span>
        </div>
        <nav className="flex gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-black">Agents</a>
          <a href="#" className="hover:text-black">Files</a>
          <a href="#" className="hover:text-black">Settings</a>
        </nav>
      </header>
      <div className="flex">
        <Home />
      </div>
    </div>
  )
}
```

**Step 3: 测试**

Run: `npm run dev`
Expected: 页面显示 agent 列表，点击 agent 显示文件，点击文件显示预览

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: 创建首页并集成所有组件"
```

---

## Task 8: 创建 Skill 文件

**Files:**
- Create: `skill/SKILL.md`
- Create: `skill/skill.json`
- Create: `skill/install.sh`
- Create: `skill/preview-sync.sh`

**Step 1: 创建 SKILL.md**

（内容参考之前讨论的 skill 设计，包含完整的使用说明）

**Step 2: 创建 skill.json**

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

**Step 3: 创建 install.sh**

（内容参考之前设计的安装脚本）

**Step 4: 创建 preview-sync.sh**

（内容参考之前设计的同步脚本）

**Step 5: Commit**

```bash
git add skill/
git commit -m "feat: 创建 preview-sync skill"
```

---

## Task 9: 配置 GitHub Actions

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: 创建 deploy.yml**

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

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Step 2: Commit**

```bash
git add .github/
git commit -m "feat: 添加 GitHub Actions 部署配置"
```

---

## Task 10: 创建 README

**Files:**
- Create: `README.md`

**Step 1: 创建 README.md**

```markdown
# OpenClaw Preview

Agent 输出文件预览平台

## 快速开始

### 1. 一键安装

\`\`\`bash
npx create-openclaw-preview
\`\`\`

### 2. 使用 Skill

\`\`\`bash
preview-sync /path/to/file.md
\`\`\`

## 文档

- [设计文档](docs/plans/2026-02-20-openclaw-preview-design.md)
- [Skill 文档](skill/SKILL.md)

## 许可证

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: 添加 README"
```

---

## Task 11: 初始化 Git 仓库

**Step 1: 初始化 Git**

```bash
git init
git add .
git commit -m "Initial commit: OpenClaw Preview"
```

**Step 2: 推送到 GitHub**

```bash
git remote add origin https://github.com/jaguarliu/openclaw-preview.git
git push -u origin main
```

**Step 3: 启用 GitHub Pages**

在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支。

---

**Plan complete and saved to `docs/plans/2026-02-20-openclaw-preview-implementation.md`**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
