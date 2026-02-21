# OpenClaw Lens：文件预览平台的技术演进

## 背景

OpenClaw 系统中，Agent 生成的文件需要一个便捷的查看方式。最初采用的方式是通过 SSH 登录服务器，使用命令行工具查看文件内容。这种方式存在以下限制：

**效率考量。** 每次查看文件都需要登录服务器、定位目录、执行命令。开发调试阶段频繁查看文件时，操作流程较为繁琐。

**移动端访问。** 手机等移动设备上使用 SSH 客户端体验有限，且不适合所有用户场景。

**协作场景。** 与他人分享文件内容时，要么传输文件副本，要么提供服务器访问权限，两者各有不便之处。

## 第一阶段：腾讯云 COS 方案

为解决上述问题，我们尝试了腾讯云 COS（对象存储）方案：文件生成后自动上传到云存储，生成公开访问的 URL。

### ClawHub TencentCOS Skill 的适配工作

起初采用 ClawHub 提供的 TencentCOS Skill，但在实际使用中遇到了一些需要处理的情况：

**文档与代码的同步维护**

Skill 文档与实际代码存在不一致。配置项名称（如 `cos_bucket` 与 `bucket_name`）、环境变量名（如 `COS_SECRET_ID` 与 `TENCENT_COS_SECRET_ID`）存在差异。这提示我们在使用第三方组件时，需要同时关注文档和源码。

**依赖版本兼容性**

TencentCOS Skill 依赖腾讯云 Python SDK 的特定版本（`1.9.0`），而环境中其他工具使用更新的版本（`1.9.25`）。SDK 在 `1.9.15` 版本重构了 `CosConfig` 初始化接口，导致版本间存在兼容性差异。这个情况说明依赖版本管理需要在项目初期就做好规划。

**错误信息的可读性**

上传失败时的错误码（如 `-3`）需要查阅 SDK 源码才能理解具体含义。在设计系统时，错误信息的清晰度直接影响排查效率。

**权限配置要点**

COS Bucket 默认为私有读写策略，需要手动调整为公开读才能通过 URL 直接访问。这类配置项在使用文档中应当明确说明。

**MCP 协议的考量**

TencentCOS Skill 基于 MCP（Model Context Protocol）实现，引入了一层抽象。在调试时需要区分是 Skill 逻辑、协议层还是调用方的问题。对于调试工具链的完善程度，需要在技术选型时予以考虑。

**维护响应周期**

在 ClawHub 提交 issue 后，响应周期较长。对于依赖社区维护的组件，需要评估其对生产环境的影响。

### 自研 COS 上传工具

基于上述经验，我们开发了一个独立的 COS 上传工具，直接使用腾讯云官方 Python SDK：

```python
#!/usr/bin/env python3
"""腾讯云 COS CLI 工具"""

from qcloud_cos import CosConfig, CosS3Client

def upload(file_path, bucket, region):
    """上传文件到 COS"""
    config = CosConfig(
        SecretId=secret_id,
        SecretKey=secret_key,
        Region=region
    )
    client = CosS3Client(config)

    with open(file_path, 'rb') as f:
        client.put_object(
            Bucket=bucket,
            Key=file_name,
            Body=f
        )

    # 生成访问 URL
    url = f"https://{bucket}.cos.{region}.myqcloud.com/{file_name}"
    return url
```

工具特点：
- 错误信息完整展示
- 支持断点续传
- 上传进度可视化
- 自动生成访问 URL
- 从 OpenClaw 配置文件读取凭证

```bash
# 使用示例
cos-cli upload /path/to/file.md
cos-cli download file.md --output /tmp/
cos-cli list
cos-cli delete file.md
cos-cli url file.md
```

### COS 方案的局限性

尽管工具已完善，COS 方案本身仍有一些考量点：

**成本因素。** 存储和流量按使用量计费，开发测试阶段频繁使用时成本难以精确控制。

**预览体验。** Markdown 文件以纯文本形式展示，HTML 文件触发下载而非浏览器渲染，缺乏统一的文件管理入口。

## 需求梳理

基于前期经验，我们明确了以下核心需求：

- **自动同步：** Agent 生成文件后无需人工干预即可更新到预览平台
- **格式渲染：** Markdown 显示格式，HTML 渲染页面，图片直接展示
- **移动端适配：** 手机浏览器可正常访问
- **零成本：** 适合个人项目的成本结构

## 设计思路：为什么选择 GitHub Pages

结合上述需求，GitHub Pages 成为一个理想选择：免费、稳定、支持自定义域名、自带 CDN。

### 架构设计

整体架构如下：

1. 创建 GitHub 仓库，使用 React + Vite 构建 Web 应用
2. Agent 生成的文件存放于 `public/agents/{agent-name}/` 目录
3. 通过 GitHub API 获取文件列表
4. 前端根据文件类型选择对应的渲染器
5. 推送代码后，GitHub Actions 自动构建并部署到 Pages

