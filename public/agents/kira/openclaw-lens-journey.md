# OpenClaw Lens：从手动查看到自动化预览

## 起因

做 OpenClaw 的时候有个问题：Agent 生成的文件怎么查看？

最开始的方式很原始。Kira 写完文档，哼将出完报告，我们得 SSH 到服务器上，`cd` 到对应目录，然后用 `cat` 或者 `vim` 看。有时候文件太大，`cat` 一屏显示不完，得配合 `less` 分页。遇到 Markdown 格式的还好，遇到 HTML 或者图片，终端里根本看不了。

这样搞有几个问题：

效率低。每次想看文件都得登录服务器，找到路径，然后敲命令。如果只是偶尔看看也就忍了，但开发阶段一天得看几十次，太繁琐。

移动端没法用。在外面的时候，手机上想看看 Kira 刚写的文档，没招。SSH 客户端在手机上体验很差，而且你不可能要求所有人都会用命令行。

协作困难。如果想让其他人也看看文件内容，要么发给他们，要么给他们开服务器账号。前者增加沟通成本，后者有安全风险。

## 第一次尝试：腾讯云 COS

后来我们试着接入了腾讯云 COS（对象存储）。思路很简单：文件生成后自动上传到云存储，然后生成一个公开访问的 URL，点开就能看。

这个方案确实比手动查看好一些。图片能直接在浏览器里打开，Markdown 文件虽然显示成纯文本，但至少不用登录服务器了。

但用了一段时间后发现新的问题：

成本问题。COS 存储和流量都要钱。虽然不多，但如果是图片或者大文件，成本会随着使用量涨起来。我们这种开发阶段频繁测试的场景，成本不太好控制。

配置复杂。每个 Agent 都要配置 API Key、Bucket 名称、Region 信息。配置错了很难排查，而且密钥管理本身也是个负担。

预览体验差。Markdown 文件在 COS 上就是纯文本，没有格式渲染。HTML 文件直接下载，不会在浏览器里打开。想看渲染效果，还得先下载到本地。

最关键的是，这种方式缺乏整体感。每个文件一个独立的 URL，没有统一的入口，看这个文件点一个链接，看那个文件点另一个链接，很零散。

## 转折点

有了这些经验之后，我们停下来想了想，到底需要什么？

要能自动同步。Agent 生成文件后，不需要人工介入，自动就能出现在预览平台上。

要支持渲染。Markdown 能看到格式，HTML 能看到页面，图片能直接显示。

要移动端友好。手机浏览器打开就能看，不需要安装 App。

要零成本。我们是个人项目，能不花钱就不花钱。

要简单。配置越少越好，最好一键搞定。

顺着这些需求往下想，我们发现有一个现成的方案被忽略了：GitHub Pages。

## 方案成型：OpenClaw Lens

GitHub Pages 我们都很熟悉，免费、稳定、支持自定义域名、CDN 加速。但以前从没想过用它来做文件预览平台。

思路是这样的：

1. 建一个 GitHub 仓库，用 React + Vite 搭一个简单的 Web 应用
2. Agent 生成的文件放在 `public/agents/{agent-name}/` 目录下
3. 通过 GitHub API 获取文件列表
4. 前端根据文件类型选择合适的查看器
5. 推送代码后，GitHub Actions 自动构建并部署到 Pages

这个方案满足了所有需求：

- 零成本：GitHub Pages 完全免费
- 自动同步：写个 Skill，文件变化自动提交推送
- 支持渲染：Markdown 用 react-markdown，HTML 用 iframe，图片直接显示
- 移动端友好：响应式设计，手机浏览器体验很好
- 配置简单：Fork 仓库，运行一个脚本，完事

## 技术实现：遇到的问题

### 问题 1：TailwindCSS v4 的坑

最开始用 TailWindCSS v3，一切正常。后来升级到 v4，发现样式全没了。

原因是 v4 改了 PostCSS 插件的包名。原来用 `tailwindcss`，现在要用 `@tailwindcss/postcss`。而且 CSS 文件的写法也变了：

```css
/* v3 写法 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 写法 */
@import "tailwindcss";
```

改完之后以为好了，结果 Markdown 渲染出来的内容没有任何样式。排查后发现是 Typography 插件的 `prose` 类没生效。

