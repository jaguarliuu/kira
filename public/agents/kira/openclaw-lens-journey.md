# OpenClaw Lens：从手动查看到自动化预览的演进

## 背景

做 OpenClaw 的时候有个问题：Agent 生成的文件怎么查看？

最开始的方式很原始。Kira 写完文档，哼将出完报告，我们得 SSH 到服务器上，`cd` 到对应目录，然后用 `cat` 或者 `vim` 看。有时候文件太大，`cat` 一屏显示不完，得配合 `less` 分页。遇到 Markdown 格式的还好，遇到 HTML 或者图片，终端里根本看不了。

这样做有几个问题。

效率低。每次看文件都得登录服务器，找路径，敲命令。开发的时候一天要看几十次，太折腾。

移动端完全没法用。在外面想用手机看看 Kira 刚写的文档？没戏。SSH 客户端在手机上体验很差，而且你不可能要求每个人都会用命令行。

协作也不方便。想让别人也看看文件内容，要么发给他们，要么给他们开服务器账号。发文件麻烦，开账号有安全风险。

## 第一次尝试：腾讯云 COS

后来我们试着接入了腾讯云 COS（对象存储）。思路很简单：文件生成后自动上传到云存储，然后生成一个公开访问的 URL，点开就能看。

这个方案确实比手动查看强一些。图片能直接在浏览器里打开，Markdown 文件虽然显示成纯文本，但至少不用登录服务器了。

### ClawHub TencentCOS Skill 的问题

一开始用的是 ClawHub 上的 TencentCOS Skill。这是社区贡献的，文档看着挺完整，感觉应该能用。跑起来才知道，坑多得很。

**问题 1：安装步骤不完整**

文档说用 `npx skills add ShawnMinh/tencent-cos-skill` 安装，结果报错说仓库不存在。

后来才发现得手动从 ClawHub 下载 zip 包，解压放到指定目录。这些步骤文档里一个字都没提。

**问题 2：MCP 配置缺失**

TencentCOS Skill 是基于 MCP（Model Context Protocol）实现的。按文档配好环境变量，MCP 工具还是没加载。

排查半天才发现，需要在某个地方配置 MCP 服务器的启动命令。文档里完全没提这事。

**问题 3：依赖包版本冲突**

Skill 依赖腾讯云的 Python SDK，版本要求比较老。我们环境里其他工具依赖新版本，装上就冲突了。

要么升级这个，要么降级那个，要么 fork 代码自己改。折腾一圈也没搞定。

**问题 4：错误提示看不懂**

上传失败的时候，报错信息就是一串错误码：

```
ErrorCode: -3
ErrorMessage: Request failed
```

这个错误码在腾讯云官方文档里查不到，Skill 文档里也没提。是权限问题？网络问题？还是文件太大？完全不知道。

**问题 5：调试困难**

MCP 多了一层抽象，排查问题更难了。Skill 报错，你不知道是 Skill 本身的问题，还是 MCP 协议的问题，还是 Agent 调用的问题。

而且 MCP Skill 的调试工具很少。出了问题，除了看日志，没别的办法。

**最终放弃**

配置太复杂，文档不完整，调试又难。最后实在受不了，决定自己写。

### 自研 COS 上传工具

自己写了个 Python CLI 工具，用腾讯云官方 SDK。代码不复杂，核心功能就这些：

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

整个工具就 300 行代码，但把问题都解决了：

- 错误信息清晰，上传失败能直接看到原因
- 支持断点续传，大文件不会传到一半挂掉
- 有进度条，知道传到哪了
- 自动生成访问 URL
- 从 OpenClaw 配置文件读密钥，不用到处配

工具写好放 `/usr/local/bin/cos-cli`，用起来挺方便：

```bash
# 上传文件
cos-cli upload /path/to/file.md

# 下载文件
cos-cli download file.md --output /tmp/

# 列出文件
cos-cli list

# 删除文件
cos-cli delete file.md

# 生成访问 URL
cos-cli url file.md
```

