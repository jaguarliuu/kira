export function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (['md', 'markdown'].includes(ext)) return 'markdown'
  if (['html', 'htm'].includes(ext)) return 'html'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  if (['json', 'js', 'jsx', 'ts', 'tsx', 'py', 'java'].includes(ext)) return 'code'
  return 'text'
}

export function getFileIcon(type) {
  switch (type) {
    case 'markdown': return 'M'
    case 'html': return 'H'
    case 'image': return 'I'
    case 'code': return 'C'
    default: return 'T'
  }
}
