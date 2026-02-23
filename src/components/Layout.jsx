import React from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <div className="font-serif text-xl font-semibold tracking-tight">
          OpenClaw <span className="font-normal text-gray-400">Preview</span>
        </div>
        <nav className="flex gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-black">Agents</a>
          <a href="#" className="hover:text-black">Files</a>
          <a href="#" className="hover:text-black">Settings</a>
        </nav>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-16 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  )
}