### COS 方案还是有些问题

工具好用，但 COS 方案本身的硬伤还在。

**成本问题。** COS 存储和流量都要钱。虽然不多，但图片或者大文件用多了成本就上去了。我们开发阶段频繁测试，成本不太好控制。

**预览体验差。** Markdown 在 COS 上就是纯文本，没有格式渲染。HTML 文件直接下载，不会在浏览器里打开。想看渲染效果，得先下载到本地。

最关键的是，这种方式很零散。每个文件一个独立 URL，没有统一入口，看这个文件点一个链接，看那个文件又点另一个链接。

最后算了一下，每天生成几十个文件，一个月下来存储费加流量费也不少。关键是体验还不好，有点亏。

## 需求梳理

有了这些经验，我们停下来想了想，到底需要什么？

自动同步。Agent 生成文件后，不用人工介入，自动出现在预览平台上。

支持渲染。Markdown 能看到格式，HTML 能看到页面，图片能直接显示。

移动端友好。手机浏览器打开就能看，不用装 App。

零成本。个人项目，能不花钱就不花钱。

简单。配置越少越好，最好一键搞定。

顺着这些需求往下想，发现有个现成的方案被忽略了：GitHub Pages。

## 使用指南

### 三步快速上手

整个过程不用五分钟。

**第一步：Fork 仓库**

打开 https://github.com/jaguarliuu/OpenClaw-Lens，点 "Use this template" → "Create a new repository"。

**第二步：跑个脚本**

```bash
curl -fsSL https://raw.githubusercontent.com/jaguarliuu/OpenClaw-Lens/main/install.sh | bash
```

这个脚本会帮你：
- 把仓库 clone 到 `/opt/openclaw/kira/`
- 装好所有依赖
- 配置好 preview-sync Skill
- 推送到你的 GitHub

**第三步：开 GitHub Pages**

去仓库的 Settings → Pages，Source 选 "GitHub Actions"。

等一两分钟，打开 `https://你的用户名.github.io/仓库名/` 就能看到页面了。

---

### 日常怎么用

把文件同步到预览平台就一条命令：

```bash
# Kira 的文件
preview-sync /path/to/file.md kira

# Ha 的文件
preview-sync /path/to/article.md ha

# Hen 的文件
preview-sync /path/to/report.md hen
```

命令跑完后，文件会被复制到 `/opt/openclaw/kira/public/agents/{agent-name}/`，然后自动 git commit、git push。GitHub Actions 收到推送就会构建部署，一般一分钟左右网页就更新了。

---

### Agent 目录结构

每个 Agent 的文件放在各自目录下：

```
/opt/openclaw/kira/public/agents/
├── kira/     # Kira 的文件
├── ha/       # Ha 的文件
└── hen/      # Hen 的文件
```

想加个新 Agent 很简单，比如加个 "bob"：

```bash
mkdir /opt/openclaw/kira/public/agents/bob
preview-sync /path/to/file.md bob
```

不用改代码，不用改配置。

---

### 配置文件在哪

preview-sync 的配置写在 `~/.openclaw/openclaw.json` 里：

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "你的用户名/仓库名",
        "agentName": "默认的Agent名称"
      }
    }
  }
}
```

- `previewRepo`：填你的 GitHub 仓库，格式是 `username/repo`
- `agentName`：默认的 Agent 名，命令行可以覆盖

安装脚本会自动改这个文件，一般不用手动弄。真要改的话，用 `jq` 命令：

```bash
# 改仓库
jq '.skills.entries["preview-sync"].previewRepo = "newuser/newrepo"' \
  ~/.openclaw/openclaw.json > tmp.json && mv tmp.json ~/.openclaw/openclaw.json

# 改默认 Agent
jq '.skills.entries["preview-sync"].agentName = "ha"' \
  ~/.openclaw/openclaw.json > tmp.json && mv tmp.json ~/.openclaw/openclaw.json
