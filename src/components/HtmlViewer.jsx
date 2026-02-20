import React from 'react'

export default function HtmlViewer({ content }) {
  return (
    <div className="p-8">
      <iframe
        srcDoc={content}
        className="w-full h-[500px] border border-gray-200"
        sandbox="allow-same-origin"
      />
    </div>
  )
}
