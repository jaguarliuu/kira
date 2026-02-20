import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownViewer({ content }) {
  return (
    <div className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