TailwindCSS v4 还没有完全适配 Typography 插件，所以只能手动写 CSS。我们把常用的样式都写了一遍：标题、段落、列表、代码块、表格、引用。写的时候参考了 Tailwind Typography 的样式，但都是原生 CSS，不依赖插件。

### 问题 2：Markdown 表格和代码高亮

第一个版本上线后，Markdown 能渲染了，但表格显示成一堆乱码，代码也没有高亮。

查了资料发现，react-markdown 默认不支持 GitHub 风格的 Markdown（GFM）。GFM 扩展了标准 Markdown，加了表格、任务列表、删除线这些功能。

解决方法是加两个插件：
- `remark-gfm`：支持 GFM 语法
- `rehype-highlight`：代码语法高亮

```javascript
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>
  {content}
</ReactMarkdown>
```

高亮还需要样式。我们用了 highlight.js 的 GitHub Dark 主题，从 CDN 引入：

```html
<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
/>
```

### 问题 3：空状态处理

最开始的版本，如果仓库里还没有文件，API 会返回 404，页面上什么都不显示，控制台一堆报错。

这对第一次使用的用户很不友好。他们刚 Fork 仓库，还没来得及添加文件，打开页面看到的是错误，会以为出了什么问题。

后来我们做了空状态处理：

- Sidebar 里如果没有 Agent，显示 "No agents yet" + 提示如何添加
- FileGrid 里如果没有文件，显示 "No files yet" + 提示使用 preview-sync skill

这样用户一眼就知道是什么状态，下一步该做什么。

### 问题 4：GitHub Actions 权限

部署到 GitHub Pages 的时候，第一次构建失败了，错误信息是权限不足。

GitHub 在 2023 年加强了安全策略，Actions 默认没有写权限。需要在 workflow 文件里显式声明：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

另外，还要用官方的 Pages 部署 action，不能用第三方的 peaceiris/actions-gh-pages（虽然它很流行）：

```yaml
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
```

## 最终实现：功能清单

经过反复调试和优化，OpenClaw Lens 现在具备以下功能：

### 多格式文件预览

Markdown：支持完整的 GFM 语法，包括表格、任务列表、删除线。代码块有语法高亮，支持主流编程语言。

HTML：用 iframe 沙箱渲染，安全隔离，不会影响主页面。

图片：支持 PNG、JPG、GIF、SVG、WebP 等常见格式，自适应显示。

代码：虽然 Markdown 里的代码块有高亮，但独立的代码文件（.js、.py 等）目前还是纯文本。后续可以加 Monaco Editor 支持在线编辑。

### Raw 和 Download

每个文件预览界面右上角有两个按钮：

- Raw：在新标签页打开原始内容，适合查看源码
- Download：下载到本地，自动使用原文件名

### 自动同步

这是最核心的功能。我们写了一个 Skill：`preview-sync`。

用法很简单：

```bash
preview-sync /path/to/file.md kira
```

这个命令会：
1. 把文件复制到 `/opt/openclaw/kira/public/agents/kira/`
2. 自动 git commit 和 git push
3. GitHub Actions 构建部署
4. 1-2 分钟后就能在网页上看到

每个 Agent 在自己的配置文件里配置好 preview-sync skill，以后生成文件后调用这个命令就行，完全自动化。

### 统一的 Agent 视角

页面上有个 Sidebar，显示所有的 Agent。点击 Agent 名称，右侧显示这个 Agent 的所有文件。

目前我们有三个 Agent：
- kira：主 AI 助手，负责技术开发和通用任务
- ha：负责自媒体业务（公众号、小红书）
- hen：负责每日新闻报告

每个 Agent 的文件都在自己的目录下，互不干扰。

## 使用指南

### 快速开始

第一步：Fork 仓库

访问 https://github.com/jaguarliuu/OpenClaw-Lens，点击右上角的 "Use this template" → "Create a new repository"。

给你的仓库起个名字，比如 `my-openclaw-lens`，然后点击 "Create repository"。

第二步：运行安装脚本

在你的服务器或者本地机器上运行：

```bash
curl -fsSL https://raw.githubusercontent.com/jaguarliuu/OpenClaw-Lens/main/install.sh | bash
```

脚本会问你几个问题：
- GitHub 用户名
- 仓库名称
- Agent 名称（比如 kira、ha、hen）

然后它会自动完成所有配置。

第三步：启用 GitHub Pages

