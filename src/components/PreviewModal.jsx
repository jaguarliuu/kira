import React from 'react'
import { getFileType } from '../utils/fileType'
import MarkdownViewer from './MarkdownViewer'
import HtmlViewer from './HtmlViewer'
import ImageViewer from './ImageViewer'

export default function PreviewModal({ file, content, onClose }) {
  if (!file) return null

  const fileType = getFileType(file.name)

  const handleRaw = () => {
    // 在新标签页打开原始内容
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const handleDownload = () => {
    // 下载文件
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 p-8 overflow-y-auto flex justify-center items-start"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
          <div className="font-mono text-sm font-semibold">{file.name}</div>
          <div className="flex gap-2">
            <button
              onClick={handleRaw}
              className="px-4 py-2 text-sm border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors"
            >
              Raw
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-black text-white border border-black hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div id="preview-content">
          {fileType === 'markdown' && <MarkdownViewer content={content} />}
          {fileType === 'html' && <HtmlViewer content={content} />}
          {fileType === 'image' && <ImageViewer url={file.download_url} />}
        </div>
      </div>
    </div>
  )
}
