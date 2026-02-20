# OpenClaw Lens 使用指南

## 项目信息

- **项目根目录**: `/opt/openclaw/kira`
- **GitHub 仓库**: https://github.com/jaguarliuu/kira
- **预览地址**: https://jaguarliuu.github.io/kira/

## Skill 信息

- **Skill 名称**: `preview-sync`
- **全局命令**: `preview-sync` (已安装到 /usr/local/bin/)

## 使用方法

### 1. 配置 Agent

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "skills": {
    "entries": {
      "preview-sync": {
        "enabled": true,
        "previewRepo": "jaguarliuu/kira",
        "agentName": "你的Agent名称"
      }
    }
  }
}
```

### 2. 同步文件

```bash
# 方式 1: 使用默认 Agent 名称（从配置读取）
preview-sync /path/to/file.md

# 方式 2: 指定 Agent 名称
preview-sync /path/to/file.md kira
preview-sync /path/to/report.md hen
preview-sync /path/to/article.md ha
```

### 3. 查看预览

等待 1-2 分钟后，访问：
https://jaguarliuu.github.io/kira/

## 支持的文件格式

- ✅ Markdown (.md) - 自动渲染
- ✅ HTML (.html) - iframe 预览
- ✅ 图片 (.png, .jpg, .gif, .svg)
- ✅ 代码文件 (.js, .py, .java)

## 目录结构

```
/opt/openclaw/kira/
├── public/
│   └── agents/
│       ├── kira/     # Kira 的文件
│       ├── ha/       # Ha 的文件
│       └── hen/      # Hen 的文件
├── skill/
│   └── preview-sync.sh
└── src/              # React 源码
```

## 注意事项

1. **项目根目录固定**: `/opt/openclaw/kira`（不要修改）
2. **自动推送**: 文件会自动提交到 GitHub 并触发部署
3. **1-2 分钟生效**: GitHub Actions 构建需要时间

## 故障排除

### 问题 1: 命令找不到
```bash
which preview-sync
# 应该输出: /usr/local/bin/preview-sync
```

### 问题 2: 权限错误
```bash
chmod +x /opt/openclaw/kira/skill/preview-sync.sh
```

### 问题 3: Git 推送失败
检查 SSH 密钥配置：
```bash
ssh -T git@github.com
```

---
*更新时间: 2026-02-20 21:32 GMT+8*
