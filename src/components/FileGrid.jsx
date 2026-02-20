import React from 'react'

export default function FileGrid({ files, onFileClick }) {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-2">No files yet</p>
        <p className="text-xs text-gray-400">
          Add files using preview-sync skill or manually to public/agents/{'{agent}'}/
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6">
      {files.map(file => (
        <div
          key={file.name}
          onClick={() => onFileClick(file)}
          className="p-6 border border-gray-200 cursor-pointer hover:border-black transition-colors"
        >
          <div className="font-mono text-sm mb-2 font-medium">
            {file.name}
          </div>
          <div className="text-xs text-gray-400">
            {formatSize(file.size)}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatSize(bytes) {
  if (!bytes) return 'Unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
