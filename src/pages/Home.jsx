import React, { useState, useEffect } from 'react'
import { useGitHubApi } from '../hooks/useGitHubApi'
import Sidebar from '../components/Sidebar'
import FileGrid from '../components/FileGrid'
import PreviewModal from '../components/PreviewModal'
import { GITHUB_OWNER, GITHUB_REPO } from '../config/github'

export default function Home() {
  const { agents, files, loading, error, getAgents, getFiles, getFileContent } =
    useGitHubApi(GITHUB_OWNER, GITHUB_REPO)

  const [activeAgent, setActiveAgent] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => {
    getAgents()
  }, [])

  const handleSelectAgent = (agentId) => {
    setActiveAgent(agentId)
    getFiles(agentId)
  }

  const handleFileClick = async (file) => {
    setSelectedFile(file)
    setContentLoading(true)
    try {
      const content = await getFileContent(activeAgent, file.name)
      setFileContent(content)
    } catch (e) {
      setFileContent('Error loading file content')
    } finally {
      setContentLoading(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedFile(null)
    setFileContent(null)
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        activeAgent={activeAgent}
        agents={agents}
        onSelectAgent={handleSelectAgent}
      />

      <main className="flex-1 p-16 max-w-4xl overflow-y-auto">
        {!activeAgent ? (
          // 欢迎页面
          <div className="text-center py-16">
            <h1 className="font-serif text-4xl font-semibold tracking-tight mb-4">
              Welcome to OpenClaw Lens
            </h1>
            <p className="text-gray-600 mb-8">
              {agents.length > 0
                ? 'Select an agent from the sidebar to view their files'
                : 'No agents found. Start by syncing files with preview-sync skill'}
            </p>

            {loading && <p className="text-gray-400">Loading...</p>}
            {error && (
              <div className="mt-8 p-4 bg-gray-100 rounded">
                <p className="text-sm text-gray-600 mb-2">Setup Guide:</p>
                <ol className="text-left text-sm text-gray-500 space-y-1">
                  <li>1. Use preview-sync to add files to public/agents/</li>
                  <li>2. Push changes to GitHub</li>
                  <li>3. Refresh this page</li>
                </ol>
              </div>
            )}

            {agents.length === 0 && !loading && !error && (
              <div className="mt-8 text-sm text-gray-400">
                <p>Repository: {GITHUB_OWNER}/{GITHUB_REPO}</p>
                <p className="mt-2">
                  Add files to <code className="bg-gray-100 px-2 py-1 rounded">public/agents/</code> to get started
                </p>
              </div>
            )}
          </div>
        ) : (
          // Agent 文件页面
          <div>
            <div className="mb-16">
              <h1 className="font-serif text-4xl font-semibold tracking-tight mb-2">
                {activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1)}
              </h1>
              <p className="text-gray-600">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </p>
            </div>

            {loading && <p className="text-gray-400">Loading files...</p>}

            {!loading && files.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">No files in this agent</p>
                <p className="text-sm text-gray-400">
                  Use preview-sync to add files
                </p>
              </div>
            )}

            {!loading && files.length > 0 && (
              <FileGrid files={files} onFileClick={handleFileClick} />
            )}
          </div>
        )}
      </main>

      <PreviewModal
        file={selectedFile}
        content={fileContent}
        loading={contentLoading}
        onClose={handleCloseModal}
      />
    </div>
  )
}
