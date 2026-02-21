# OpenClaw 群聊协作配置指南

最近 OpenClaw 上了热搜——OpenAI 把它的创始人挖走了。

很多人第一次听说这东西。简单说，这是一个开源的 AI Agent 框架，跑在你自己的机器上，能连各种聊天软件（Telegram、Discord、WhatsApp 都行），帮你干各种自动化的事。

我用了两个月，踩了不少坑。这篇文章是配置多角色协作的完整记录。

---

## 为什么要在群里放多个 AI？

起因很简单。

我之前用一个 AI 干所有事——早上帮我整理技术新闻，下午写公众号文章。但写着写着就发现问题：这货早上刚看完日报，脑子里全是"阿里发布新模型""Anthropic 拿了300亿融资"，转头就要写营销文案，风格拧巴得不行。

后来我想，能不能像公司一样分工？

OpenClaw 支持创建多个独立的 Agent。每个有自己的工作目录、人格设定、权限控制。我搞了两个：

- 哼将：负责日报、日常事务
- 哈将：负责自媒体运营

两个都有各自的 Telegram Bot，都待在同一个群里。

---

## 配置步骤

### 1. 创建 Agent

```bash
openclaw agents add hen
openclaw agents add ha
```

这会创建独立的目录和工作空间：

```
~/.openclaw/agents/hen/
~/.openclaw/agents/ha/
~/.openclaw/workspace-hen/
~/.openclaw/workspace-ha/
```

### 2. 配置 Telegram Bot

你需要从 @BotFather 申请两个 Bot Token。

编辑 `~/.openclaw/openclaw.json`：

```json5
{
  agents: {
    list: [
      { id: "hen", workspace: "~/.openclaw/workspace-hen" },
      { id: "ha", workspace: "~/.openclaw/workspace-ha" }
    ]
  },

  bindings: [
    { agentId: "hen", match: { channel: "telegram", accountId: "hen" } },
    { agentId: "ha", match: { channel: "telegram", accountId: "ha" } }
  ],

  channels: {
    telegram: {
      enabled: true,
      accounts: {
        hen: {
          botToken: "你的第一个Bot Token",
          groups: { "-群组ID": { enabled: true } }
        },
        ha: {
          botToken: "你的第二个Bot Token",
          groups: { "-群组ID": { enabled: true } }
        }
      }
    }
  }
}
```

### 3. 开启 Agent 间通讯

这是最容易漏的一步。

默认情况下，Agent 之间不能互相发消息。你得显式配置：

```json5
{
  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["hen", "ha"]
    },
    sessions: {
      visibility: "all"
    }
  }
}
```

不开这个，哼将想通知哈将干活，直接报错。

### 4. 重启生效

```bash
openclaw gateway restart
```

### 5. 在群里激活

分别在群里 @ 两个 Bot，让它们上线：

```
@your_hen_bot 你好
@your_ha_bot 你好
```

---

## 踩过的坑

### 坑 1：Agent 之间发消息报错

错误信息：`Session send visibility is restricted`

原因：`tools.sessions.visibility` 没配置。

解决：加上 `"visibility": "all"`。

### 坑 2：不在白名单里

错误信息：`Agent not in allowlist`

原因：`agentToAgent.allow` 没把目标 Agent 加进去。

解决：把所有需要互发的 Agent ID 都列出来。

### 坑 3：Bot @ Bot 不触发

你用一个 Bot 的身份 @ 另一个 Bot，对方不会收到通知。

这是 Telegram 的机制，防止 Bot 互相刷屏。

解决：用 OpenClaw 的 `sessions_send` 工具发消息，或者让人类用户 @。

### 坑 4：私信没反应

Agent 在群里回复得很积极，但你私信它就没动静。

这是 OpenClaw 的设计——Agent 同一时间只能"专注"在一个对话里。

不是 bug，是特性。接受就好。

### 坑 5：看不到 Agent 之间的消息

用 `sessions_send` 发的消息，在 Telegram 里看不到。

因为这走的是 OpenClaw 内部通道，不是 Telegram 消息。

解决：如果需要透明度，用 `message` 工具在群里发。

---

## 协作流程

现在我的日常工作流是这样的：

1. 早上 9 点，哼将自动发日报到群里
2. 我说"找一篇适合发公众号的"，哼将选好内容
3. 哼将用 `message` 工具在群里 @ 哈将，把选题发过去
4. 哈将写好草稿，在群里 @ 我审核
5. 我确认后，哈将发布

整个过程我可能只说一两句话，剩下的它们自己协调。

---

## 完整配置模板

```json5
// ~/.openclaw/openclaw.json
{
  agents: {
    list: [
      {
        id: "hen",
        workspace: "~/.openclaw/workspace-hen",
        agentDir: "~/.openclaw/agents/hen/agent"
      },
      {
        id: "ha",
        workspace: "~/.openclaw/workspace-ha",
        agentDir: "~/.openclaw/agents/ha/agent"
      }
    ]
  },

  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["hen", "ha"]
    },
    sessions: {
      visibility: "all"
    }
  },

  bindings: [
    { agentId: "hen", match: { channel: "telegram", accountId: "hen" } },
    { agentId: "ha", match: { channel: "telegram", accountId: "ha" } }
  ],

  channels: {
    telegram: {
      enabled: true,
      dmPolicy: "pairing",
      groupPolicy: "allowlist",
      accounts: {
        hen: {
          botToken: "123456:ABC...",
          groups: { "-1001234567890": { enabled: true } }
        },
        ha: {
          botToken: "654321:XYZ...",
          groups: { "-1001234567890": { enabled: true } }
        }
      }
    }
  }
}
```

---

## 小结

OpenClaw 的多 Agent 功能确实强大，但配置过程有几个容易被忽略的地方：

- `agentToAgent` 默认关闭
- `sessions.visibility` 需要显式开启
- Bot 之间 @ 不会触发（Telegram 限制）
- Agent 同时只能专注一个对话

把这些搞定，就能跑起来一个像模像样的 AI 团队了。

有问题可以去 [OpenClaw 文档](https://docs.openclaw.ai) 或者 [GitHub](https://github.com/openclaw/openclaw) 看看。
