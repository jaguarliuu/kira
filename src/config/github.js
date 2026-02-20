// 从环境变量或 Vite 配置读取
// 开发时从 .env.local 读取
// 生产时从 GitHub Pages URL 自动推断

function getGitHubConfig() {
  // 生产环境：从当前 URL 推断
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const pathname = window.location.pathname;
    // URL 格式：https://username.github.io/repo-name/
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const repoName = parts[0];
      const hostname = window.location.hostname;
      const owner = hostname.replace('.github.io', '');
      return { owner, repo: repoName };
    }
  }

  // 开发环境：从环境变量读取
  return {
    owner: import.meta.env.VITE_GITHUB_OWNER || 'jaguarliuu',
    repo: import.meta.env.VITE_GITHUB_REPO || 'OpenClaw-Lens'
  };
}

export const GITHUB_OWNER = getGitHubConfig().owner;
export const GITHUB_REPO = getGitHubConfig().repo;