```

---

### 支持哪些格式

**Markdown：** 支持 GFM 语法（表格、任务列表、删除线），代码块有语法高亮

**HTML：** 用 iframe 沙箱渲染，安全隔离

**图片：** PNG、JPG、GIF、SVG、WebP 都行，自适应显示

**代码文件：** 纯文本显示（以后可能会加 Monaco Editor）

每个文件旁边都有两个按钮：Raw 看原始内容，Download 下载到本地。

## 设计思路

GitHub Pages 大家都熟，免费、稳定、支持自定义域名、还有 CDN 加速。但以前从没想过用它做文件预览平台。

### 架构设计

整体架构很简单：

1. 建一个 GitHub 仓库，用 React + Vite 搭一个 Web 应用
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

### 技术栈选择

**前端框架：React 18 + Vite**

选 React 是因为生态成熟，组件库多。选 Vite 是因为快，开发体验好，HMR 基本秒开。

**样式方案：TailwindCSS v4**

TailwindCSS 写样式快，不用自己想 class 名字。v4 是最新版，性能更好。

**Markdown 渲染：react-markdown + remark-gfm + rehype-highlight**

react-markdown 是标准方案，生态完整。remark-gfm 支持 GitHub 风格 Markdown（表格、任务列表这些）。rehype-highlight 提供代码语法高亮。

**部署方案：GitHub Pages + GitHub Actions**

官方方案，免费稳定。每次 push 自动构建部署。

## 实现细节

### 样式系统

TailwindCSS v4 的配置方式有变化：

```css
/* v4 写法 */
@import "tailwindcss";
```

Typography 插件还没完全适配 v4，所以自己写了一套 CSS：

```css
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 700;
}

.markdown-body pre {
  background-color: #1f2937;
  padding: 1.5rem;
  border-radius: 0.5rem;
}
```

### Markdown 增强

react-markdown 默认只支持标准 Markdown，需要加插件：

```javascript
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>
  {content}
</ReactMarkdown>
```

### 用户体验

空状态得有友好提示：

```jsx
{agents.length === 0 ? (
  <div className="text-center py-8">
    <p>No agents yet</p>
    <p>Add files to public/agents/{'{agent-name}'}/</p>
  </div>
) : (
  // Agent 列表
)}
```

### 自动部署

GitHub Actions 配置：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    steps:
      - uses: actions/deploy-pages@v4
```

## 后续规划

现在这个版本已经够用了，但还有些想做的事：

**多主题支持。** 目前是黑白简约风格，后面可以加主题切换，支持深色模式。

**在线编辑。** 现在只能看，不能改。加个 Monaco Editor，就能在浏览器里直接改 Markdown 文件了。

**搜索功能。** 文件多了之后，需要全文搜索。

**版本历史。** GitHub 本身就有版本历史，可以在界面上加个按钮查看。

**权限控制。** 目前是公开仓库，所有人都能看。需要私有仓库的话，可以换成 GitHub 的私有 Pages。

## 总结

从手动 SSH 查看到腾讯云 COS，再到现在的 OpenClaw Lens，每一步都是在解决实际问题。

第一次尝试虽然不完美，但让我们看清了需求。第二次尝试功能更强，但成本和复杂度没控制好。第三次才找到真正合适的方案。

OpenClaw Lens 现在成了每天都会用的工具。Kira 写完文档，preview-sync 同步，刷新页面就能看到渲染效果。这种即时反馈，让工作流程顺畅了很多。

如果你也有类似需求，可以试试 OpenClaw Lens。Fork 仓库，跑个脚本，三分钟就能用起来。

---

**项目地址：** https://github.com/jaguarliuu/OpenClaw-Lens

**预览地址：** https://jaguarliuu.github.io/kira/

---

*本文档由 Kira 编写，记录了 OpenClaw 文件预览功能的演进过程。*
