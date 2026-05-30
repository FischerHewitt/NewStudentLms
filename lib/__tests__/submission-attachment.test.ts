import { describe, expect, it } from 'vitest'
import {
  formatAttachmentBytes,
  safeSubmissionAttachmentName,
  submissionAttachmentFromRow,
  submissionAttachmentIcon,
  submissionAttachmentToFields,
  validateSubmissionAttachmentFile,
} from '@/lib/submission-attachment'

describe('submissionAttachmentFromRow', () => {
  it('projects DB attachment columns into the UI shape', () => {
    expect(
      submissionAttachmentFromRow({
        file_url: 'https://example.com/report.pdf',
        file_name: 'report.pdf',
        file_type: 'application/pdf',
        file_size: 1234,
      }),
    ).toEqual({
      url: 'https://example.com/report.pdf',
      fileName: 'report.pdf',
      fileType: 'application/pdf',
      fileSize: 1234,
    })
  })

  it('returns null when any attachment column is missing', () => {
    expect(submissionAttachmentFromRow({ file_url: 'https://example.com/report.pdf' })).toBeNull()
  })
})

describe('submissionAttachmentToFields', () => {
  it('maps a FileAttachment back to DB fields', () => {
    expect(
      submissionAttachmentToFields({
        url: 'https://example.com/report.pdf',
        fileName: 'report.pdf',
        fileType: 'application/pdf',
        fileSize: 1234,
      }),
    ).toEqual({
      file_url: 'https://example.com/report.pdf',
      file_name: 'report.pdf',
      file_type: 'application/pdf',
      file_size: 1234,
    })
  })
})

describe('validateSubmissionAttachmentFile', () => {
  it('rejects empty files', () => {
    expect(validateSubmissionAttachmentFile({ name: 'empty.txt', size: 0 })).toBe('No file provided')
  })

  it('rejects blocked executable extensions', () => {
    expect(validateSubmissionAttachmentFile({ name: 'malware.exe', size: 10 })).toBe('File type not allowed')
  })

  it('allows ordinary academic files under the size limit', () => {
    expect(validateSubmissionAttachmentFile({ name: 'essay.pdf', size: 1024 })).toBeNull()
  })
})

describe('submissionAttachment display helpers', () => {
  it('sanitizes storage object names', () => {
    expect(safeSubmissionAttachmentName('my essay (final).pdf', 1000)).toBe('1000-my_essay__final_.pdf')
  })

  it('formats bytes for display', () => {
    expect(formatAttachmentBytes(512)).toBe('512 B')
    expect(formatAttachmentBytes(2048)).toBe('2.0 KB')
  })

  it('uses file extension fallback for code files', () => {
    expect(submissionAttachmentIcon('application/octet-stream', 'main.ts')).toBe('💻')
  })
})