方案优势：
- 零成本：GitHub Pages 完全免费
- 自动同步：通过 Skill 实现文件变更的自动提交推送
- 支持渲染：Markdown 用 react-markdown，HTML 用 iframe，图片直接显示
- 移动端友好：响应式设计
- 配置简单：Fork 仓库后运行脚本即可

### 技术栈选型

**前端框架：React 18 + Vite**

React 生态成熟，组件库丰富。Vite 构建速度快，开发体验好，HMR 响应迅速。

**样式方案：TailwindCSS v4**

原子化 CSS 开发效率高，v4 版本性能进一步优化。

**Markdown 渲染：react-markdown + remark-gfm + rehype-highlight**

react-markdown 是成熟方案，remark-gfm 支持 GitHub 风格 Markdown（表格、任务列表等），rehype-highlight 提供代码语法高亮。

**部署方案：GitHub Pages + GitHub Actions**

官方方案，免费稳定，push 触发自动构建部署。

## 实现细节

### 样式系统：TailwindCSS v4 的适配

项目从 TailwindCSS v3 升级到 v4，需要处理以下变更：

**PostCSS 配置变更**

v4 调整了 PostCSS 插件的包名和配置方式：

```css
/* v3 写法 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 写法 */
@import "tailwindcss";
```

**Typography 插件的兼容性处理**

TailwindCSS v4 尚未完全适配官方 Typography 插件，`prose` 类需要自定义实现。我们编写了完整的 Typography 样式：

```css
/* 标题 */
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

/* 代码块 */
.markdown-body pre {
  background-color: #1f2937;
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

/* 表格 */
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
}
```

样式设计参考了 Tailwind Typography，使用原生 CSS 实现，不依赖插件。

### Markdown 渲染增强

react-markdown 默认支持标准 Markdown，扩展语法需要插件支持。

**表格支持（remark-gfm）**

GitHub 风格 Markdown 支持表格、任务列表、删除线等扩展语法：

```javascript
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {content}
</ReactMarkdown>
```

**代码高亮（rehype-highlight）**

```javascript
import rehypeHighlight from 'rehype-highlight'

<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
  {content}
</ReactMarkdown>
```

highlight.js 主题通过 CDN 引入：

```html
<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
/>
```

### 用户体验：空状态处理

首次 Fork 仓库时，尚未添加文件，界面应提供清晰引导。

**Sidebar 空状态**

```jsx
{agents.length === 0 ? (
  <div className="text-sm text-gray-400 py-8 text-center">
    <p className="mb-2">No agents yet</p>
    <p className="text-xs">Add files to<br/>public/agents/{'{agent-name}'}/</p>
  </div>
) : (
  // Agent 列表
)}
```

**FileGrid 空状态**

```jsx
{!files || files.length === 0 ? (
  <div className="text-center py-16">
    <p className="text-gray-400 mb-2">No files yet</p>
    <p className="text-xs text-gray-400">
      Add files using preview-sync skill
    </p>
  </div>
) : (
  // 文件网格
)}
```

### 自动部署：GitHub Actions 配置

每次 push 到 main 分支，自动构建并部署到 Pages。

**权限配置**

GitHub 在 2023 年调整了安全策略，Actions 默认无写权限，需要在 workflow 中显式声明：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**使用官方 Actions**

采用官方 `actions/deploy-pages@v4`：

```yaml
jobs:
  deploy:
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**完整 workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### 自动同步：preview-sync Skill

这是整个方案的核心组件，用户无需手动执行 git 操作，一条命令即可完成同步。

**Skill 设计**

Skill 是一个 shell 脚本，执行三个步骤：
1. 复制文件到项目目录
2. git commit
3. git push

**配置方式**

配置位于 `~/.openclaw/openclaw.json`：

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "username/repo-name",
        "agentName": "kira"
      }
    }
  }
}
```

**使用方式**

```bash
preview-sync /path/to/file.md kira
```

命令执行后，1-2 分钟内即可在网页上看到更新。

## 最终实现：功能清单

OpenClaw Lens 当前具备以下功能：

### 多格式文件预览

**Markdown：** 支持完整 GFM 语法，包括表格、任务列表、删除线。代码块具备语法高亮，支持主流编程语言。

**HTML：** 使用 iframe 沙箱渲染，实现安全隔离。

**图片：** 支持 PNG、JPG、GIF、SVG、WebP 等常见格式，自适应显示。

**代码：** 独立的代码文件（.js、.py 等）目前以纯文本形式展示，后续可扩展 Monaco Editor 支持在线编辑。

### Raw 和 Download

