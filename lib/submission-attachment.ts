export const SUBMISSION_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024

export const SUBMISSION_ATTACHMENT_ACCEPT = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'text/plain',
  'text/csv',
  'application/json',
  'text/xml',
  'application/xml',
  '.asm,.s,.py,.js,.ts,.jsx,.tsx,.c,.cpp,.h,.hpp,.java,.go,.rs,.rb,.php',
  '.swift,.kt,.cs,.sh,.bash,.zsh,.ps1,.r,.sql,.md,.yaml,.yml,.toml,.f90',
].join(',')

const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.msi',
  '.scr',
  '.vbs',
  '.pif',
  '.com',
])

const CODE_EXTENSIONS = new Set([
  'py',
  'js',
  'ts',
  'jsx',
  'tsx',
  'c',
  'cpp',
  'h',
  'hpp',
  'java',
  'go',
  'rs',
  'rb',
  'php',
  'swift',
  'kt',
  'cs',
  'sh',
  'bash',
  'ps1',
  'r',
  'sql',
  'asm',
  's',
  'f90',
])

export type FileAttachment = {
  url: string
  fileName: string
  fileType: string
  fileSize: number
}

export type SubmissionAttachmentRow = {
  file_url?: string | null
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
}

export function submissionAttachmentFromRow(
  row: SubmissionAttachmentRow,
): FileAttachment | null {
  if (!row.file_url || !row.file_name || !row.file_type || row.file_size == null) {
    return null
  }

  return {
    url: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
  }
}

export function submissionAttachmentToFields(
  attachment?: FileAttachment,
): Record<string, string | number> {
  if (!attachment) return {}

  return {
    file_url: attachment.url,
    file_name: attachment.fileName,
    file_type: attachment.fileType,
    file_size: attachment.fileSize,
  }
}

function extensionFor(fileName: string): string {
  const dotIdx = fileName.lastIndexOf('.')
  return dotIdx !== -1 ? fileName.slice(dotIdx).toLowerCase() : ''
}

export function validateSubmissionAttachmentFile(file: {
  name: string
  size: number
}): string | null {
  if (file.size === 0) return 'No file provided'
  if (file.size > SUBMISSION_ATTACHMENT_MAX_BYTES) return 'File exceeds the 50 MB limit'
  if (BLOCKED_EXTENSIONS.has(extensionFor(file.name))) return 'File type not allowed'
  return null
}

export function safeSubmissionAttachmentName(fileName: string, now = Date.now()): string {
  return `${now}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
}

export function isImageAttachment(attachment: Pick<FileAttachment, 'fileType'>): boolean {
  return attachment.fileType.startsWith('image/')
}

export function submissionAttachmentIcon(mimeType: string, fileName?: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || fileName?.endsWith('.docx') || fileName?.endsWith('.doc')) return '📝'
  if (mimeType.includes('presentation') || fileName?.endsWith('.pptx') || fileName?.endsWith('.ppt')) return '📊'
  if (mimeType.includes('spreadsheet') || fileName?.endsWith('.xlsx') || fileName?.endsWith('.xls')) return '📈'
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('7z') || mimeType.includes('rar')) return '🗜️'
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) return '📃'

  const ext = fileName?.split('.').pop()?.toLowerCase()
  if (ext && CODE_EXTENSIONS.has(ext)) return '💻'

  return '📁'
}

export function formatAttachmentBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
