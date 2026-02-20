import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export default function MarkdownViewer({ content }) {
  return (
    <div className="markdown-body p-8 bg-white">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      />
      <style>{`
        .markdown-body {
          font-family: 'Inter', -apple-system, sans-serif;
          line-height: 1.8;
          color: #1f2937;
          max-width: 900px;
          margin: 0 auto;
        }

        /* 标题样式 */
        .markdown-body h1, .markdown-body h2, .markdown-body h3,
        .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          font-family: 'Crimson Pro', Georgia, serif;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #000;
        }

        .markdown-body h1 {
          font-size: 2.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .markdown-body h2 {
          font-size: 1.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .markdown-body h3 {
          font-size: 1.5rem;
        }

        .markdown-body h4 {
          font-size: 1.25rem;
        }

        /* 段落 */
        .markdown-body p {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        /* 列表 */
        .markdown-body ul, .markdown-body ol {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .markdown-body ul {
          list-style-type: disc;
        }

        .markdown-body ol {
          list-style-type: decimal;
        }

        .markdown-body li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* 行内代码 */
        .markdown-body code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
          color: #ef4444;
        }

        /* 代码块 */
        .markdown-body pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .markdown-body pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
        }

        /* 高亮主题 */
        .markdown-body .hljs {
          background: #1f2937 !important;
        }

        /* 链接 */
        .markdown-body a {
          color: #3b82f6;
          text-decoration: underline;
          font-weight: 500;
        }

        .markdown-body a:hover {
          color: #2563eb;
        }

        /* 引用 */
        .markdown-body blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }

        /* 表格 */
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          display: block;
          overflow-x: auto;
        }

        .markdown-body th, .markdown-body td {
          border: 1px solid #d1d5db;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .markdown-body th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #000;
        }

        .markdown-body tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .markdown-body tr:hover {
          background-color: #f3f4f6;
        }

        /* 分割线 */
        .markdown-body hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 3rem 0;
        }

        /* 强调 */
        .markdown-body strong {
          font-weight: 700;
          color: #000;
        }

        .markdown-body em {
          font-style: italic;
        }

        /* 图片 */
        .markdown-body img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }

        /* 任务列表 */
        .markdown-body input[type="checkbox"] {
          margin-right: 0.5rem;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
