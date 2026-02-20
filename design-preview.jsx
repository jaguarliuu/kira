import React, { useState, useEffect } from 'react';

/**
 * OpenClaw Preview - 主应用
 *
 * 设计风格：现代极简 + 技术感
 * - 色彩：深蓝 + 青色渐变
 * - 字体：JetBrains Mono + Inter
 * - 动效：流畅过渡 + 微妙的 hover 效果
 * - 布局：非对称网格 + 卡片式设计
 */

// 模拟数据
const MOCK_AGENTS = [
  {
    id: 'kira',
    name: 'Kira',
    emoji: '⚡',
    description: '主 AI 助手（技术向）',
    filesCount: 24,
    lastUpdate: '2 小时前',
    color: '#3B82F6'
  },
  {
    id: 'ha',
    name: '哈将',
    emoji: '📰',
    description: '自媒体总监',
    filesCount: 12,
    lastUpdate: '5 小时前',
    color: '#10B981'
  },
  {
    id: 'hen',
    name: '哼将',
    emoji: '🗿',
    description: '每日新闻报告',
    filesCount: 8,
    lastUpdate: '1 天前',
    color: '#F59E0B'
  }
];

const MOCK_FILES = [
  {
    name: 'chapter-01.md',
    type: 'markdown',
    size: '12.4 KB',
    updatedAt: '2 小时前'
  },
  {
    name: 'chapter-02.md',
    type: 'markdown',
    size: '8.7 KB',
    updatedAt: '3 小时前'
  },
  {
    name: 'index.html',
    type: 'html',
    size: '3.2 KB',
    updatedAt: '1 天前'
  },
  {
    name: 'cover.png',
    type: 'image',
    size: '245 KB',
    updatedAt: '2 天前'
  }
];

export default function App() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // 跟随系统主题
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
  }, []);

  const theme = {
    bg: darkMode ? '#0F172A' : '#F8FAFC',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    text: darkMode ? '#E2E8F0' : '#1E293B',
    textSecondary: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? '#334155' : '#E2E8F0',
    accent: '#3B82F6',
    accentHover: '#2563EB'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.border}`,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            O
          </div>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              OpenClaw Preview
            </h1>
            <p style={{
              fontSize: '12px',
              margin: 0,
              color: theme.textSecondary,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              v1.0.0
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search */}
          <div style={{
            position: 'relative',
            width: '240px'
          }}>
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                color: theme.text,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textSecondary
            }}>
              🔍
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: theme.text
            }}
          >
            ⚙️
          </a>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '280px',
          backgroundColor: darkMode ? '#0F172A' : '#F1F5F9',
          borderRight: `1px solid ${theme.border}`,
          padding: '24px 16px',
          overflowY: 'auto'
        }}>
          <div style={{
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: theme.textSecondary,
              marginBottom: '12px'
            }}>
              Agents
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MOCK_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: activeAgent?.id === agent.id ? theme.card : 'transparent',
                    border: `1px solid ${activeAgent?.id === agent.id ? agent.color : 'transparent'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: agent.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {agent.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '2px'
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme.textSecondary
                    }}>
                      {agent.filesCount} 文件
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            padding: '16px',
            backgroundColor: theme.card,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              fontSize: '12px',
              color: theme.textSecondary,
              marginBottom: '8px'
            }}>
              总计
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '4px'
            }}>
              44
            </div>
            <div style={{
              fontSize: '12px',
              color: theme.textSecondary
            }}>
              个文件
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          {!activeAgent ? (
            /* Welcome Screen */
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              paddingTop: '80px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px'
              }}>
                👋
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                欢迎使用 OpenClaw Preview
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.textSecondary,
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                选择左侧的 Agent 查看其工作区和输出文件
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginTop: '32px'
              }}>
                {MOCK_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setActiveAgent(agent)}
                    style={{
                      padding: '24px',
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '12px'
                    }}>
                      {agent.emoji}
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: theme.textSecondary,
                      marginBottom: '12px'
                    }}>
                      {agent.description}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme.textSecondary,
                      fontFamily: '"JetBrains Mono", monospace'
                    }}>
                      {agent.filesCount} 文件 · 更新于 {agent.lastUpdate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Agent Files */
            <div>
              <div style={{
                marginBottom: '32px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '32px' }}>{activeAgent.emoji}</span>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {activeAgent.name} 的工作区
                  </h2>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: theme.textSecondary,
                  margin: 0
                }}>
                  {activeAgent.description}
                </p>
              </div>

              {/* Files Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {MOCK_FILES.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px',
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '24px' }}>
                          {file.type === 'markdown' && '📄'}
                          {file.type === 'html' && '🌐'}
                          {file.type === 'image' && '🖼️'}
                        </span>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          fontFamily: '"JetBrains Mono", monospace'
                        }}>
                          {file.name}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: theme.textSecondary
                    }}>
                      <span>{file.size}</span>
                      <span>{file.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        button:hover {
          background-color: ${darkMode ? '#1E293B' : '#F1F5F9'} !important;
        }

        input:focus {
          border-color: ${theme.accent} !important;
        }

        @media (max-width: 768px) {
          aside {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
