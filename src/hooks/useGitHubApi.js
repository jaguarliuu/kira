import { useState } from 'react'
import { fetchFromGitHub, fetchFileContent } from '../utils/github'

export function useGitHubApi(owner, repo) {
  const [agents, setAgents] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAgents = async () => {
    setLoading(true)
    try {
      const data = await fetchFromGitHub(
        `/repos/${owner}/${repo}/contents/public/agents`
      )
      setAgents(data.filter(item => item.type === 'dir'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getFiles = async (agentName) => {
    setLoading(true)
    try {
      const data = await fetchFromGitHub(
        `/repos/${owner}/${repo}/contents/public/agents/${agentName}`
      )
      setFiles(data.filter(item => item.type === 'file'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getFileContent = async (agentName, filename) => {
    return await fetchFileContent(
      `/repos/${owner}/${repo}/contents/public/agents/${agentName}/${filename}`
    )
  }

  return {
    agents,
    files,
    loading,
    error,
    getAgents,
    getFiles,
    getFileContent
  }
}
