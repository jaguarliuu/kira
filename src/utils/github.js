const GITHUB_API = 'https://api.github.com'

export async function fetchFromGitHub(path) {
  const response = await fetch(`${GITHUB_API}${path}`)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.json()
}

export async function fetchFileContent(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: 'application/vnd.github.v3.raw' }
  })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  return response.text()
}
