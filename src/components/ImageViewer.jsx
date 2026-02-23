import React from 'react'

export default function ImageViewer({ url }) {
  return (
    <div className="p-8 text-center">
      <img src={url} alt="Preview" className="max-w-full h-auto mx-auto" />
    </div>
  )
}