进入你的 GitHub 仓库，Settings → Pages，在 "Build and deployment" 下，"Source" 选择 "GitHub Actions"。

等 1-2 分钟，GitHub Actions 构建完成后，访问 `https://你的用户名.github.io/仓库名/` 就能看到预览平台了。

### 同步文件

有两种方式：

方式一：使用 preview-sync skill（推荐）

先在 `~/.openclaw/openclaw.json` 里配置：

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "你的用户名/仓库名",
        "agentName": "你的Agent名称"
      }
    }
  }
}
```

然后就可以用了：

```bash
# 同步单个文件
preview-sync /path/to/file.md kira

# 指定不同的 Agent
preview-sync /path/to/report.md hen
preview-sync /path/to/article.md ha
```

方式二：手动复制

如果不想配置 skill，也可以手动：

```bash
cd /opt/openclaw/kira
cp /path/to/file.md public/agents/kira/
git add .
git commit -m "Add new file"
git push
```

效果一样，就是多了几步操作。

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

`public/agents/` 是核心目录，所有预览的文件都放在这里。每个 Agent 一个子目录，结构很清晰。

### 访问预览

文件同步后，等 1-2 分钟（GitHub Actions 构建时间），然后访问：

```
https://你的用户名.github.io/仓库名/
```

你会看到：
- 左侧是 Agent 列表
- 点击 Agent 名称，右侧显示文件列表
- 点击文件，弹出预览窗口
- 支持 Markdown 渲染、HTML 预览、图片显示

## 对比与总结

我们把这个方案和之前的尝试做个对比：

| 方案 | 成本 | 移动端 | 渲染 | 自动化 | 配置复杂度 |
|-----|------|--------|------|--------|-----------|
| 手动 SSH 查看 | 免费 | 不支持 | 纯文本 | 手动 | 复杂 |
| 腾讯云 COS | 付费 | 支持 | 部分支持 | 自动 | 中等 |
| OpenClaw Lens | 免费 | 支持 | 完整渲染 | 自动 | 简单 |

OpenClaw Lens 在所有维度都表现最好，而且还有一个额外的好处：可视化的整体感。

以前看文件是零散的，每个文件一个链接。现在打开一个页面，所有 Agent 的所有文件一目了然。点击切换，非常流畅。这种体验是云存储方案给不了的。

## 后续想做的事

虽然现在的版本已经够用了，但还有一些想做的事情：

多主题支持。目前是黑白简约风格，后续可以加个主题切换，支持深色模式或者其他配色。

在线编辑。现在只能查看，不能编辑。如果加个 Monaco Editor，就能在浏览器里直接改 Markdown 文件，然后自动提交回去。

搜索功能。文件多了之后，需要全文搜索。可以用 GitHub API 的搜索功能，或者在前端做一个简单的文件名搜索。

版本历史。GitHub 本身就有版本历史，可以在界面上加个按钮，查看文件的修改记录。

权限控制。目前是公开仓库，所有人都能看。如果需要私有仓库，可以换成 GitHub 的私有 Pages，或者自己部署到服务器上。

但这些都是锦上添花的功能，核心的文件预览已经做得很好了。正如我们一开始的目标：简单、好用、零成本。OpenClaw Lens 达成了这个目标。

## 写在最后

回顾整个过程，从手动 SSH 查看到腾讯云 COS，再到现在的 OpenClaw Lens，每一步都是在解决实际问题。

第一次尝试虽然不完美，但让我们看清了需求。第二次尝试虽然功能更强，但成本和复杂度没控制好。第三次才找到了真正合适的方案。

这就是做产品的常态：很少能一次到位，都是在反复尝试中找到最优解。

OpenClaw Lens 现在成了我们每天都会用的工具。Kira 写完文档，preview-sync 同步，刷新页面就能看到渲染效果。这种即时的反馈，让工作流程顺畅了很多。

如果你也有类似的需求，不妨试试 OpenClaw Lens。Fork 仓库，运行脚本，三分钟就能用起来。

---

项目地址：https://github.com/jaguarliuu/OpenClaw-Lens
预览地址：https://jaguarliuu.github.io/kira/
文档：`/opt/openclaw/kira/AGENT-GUIDE.md`

---

*本文档由 Kira 编写，记录了 OpenClaw 文件预览功能的演进过程。*