每个文件预览界面右上角提供两个操作：
- **Raw：** 在新标签页打开原始内容
- **Download：** 下载到本地，保留原文件名

### 自动同步

`preview-sync` Skill 的使用：

```bash
preview-sync /path/to/file.md kira
```

执行流程：
1. 文件复制到 `/opt/openclaw/kira/public/agents/kira/`
2. 自动 git commit 和 git push
3. GitHub Actions 构建部署
4. 1-2 分钟后网页更新

每个 Agent 在配置文件中设置 preview-sync skill，生成文件后调用即可完成自动化同步。

### 统一的 Agent 视角

页面左侧 Sidebar 显示所有 Agent，点击 Agent 名称后右侧展示其文件列表。

当前配置的 Agent：
- **kira：** 主 AI 助手，负责技术开发和通用任务
- **ha：** 负责自媒体业务（公众号、小红书）
- **hen：** 负责每日新闻报告

每个 Agent 的文件存放在独立目录下，结构清晰。

## 使用指南

### 快速开始

**第一步：Fork 仓库**

访问 https://github.com/jaguarliuu/OpenClaw-Lens，点击 "Use this template" → "Create a new repository"。

**第二步：运行安装脚本**

```bash
curl -fsSL https://raw.githubusercontent.com/jaguarliuu/OpenClaw-Lens/main/install.sh | bash
```

脚本会引导完成配置：GitHub 用户名、仓库名称、Agent 名称。

**第三步：启用 GitHub Pages**

进入 GitHub 仓库，Settings → Pages，"Build and deployment" 的 "Source" 选择 "GitHub Actions"。

等待 GitHub Actions 构建完成（约 1-2 分钟），访问 `https://用户名.github.io/仓库名/` 即可。

### 同步文件

**方式一：使用 preview-sync skill（推荐）**

配置 `~/.openclaw/openclaw.json`：

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "用户名/仓库名",
        "agentName": "Agent名称"
      }
    }
  }
}
```

使用命令：

```bash
preview-sync /path/to/file.md kira
preview-sync /path/to/report.md hen
preview-sync /path/to/article.md ha
```

**方式二：手动操作**

```bash
cd /opt/openclaw/kira
cp /path/to/file.md public/agents/kira/
git add .
git commit -m "Add new file"
git push
```

### 项目结构

```
/opt/openclaw/kira/
├── public/
│   └── agents/
│       ├── kira/     # Kira 的文件
│       ├── ha/       # Ha 的文件
│       └── hen/      # Hen 的文件
├── src/              # React 源码
├── skill/            # preview-sync skill
└── docs/             # 文档
```

### 访问预览

文件同步后等待 1-2 分钟，访问 `https://用户名.github.io/仓库名/`，界面功能：
- 左侧 Agent 列表
- 点击 Agent 显示文件列表
- 点击文件弹出预览窗口
- 支持 Markdown 渲染、HTML 预览、图片显示

## 方案对比

| 方案 | 成本 | 移动端 | 渲染 | 自动化 | 配置复杂度 |
|-----|------|--------|------|--------|-----------|
| 手动 SSH 查看 | 免费 | 不支持 | 纯文本 | 手动 | 复杂 |
| 腾讯云 COS | 付费 | 支持 | 部分支持 | 自动 | 中等 |
| OpenClaw Lens | 免费 | 支持 | 完整渲染 | 自动 | 简单 |

OpenClaw Lens 在各维度表现均衡，同时提供了统一的可视化管理界面，便于查看所有 Agent 的文件。

## 后续规划

**多主题支持。** 当前为黑白简约风格，后续可增加主题切换功能。

**在线编辑。** 集成 Monaco Editor，支持浏览器内直接编辑 Markdown 并自动提交。

**搜索功能。** 文件增多后需要搜索能力，可基于 GitHub API 或前端实现文件名搜索。

**版本历史。** 在界面中集成文件修改记录查看功能。

**权限控制。** 如需私有仓库支持，可切换至 GitHub 私有 Pages 或自托管部署。

## 小结

OpenClaw Lens 的开发过程是一个逐步优化的迭代：

- 第一阶段明确了核心需求
- 第二阶段验证了云存储方案的可行性，同时发现了成本和体验方面的考量
- 第三阶段确定了 GitHub Pages 方案，实现了零成本、自动同步、完整渲染的目标

OpenClaw Lens 已成为日常工作流程的一部分：文件生成后自动同步，刷新即可查看渲染效果，反馈循环紧凑高效。

---

**项目地址：** https://github.com/jaguarliuu/OpenClaw-Lens
**预览地址：** https://jaguarliuu.github.io/kira/
**文档：** `/opt/openclaw/kira/AGENT-GUIDE.md`

---

*本文档记录了 OpenClaw 文件预览功能的技术演进过程。*
