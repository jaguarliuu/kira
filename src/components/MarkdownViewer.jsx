import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownViewer({ content }) {
  return (
    <div className="prose prose-lg max-w-none p-8 bg-white">
      <style>{`
        .prose {
          font-family: 'Inter', -apple-system, sans-serif;
          line-height: 1.8;
          color: #1f2937;
        }

        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          font-family: 'Crimson Pro', Georgia, serif;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #000;
        }

        .prose h1 {
          font-size: 2.25rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .prose h2 {
          font-size: 1.75rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .prose h3 {
          font-size: 1.5rem;
        }

        .prose h4 {
          font-size: 1.25rem;
        }

        .prose p {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .prose ul, .prose ol {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .prose ul {
          list-style-type: disc;
        }

        .prose ol {
          list-style-type: decimal;
        }

        .prose li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .prose code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
          color: #ef4444;
        }

        .prose pre {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
        }

        .prose a {
          color: #3b82f6;
          text-decoration: underline;
          font-weight: 500;
        }

        .prose a:hover {
          color: #2563eb;
        }

        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }

        .prose th, .prose td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .prose th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .prose tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .prose hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 3rem 0;
        }

        .prose strong {
          font-weight: 700;
          color: #000;
        }

        .prose em {
          font-style: italic;
        }

        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
      `}</style>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
